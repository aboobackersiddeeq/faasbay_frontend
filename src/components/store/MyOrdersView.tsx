import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  ChevronRight,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { fetchMyOrders, type MyOrder } from "@/lib/customer-account";

interface MyOrdersViewProps {
  phone?: string;
  email?: string;
  onBack: () => void;
}

const STATUS_STYLES: Record<string, { badge: string; icon: React.ElementType }> = {
  Processing: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", icon: Clock },
  Shipped: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", icon: Truck },
  Dispatched: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", icon: Truck },
  "Out for Delivery": { badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", icon: Truck },
  Delivered: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", icon: CheckCircle2 },
  Cancelled: { badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400", icon: XCircle },
};

function statusStyle(status: string) {
  return STATUS_STYLES[status] || { badge: "bg-secondary text-foreground", icon: Package };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function MyOrdersView({ phone, email, onBack }: MyOrdersViewProps) {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<MyOrder | null>(null);

  const load = () => {
    setIsLoading(true);
    setError("");
    fetchMyOrders(phone, email)
      .then(setOrders)
      .catch(() => setError("Could not load your orders right now. Please try again."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, email]);

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return (
    <div className="flex flex-col max-h-[80vh]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06] dark:border-white/10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to account"
          className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-secondary active:scale-90 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h3 className="font-display font-black text-sm text-foreground">My Orders & Tracking</h3>
      </div>

      <div className="p-5 space-y-3 overflow-y-auto">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-secondary/60 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs font-semibold text-rose-500">{error}</p>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5b6a07] dark:text-[#B0CB1F] hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-neutral-400">
              <Package className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-foreground">No orders yet</p>
            <p className="text-[11px] text-neutral-500">Your orders will show up here once you place one.</p>
          </div>
        )}

        {!isLoading &&
          !error &&
          orders.map((order) => {
            const { badge, icon: StatusIcon } = statusStyle(order.orderStatus);
            const firstItem = order.items[0];
            return (
              <button
                key={order.orderId}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:bg-secondary/40 transition-colors text-left cursor-pointer"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary overflow-hidden">
                  {firstItem?.image ? (
                    <img src={firstItem.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-4.5 w-4.5 text-neutral-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground truncate">#{order.orderId}</span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold ${badge}`}>
                      <StatusIcon className="h-2.5 w-2.5" />
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-neutral-500 truncate">
                    {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ₹
                    {order.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
              </button>
            );
          })}
      </div>
    </div>
  );
}

function OrderDetail({ order, onBack }: { order: MyOrder; onBack: () => void }) {
  const { badge, icon: StatusIcon } = statusStyle(order.orderStatus);
  const address = order.shippingAddress;

  return (
    <div className="flex flex-col max-h-[80vh]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06] dark:border-white/10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to orders"
          className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-secondary active:scale-90 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h3 className="font-display font-black text-sm text-foreground truncate">#{order.orderId}</h3>
          <p className="text-[10.5px] text-neutral-500">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto">
        {/* Status + tracking */}
        <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${badge}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {order.orderStatus}
            </span>
            {order.trackingNumber && (
              <span className="text-[10.5px] font-mono text-neutral-500">{order.trackingNumber}</span>
            )}
          </div>
          {order.courier && (
            <p className="text-[11px] text-neutral-500">
              Shipped via <span className="font-semibold text-foreground">{order.courier}</span>
            </p>
          )}

          {/* Timeline */}
          {order.timeline?.length > 0 && (
            <div className="pt-1 space-y-0">
              {order.timeline.map((entry, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                        idx === order.timeline.length - 1
                          ? "bg-[#B0CB1F] text-slate-950"
                          : "bg-secondary text-neutral-400"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                    {idx < order.timeline.length - 1 && <span className="w-px flex-1 bg-border min-h-[18px]" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-bold text-foreground">{entry.status}</p>
                    {entry.note && <p className="text-[10.5px] text-neutral-500">{entry.note}</p>}
                    <p className="text-[10px] text-neutral-400">{entry.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Items</p>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/40">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-4 w-4 text-neutral-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                <p className="text-[10.5px] text-neutral-500">Qty {item.quantity} · ₹{item.unitPrice.toLocaleString("en-IN")}</p>
              </div>
              <span className="text-xs font-bold text-foreground shrink-0">₹{item.total.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>

        {/* Delivery address */}
        {address && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Delivery Address</p>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/40">
              <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <p className="text-xs text-foreground leading-relaxed">
                {address.name && <span className="font-bold">{address.name}</span>}
                {address.name && <br />}
                {[address.street, address.city, address.state, address.pincode].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Bill summary */}
        <div className="space-y-1.5 pt-1 border-t border-black/[0.06] dark:border-white/10">
          <div className="flex justify-between text-[11px] text-neutral-500">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[11px] text-emerald-600">
              <span>Discount</span>
              <span>-₹{order.discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-[11px] text-neutral-500">
            <span>Shipping</span>
            <span>{order.shippingFee > 0 ? `₹${order.shippingFee.toLocaleString("en-IN")}` : "Free"}</span>
          </div>
          <div className="flex justify-between text-xs font-black text-foreground pt-1">
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <p className="text-[10.5px] text-neutral-500 pt-1">
            {order.paymentMethod} · <span className="font-semibold">{order.paymentStatus}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

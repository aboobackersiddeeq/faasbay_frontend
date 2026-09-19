// ============================================================================
// FaasBay Commerce OS — Inventory Management (Stock Levels & Traceable Movements)
// ============================================================================
import React, { useState, useEffect } from "react";
import { Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Plus, Minus, RotateCcw, Truck, Wrench, Edit3, History, ShieldAlert, CheckCircle2 } from "lucide-react";
import { DataTable, StatusBadge, PageHeader, KPICard, Card, Btn, TabSwitcher, SlideOver, FormField, Input, Select, Textarea, formatCurrency, formatNumber } from "./shared/components";
import { useStoreProducts, type Product } from "@/components/store/data";

interface InventoryItem {
  id: string;
  title: string;
  sku: string;
  category: string;
  stock: number;
  reserved: number;
  available: number;
  incoming: number;
  lowThreshold: number;
  status: string;
  image: string;
  price: number;
}

const parseNumericPrice = (p: string | number | undefined): number => {
  if (typeof p === "number") return p;
  return parseFloat(String(p || "").replace(/[^0-9.]/g, "")) || 2999;
};

/** Builds the inventory table rows from the live catalog. */
const toInventoryItems = (products: Product[]): InventoryItem[] => products.map((p, i) => {
  const numPrice = parseNumericPrice(p.price);
  const stockVal = p.stock ?? 0;
  return {
    id: p.id,
    title: p.title,
    sku: `FB-SKU-${String(i + 101).padStart(4, "0")}`,
    category: p.category,
    stock: stockVal,
    reserved: 0,
    available: stockVal,
    incoming: 0,
    lowThreshold: 5,
    status: stockVal <= 0 ? "Out of Stock" : stockVal <= 5 ? "Low Stock" : "In Stock",
    image: p.image,
    price: numPrice,
  };
});

export interface StockMovement {
  id: string;
  date: string;
  product: string;
  sku: string;
  type: "Sale" | "Purchase" | "Adjustment" | "Return" | "Damage";
  previous: number;
  change: number;
  current: number;
  reason: string;
  staff: string;
}

const initMovements: StockMovement[] = [];

export default function Inventory() {
  // Inventory mirrors the catalog in MongoDB; it is re-derived whenever it changes.
  const storeProducts = useStoreProducts();
  const [items, setItems] = useState<InventoryItem[]>(() => toInventoryItems(storeProducts));

  useEffect(() => {
    setItems(toInventoryItems(storeProducts));
  }, [storeProducts]);
  const [movements, setMovements] = useState<StockMovement[]>(initMovements);
  const [tab, setTab] = useState("overview");

  // Adjustment Modal State
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>("Physical count audit");
  const [adjustStaff, setAdjustStaff] = useState<string>("FaasBay Admin");

  const totalStock = items.reduce((s, i) => s + i.stock, 0);
  const lowStock = items.filter((i) => i.status === "Low Stock").length;
  const outOfStock = items.filter((i) => i.status === "Out of Stock").length;
  const totalValue = items.reduce((s, i) => s + i.stock * i.price, 0);

  const handleAdjustSubmit = () => {
    if (!adjustTarget || adjustDelta === 0) {
      setAdjustTarget(null);
      return;
    }

    const previousStock = adjustTarget.stock;
    const newStock = Math.max(0, previousStock + adjustDelta);
    const newAvailable = Math.max(0, newStock - adjustTarget.reserved);
    const newStatus = newStock <= 0 ? "Out of Stock" : newStock <= adjustTarget.lowThreshold ? "Low Stock" : "In Stock";

    // Update Item
    setItems((prev) =>
      prev.map((i) =>
        i.id === adjustTarget.id
          ? {
              ...i,
              stock: newStock,
              available: newAvailable,
              status: newStatus,
            }
          : i
      )
    );

    // Record Traceable Movement
    const newMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      date: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      product: adjustTarget.title,
      sku: adjustTarget.sku,
      type: adjustDelta > 0 ? "Adjustment" : "Damage",
      previous: previousStock,
      change: adjustDelta,
      current: newStock,
      reason: adjustReason,
      staff: adjustStaff,
    };

    setMovements([newMovement, ...movements]);
    setAdjustTarget(null);
    setAdjustDelta(0);
  };

  const inventoryColumns = [
    {
      key: "title",
      label: "Product",
      width: "35%",
      render: (i: InventoryItem) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80">
            <img src={i.image} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{i.title}</div>
            <div className="text-[10px] text-slate-400 font-mono">{i.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: "stock",
      label: "On Hand",
      sortable: true,
      render: (i: InventoryItem) => (
        <span className="text-xs font-bold text-slate-900">{i.stock}</span>
      ),
    },
    {
      key: "reserved",
      label: "Reserved",
      render: (i: InventoryItem) => (
        <span className="text-xs text-slate-500">{i.reserved}</span>
      ),
    },
    {
      key: "available",
      label: "Available",
      sortable: true,
      render: (i: InventoryItem) => (
        <span className="text-xs text-emerald-700 font-bold">{i.available}</span>
      ),
    },
    {
      key: "incoming",
      label: "Incoming PO",
      render: (i: InventoryItem) => (
        <span className={`text-xs ${i.incoming > 0 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
          {i.incoming > 0 ? `+${i.incoming}` : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (i: InventoryItem) => <StatusBadge status={i.status} size="xs" />,
    },
  ];

  const movementColumns = [
    {
      key: "date",
      label: "Timestamp",
      render: (m: StockMovement) => <span className="text-xs text-slate-500 font-medium">{m.date}</span>,
    },
    {
      key: "product",
      label: "Product & SKU",
      render: (m: StockMovement) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">{m.product}</div>
          <div className="text-[10px] text-slate-400 font-mono">{m.sku}</div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Event Type",
      render: (m: StockMovement) => (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            m.type === "Sale"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : m.type === "Purchase"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : m.type === "Return"
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-purple-50 text-purple-700 border border-purple-200"
          }`}
        >
          {m.type}
        </span>
      ),
    },
    {
      key: "previous",
      label: "Prev",
      render: (m: StockMovement) => <span className="text-xs text-slate-500">{m.previous}</span>,
    },
    {
      key: "change",
      label: "Adjustment",
      render: (m: StockMovement) => (
        <span className={`text-xs font-bold ${m.change > 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {m.change > 0 ? `+${m.change}` : m.change}
        </span>
      ),
    },
    {
      key: "current",
      label: "New Stock",
      render: (m: StockMovement) => <span className="text-xs font-bold text-slate-900">{m.current}</span>,
    },
    {
      key: "reason",
      label: "Audit Reason",
      render: (m: StockMovement) => <span className="text-xs text-slate-600">{m.reason}</span>,
    },
    {
      key: "staff",
      label: "Logged By",
      render: (m: StockMovement) => <span className="text-xs text-slate-500">{m.staff}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory & Stock Levels"
        subtitle="Real-time stock monitoring, threshold alerts, and traceable audit trail"
        breadcrumbs={[{ label: "Catalog" }, { label: "Inventory" }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Units" value={formatNumber(totalStock)} icon={<Package size={16} className="text-emerald-600" />} />
        <KPICard title="Low Stock Alerts" value={String(lowStock)} icon={<AlertTriangle size={16} className="text-amber-500" />} changeLabel="items" />
        <KPICard title="Out of Stock" value={String(outOfStock)} icon={<ShieldAlert size={16} className="text-rose-500" />} />
        <KPICard title="Inventory Valuation" value={formatCurrency(totalValue)} icon={<ArrowUpRight size={16} className="text-emerald-600" />} />
      </div>

      <TabSwitcher
        tabs={[
          { key: "overview", label: "Stock Levels & Adjustment", count: items.length },
          { key: "movements", label: "Traceable Movement Logs", count: movements.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "overview" && (
        <DataTable
          columns={inventoryColumns}
          data={items}
          keyField="id"
          searchPlaceholder="Search inventory by title or SKU..."
          pageSize={10}
          exportable
          exportFilename="faasbay_inventory_stock.csv"
          actions={(i: InventoryItem) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => {
                  setAdjustTarget(i);
                  setAdjustDelta(0);
                  setAdjustReason("Physical count audit");
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="Manual Stock Adjustment"
              >
                <Edit3 size={11} className="text-slate-500" />
                <span>Adjust</span>
              </button>
            </div>
          )}
        />
      )}

      {tab === "movements" && (
        <DataTable
          columns={movementColumns}
          data={movements}
          keyField="id"
          searchPlaceholder="Search audit movements by product, reason, or staff..."
          pageSize={10}
          exportable
          exportFilename="faasbay_stock_movements.csv"
        />
      )}

      {/* Manual Stock Adjustment SlideOver */}
      <SlideOver
        open={!!adjustTarget}
        onClose={() => setAdjustTarget(null)}
        title="Manual Stock Adjustment"
        subtitle={adjustTarget ? `${adjustTarget.title} (${adjustTarget.sku})` : ""}
        footer={
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setAdjustTarget(null)}>
              Cancel
            </Btn>
            <Btn onClick={handleAdjustSubmit}>Save Adjustment</Btn>
          </div>
        }
      >
        {adjustTarget && (
          <div className="space-y-4">
            <Card className="p-4 bg-slate-50/70 border border-slate-200/80">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Current Stock</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{adjustTarget.stock}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Reserved</div>
                  <div className="text-base font-bold text-slate-600 mt-0.5">{adjustTarget.reserved}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">New Result</div>
                  <div className="text-base font-bold text-emerald-600 mt-0.5">
                    {Math.max(0, adjustTarget.stock + adjustDelta)}
                  </div>
                </div>
              </div>
            </Card>

            <FormField label="Adjustment Quantity (+/- units)" required hint="Use positive numbers to add stock, negative to decrease">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustDelta((d) => d - 1)}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                >
                  <Minus size={14} />
                </button>
                <Input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="text-center font-bold text-sm"
                />
                <button
                  type="button"
                  onClick={() => setAdjustDelta((d) => d + 1)}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                >
                  <Plus size={14} />
                </button>
              </div>
            </FormField>

            <div className="flex gap-2">
              {[+5, +10, +25, +50, -1, -5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAdjustDelta(preset)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700"
                >
                  {preset > 0 ? `+${preset}` : preset}
                </button>
              ))}
            </div>

            <FormField label="Reason for Adjustment" required>
              <Select
                options={[
                  { value: "Physical count audit", label: "Physical Count Audit / Correction" },
                  { value: "Received Supplier Shipment (PO)", label: "Received Supplier Shipment (PO)" },
                  { value: "Damaged / Defective inventory", label: "Damaged / Defective inventory write-off" },
                  { value: "Customer Return Restock", label: "Customer Return Restock" },
                  { value: "Promotional Sample / Giveaway", label: "Promotional Sample / Giveaway" },
                  { value: "Internal Testing", label: "Internal Testing & Quality Control" },
                ]}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </FormField>

            <FormField label="Staff Authorizer">
              <Input value={adjustStaff} onChange={(e) => setAdjustStaff(e.target.value)} />
            </FormField>
          </div>
        )}
      </SlideOver>
    </div>
  );
}

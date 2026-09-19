// ============================================================================
// FaasBay Commerce OS — Marketing: Coupons, Promotions, Flash Deals, Abandoned Carts
// ============================================================================
import React, { useState } from "react";
import { Plus, Edit2, Trash2, Tag, Zap, ShoppingCart, Percent, Clock, Gift, BarChart3 } from "lucide-react";
import { DataTable, StatusBadge, PageHeader, SlideOver, ConfirmDialog, Btn, FormField, Input, Textarea, Select, Toggle, Card, KPICard, TabSwitcher, formatCurrency, formatNumber } from "./shared/components";
import type { AdminCoupon, AdminPromotion, AdminFlashDeal, AdminAbandonedCart } from "./shared/types";
import {
  useStorefrontCms,
  defaultFeaturedCoupon,
  FeaturedCouponConfig,
} from "@/lib/storefront-cms";
import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

// ── Coupons ─────────────────────────────────────────────────────────────────

const initCoupons: AdminCoupon[] = [
  { code: "FAASBAY15", description: "15% off on entire order", discountType: "Percentage", discountValue: 15, minOrderAmount: 999, maxDiscount: 1500, usedCount: 0, totalRevenue: 0, totalDiscountGiven: 0, ordersGenerated: 0, conversionRate: 0, status: "Active", createdAt: "2026-06-01" },
  { code: "WELCOME10", description: "10% off for new customers", discountType: "Percentage", discountValue: 10, minOrderAmount: 499, maxDiscount: 500, usedCount: 0, totalRevenue: 0, totalDiscountGiven: 0, ordersGenerated: 0, conversionRate: 0, status: "Active", createdAt: "2026-01-15", customerSegments: ["New Customers"] },
  { code: "STUDIO20", description: "20% off premium audio range", discountType: "Percentage", discountValue: 20, minOrderAmount: 2499, maxDiscount: 2000, usedCount: 0, totalRevenue: 0, totalDiscountGiven: 0, ordersGenerated: 0, conversionRate: 0, status: "Active", createdAt: "2026-07-01", applicableCategories: ["audio"] },
  { code: "FREESHIP", description: "Free shipping on all orders", discountType: "Free Shipping", discountValue: 49, minOrderAmount: 0, usedCount: 0, totalRevenue: 0, totalDiscountGiven: 0, ordersGenerated: 0, conversionRate: 0, status: "Active", createdAt: "2026-08-01" },
  { code: "SUMMER30", description: "Summer sale 30% off", discountType: "Percentage", discountValue: 30, minOrderAmount: 1499, maxDiscount: 3000, usedCount: 0, totalRevenue: 0, totalDiscountGiven: 0, ordersGenerated: 0, conversionRate: 0, status: "Expired", createdAt: "2026-05-01", endDate: "2026-08-31" },
];

const blankCoupon: AdminCoupon = { code: "", description: "", discountType: "Percentage", discountValue: 10, minOrderAmount: 0, usedCount: 0, totalRevenue: 0, totalDiscountGiven: 0, ordersGenerated: 0, conversionRate: 0, status: "Draft", createdAt: new Date().toISOString().slice(0, 10) };


export function CouponsPage() {
  // Coupons live in MongoDB so the codes the admin creates are the ones checkout honours.
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);

  const loadCoupons = React.useCallback(async () => {
    try {
      const rows = await api.get<AdminCoupon[]>(API_ENDPOINTS.coupons);
      setCoupons(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      toast.error(e?.message || "Could not load coupons.");
    } finally {
      setCouponsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);
  const [edit, setEdit] = useState<AdminCoupon | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCoupon | null>(null);

  // Storefront Featured Coupon CMS
  const { featuredCoupon = defaultFeaturedCoupon, updateFeaturedCoupon } = useStorefrontCms();
  const [localCouponConfig, setLocalCouponConfig] = useState<FeaturedCouponConfig>(featuredCoupon);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveHomepageCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    updateFeaturedCoupon(localCouponConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const save = async () => {
    if (!edit) return;
    const isExisting = coupons.some((c) => c.code === edit.code);

    try {
      if (isExisting) {
        await api.put(`${API_ENDPOINTS.coupons}/${encodeURIComponent(edit.code)}`, edit);
      } else {
        await api.post(API_ENDPOINTS.coupons, edit);
      }
      await loadCoupons();
      setDrawerOpen(false);
      setEdit(null);
      toast.success(isExisting ? "Coupon updated." : "Coupon created.");
    } catch (e: any) {
      toast.error(e?.message || "Could not save the coupon.");
    }
  };

  const removeCoupon = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.delete(`${API_ENDPOINTS.coupons}/${encodeURIComponent(target.code)}`);
      await loadCoupons();
      toast.success(`Deleted coupon "${target.code}".`);
    } catch (e: any) {
      toast.error(e?.message || "Could not delete the coupon.");
    }
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (c: AdminCoupon) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-semibold text-gray-900">{c.code}</span>
            {localCouponConfig.code === c.code && (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                Homepage Active
              </span>
            )}
          </div>
          <div className="text-[10px] text-gray-400">{c.description}</div>
        </div>
      ),
    },
    {
      key: "discountType",
      label: "Type",
      render: (c: AdminCoupon) => (
        <span className="text-xs text-gray-600">
          {c.discountType === "Percentage"
            ? `${c.discountValue}%`
            : c.discountType === "Fixed"
            ? formatCurrency(c.discountValue)
            : "Free Ship"}
        </span>
      ),
    },
    {
      key: "minOrderAmount",
      label: "Min Order",
      render: (c: AdminCoupon) => (
        <span className="text-xs text-gray-500">
          {c.minOrderAmount > 0 ? formatCurrency(c.minOrderAmount) : "None"}
        </span>
      ),
    },
    {
      key: "usedCount",
      label: "Uses",
      sortable: true,
      render: (c: AdminCoupon) => <span className="text-xs font-medium text-gray-700">{c.usedCount}</span>,
    },
    {
      key: "totalRevenue",
      label: "Revenue",
      sortable: true,
      render: (c: AdminCoupon) => <span className="text-xs text-gray-700">{formatCurrency(c.totalRevenue)}</span>,
    },
    {
      key: "totalDiscountGiven",
      label: "Discount Given",
      render: (c: AdminCoupon) => (
        <span className="text-xs text-red-600">{formatCurrency(c.totalDiscountGiven)}</span>
      ),
    },
    { key: "status", label: "Status", render: (c: AdminCoupon) => <StatusBadge status={c.status} size="xs" /> },
  ];

  return (
    <div>
      <PageHeader
        title="Discounts & Coupons"
        subtitle={couponsLoading ? "Loading…" : `${coupons.length} coupon codes & homepage promotional offer`}
        breadcrumbs={[{ label: "Marketing" }, { label: "Coupons" }]}
        actions={
          <Btn
            icon={<Plus size={13} />}
            onClick={() => {
              setEdit({ ...blankCoupon });
              setDrawerOpen(true);
            }}
          >
            Create Coupon
          </Btn>
        }
      />

      {/* ===================================================================== */}
      {/* 1. HOMEPAGE FEATURED SPECIAL OFFER / COUPON BANNER CONTROLLER         */}
      {/* (Directly controls Red Box 4 from the user request)                   */}
      {/* ===================================================================== */}
      <Card className="p-4.5 mb-5 border-2 border-emerald-200/90 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/20 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3.5 border-b border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-[#15803d] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              %
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-gray-900">Homepage Featured Special Offer Strip</h3>
                <span className="text-[10px] uppercase font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Live on Homepage
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Mention and display the active coupon code on the bottom trust banner of the homepage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Toggle
              checked={localCouponConfig.active}
              onChange={(v) => {
                const next = { ...localCouponConfig, active: v };
                setLocalCouponConfig(next);
                updateFeaturedCoupon(next);
              }}
              label="Show on Homepage"
            />
          </div>
        </div>

        <form onSubmit={handleSaveHomepageCoupon} className="pt-3.5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <FormField label="Mention Coupon Code" required>
              <Select
                options={[
                  ...coupons.map((c) => ({ value: c.code, label: `${c.code} (${c.discountType === "Percentage" ? `${c.discountValue}%` : formatCurrency(c.discountValue)})` })),
                  { value: "CUSTOM", label: "+ Custom / Freeform Code" },
                ]}
                value={coupons.some((c) => c.code === localCouponConfig.code) ? localCouponConfig.code : "CUSTOM"}
                onChange={(e) => {
                  if (e.target.value !== "CUSTOM") {
                    const found = coupons.find((c) => c.code === e.target.value);
                    setLocalCouponConfig({
                      ...localCouponConfig,
                      code: e.target.value,
                      discountValue: found?.discountType === "Percentage" ? `${found.discountValue}%` : "15%",
                      headline: found ? `Get ${found.discountValue}% Off` : localCouponConfig.headline,
                    });
                  }
                }}
              />
            </FormField>

            <FormField label="Coupon Code String">
              <Input
                value={localCouponConfig.code}
                onChange={(e) =>
                  setLocalCouponConfig({
                    ...localCouponConfig,
                    code: e.target.value.toUpperCase().trim(),
                  })
                }
                placeholder="e.g. FAASBAY15"
                className="font-mono font-bold"
              />
            </FormField>

            <FormField label="Banner Eyebrow Tag">
              <Input
                value={localCouponConfig.badgeText}
                onChange={(e) => setLocalCouponConfig({ ...localCouponConfig, badgeText: e.target.value })}
                placeholder="Special Offer"
              />
            </FormField>

            <FormField label="Discount Badge Value">
              <Input
                value={localCouponConfig.discountValue}
                onChange={(e) =>
                  setLocalCouponConfig({
                    ...localCouponConfig,
                    discountValue: e.target.value,
                  })
                }
                placeholder="15%"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Offer Headline">
              <Input
                value={localCouponConfig.headline}
                onChange={(e) => setLocalCouponConfig({ ...localCouponConfig, headline: e.target.value })}
                placeholder="Get 15% Off"
              />
            </FormField>

            <FormField label="Offer Subtitle">
              <Input
                value={localCouponConfig.subtitle}
                onChange={(e) => setLocalCouponConfig({ ...localCouponConfig, subtitle: e.target.value })}
                placeholder="On Your First Order!"
              />
            </FormField>

            <FormField label="Button Label">
              <Input
                value={localCouponConfig.buttonText}
                onChange={(e) => setLocalCouponConfig({ ...localCouponConfig, buttonText: e.target.value })}
                placeholder="CLAIM OFFER"
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
              {savedSuccess ? (
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  ✓ Successfully saved and updated on homepage!
                </span>
              ) : (
                <span className="text-gray-500">
                  Customers clicking the Claim button on homepage will automatically copy <strong>{localCouponConfig.code}</strong>.
                </span>
              )}
            </div>

            <Btn type="submit">
              Update Homepage Coupon Banner
            </Btn>
          </div>
        </form>
      </Card>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="Active Coupons" value={String(coupons.filter((c) => c.status === "Active").length)} icon={<Tag size={14} />} />
        <KPICard title="Total Uses" value={formatNumber(coupons.reduce((s, c) => s + c.usedCount, 0))} />
        <KPICard title="Revenue Generated" value={formatCurrency(coupons.reduce((s, c) => s + c.totalRevenue, 0))} />
        <KPICard title="Total Discounts" value={formatCurrency(coupons.reduce((s, c) => s + c.totalDiscountGiven, 0))} />
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        keyField="code"
        searchPlaceholder="Search coupons..."
        actions={(c: AdminCoupon) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEdit({ ...c });
                setDrawerOpen(true);
              }}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => setDeleteTarget(c)}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      />

      <SlideOver
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEdit(null);
        }}
        title={edit && coupons.find((c) => c.code === edit.code) ? "Edit Coupon" : "Create Coupon"}
        footer={
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => { setDrawerOpen(false); setEdit(null); }}>
              Cancel
            </Btn>
            <Btn onClick={save}>Save Coupon</Btn>
          </div>
        }
      >
        {edit && (
          <>
            <FormField label="Code" required>
              <Input
                value={edit.code}
                onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUMMER25"
              />
            </FormField>
            <FormField label="Description">
              <Input value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Discount Type">
                <Select
                  options={[
                    { value: "Percentage", label: "Percentage" },
                    { value: "Fixed", label: "Fixed Amount" },
                    { value: "Free Shipping", label: "Free Shipping" },
                    { value: "Buy X Get Y", label: "Buy X Get Y" },
                  ]}
                  value={edit.discountType}
                  onChange={(e) => setEdit({ ...edit, discountType: e.target.value as any })}
                />
              </FormField>
              <FormField label="Value">
                <Input
                  type="number"
                  value={edit.discountValue}
                  onChange={(e) => setEdit({ ...edit, discountValue: Number(e.target.value) })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Min Order">
                <Input
                  type="number"
                  value={edit.minOrderAmount}
                  onChange={(e) => setEdit({ ...edit, minOrderAmount: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Max Discount">
                <Input
                  type="number"
                  value={edit.maxDiscount || ""}
                  onChange={(e) => setEdit({ ...edit, maxDiscount: Number(e.target.value) })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date">
                <Input
                  type="date"
                  value={edit.startDate || ""}
                  onChange={(e) => setEdit({ ...edit, startDate: e.target.value })}
                />
              </FormField>
              <FormField label="End Date">
                <Input
                  type="date"
                  value={edit.endDate || ""}
                  onChange={(e) => setEdit({ ...edit, endDate: e.target.value })}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Usage Limit">
                <Input
                  type="number"
                  value={edit.usageLimit || ""}
                  onChange={(e) => setEdit({ ...edit, usageLimit: Number(e.target.value) })}
                  placeholder="Unlimited"
                />
              </FormField>
              <FormField label="Per Customer">
                <Input
                  type="number"
                  value={edit.perCustomerLimit || ""}
                  onChange={(e) => setEdit({ ...edit, perCustomerLimit: Number(e.target.value) })}
                  placeholder="Unlimited"
                />
              </FormField>
            </div>
            <FormField label="Status">
              <Select
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Draft", label: "Draft" },
                  { value: "Scheduled", label: "Scheduled" },
                  { value: "Disabled", label: "Disabled" },
                ]}
                value={edit.status}
                onChange={(e) => setEdit({ ...edit, status: e.target.value as any })}
              />
            </FormField>
          </>
        )}
      </SlideOver>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          void removeCoupon();
          setDeleteTarget(null);
        }}
        title="Delete Coupon"
        message={`Delete coupon "${deleteTarget?.code}"?`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}


// ── Promotions ───────────────────────────────────────────────────────────────

const initPromotions: AdminPromotion[] = [];

const blankPromotion: AdminPromotion = {
  id: "",
  name: "",
  type: "Flash Sale",
  description: "",
  discountPercent: 20,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  timezone: "IST",
  status: "Active",
  priority: 1,
  stackable: false,
  totalRevenue: 0,
  ordersGenerated: 0,
};

export function PromotionsPage() {
  const [promos, setPromos] = useState<AdminPromotion[]>(initPromotions);
  const [edit, setEdit] = useState<AdminPromotion | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminPromotion | null>(null);

  const save = () => {
    if (!edit || !edit.name.trim()) return;
    const exists = promos.some((p) => p.id === edit.id);
    if (exists) {
      setPromos(promos.map((p) => (p.id === edit.id ? edit : p)));
    } else {
      const newPromo: AdminPromotion = {
        ...edit,
        id: edit.id || `promo-${Date.now()}`,
      };
      setPromos([newPromo, ...promos]);
    }
    setDrawerOpen(false);
    setEdit(null);
  };

  const columns = [
    {
      key: "name",
      label: "Promotion",
      render: (p: AdminPromotion) => (
        <div>
          <div className="text-xs font-semibold text-gray-900">{p.name}</div>
          <div className="text-[10px] text-gray-400">{p.description}</div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (p: AdminPromotion) => (
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 font-medium">
          {p.type}
        </span>
      ),
    },
    {
      key: "discountPercent",
      label: "Discount",
      render: (p: AdminPromotion) => (
        <span className="text-xs font-medium text-gray-900">{p.discountPercent}%</span>
      ),
    },
    {
      key: "startDate",
      label: "Period",
      render: (p: AdminPromotion) => (
        <span className="text-xs text-gray-500">
          {p.startDate} → {p.endDate}
        </span>
      ),
    },
    {
      key: "ordersGenerated",
      label: "Orders",
      sortable: true,
      render: (p: AdminPromotion) => (
        <span className="text-xs text-gray-700">{p.ordersGenerated}</span>
      ),
    },
    {
      key: "totalRevenue",
      label: "Revenue",
      sortable: true,
      render: (p: AdminPromotion) => (
        <span className="text-xs font-medium text-gray-700">{formatCurrency(p.totalRevenue)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p: AdminPromotion) => <StatusBadge status={p.status} size="xs" />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Promotions & Campaigns"
        subtitle={`${promos.length} marketing promotions configured`}
        breadcrumbs={[{ label: "Marketing" }, { label: "Promotions" }]}
        actions={
          <Btn
            icon={<Plus size={13} />}
            onClick={() => {
              setEdit({ ...blankPromotion, id: `promo-${Date.now()}` });
              setDrawerOpen(true);
            }}
          >
            Create Promotion
          </Btn>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="Total Campaigns" value={String(promos.length)} icon={<Gift size={14} />} />
        <KPICard
          title="Active Campaigns"
          value={String(promos.filter((p) => p.status === "Active").length)}
        />
        <KPICard
          title="Orders Generated"
          value={formatNumber(promos.reduce((s, p) => s + (p.ordersGenerated || 0), 0))}
        />
        <KPICard
          title="Total Revenue"
          value={formatCurrency(promos.reduce((s, p) => s + (p.totalRevenue || 0), 0))}
        />
      </div>

      <DataTable
        columns={columns}
        data={promos}
        keyField="id"
        searchPlaceholder="Search promotions..."
        actions={(p: AdminPromotion) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEdit({ ...p });
                setDrawerOpen(true);
              }}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Edit promotion"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => setDeleteTarget(p)}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
              title="Delete promotion"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      />

      <SlideOver
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEdit(null);
        }}
        title={edit && promos.some((p) => p.id === edit.id) ? "Edit Promotion" : "Create Promotion"}
        footer={
          <div className="flex justify-end gap-2">
            <Btn
              variant="secondary"
              onClick={() => {
                setDrawerOpen(false);
                setEdit(null);
              }}
            >
              Cancel
            </Btn>
            <Btn onClick={save}>Save Promotion</Btn>
          </div>
        }
      >
        {edit && (
          <>
            <FormField label="Campaign Name" required>
              <Input
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                placeholder="e.g. Diwali Mega Clearance"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Promotion Type">
                <Select
                  options={[
                    { value: "Flash Sale", label: "Flash Sale" },
                    { value: "Seasonal", label: "Seasonal" },
                    { value: "Product", label: "Product Special" },
                    { value: "Category", label: "Category Discount" },
                    { value: "Bundle", label: "Bundle Offer" },
                    { value: "Limited Time", label: "Limited Time" },
                    { value: "First Order", label: "First Order Welcome" },
                  ]}
                  value={edit.type}
                  onChange={(e) => setEdit({ ...edit, type: e.target.value as any })}
                />
              </FormField>

              <FormField label="Discount (%)">
                <Input
                  type="number"
                  value={edit.discountPercent ?? ""}
                  onChange={(e) =>
                    setEdit({ ...edit, discountPercent: Number(e.target.value) })
                  }
                  placeholder="20"
                />
              </FormField>
            </div>

            <FormField label="Description">
              <Input
                value={edit.description}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                placeholder="Brief summary for internal and storefront badge"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date">
                <Input
                  type="date"
                  value={edit.startDate || ""}
                  onChange={(e) => setEdit({ ...edit, startDate: e.target.value })}
                />
              </FormField>

              <FormField label="End Date">
                <Input
                  type="date"
                  value={edit.endDate || ""}
                  onChange={(e) => setEdit({ ...edit, endDate: e.target.value })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Priority Rank">
                <Input
                  type="number"
                  value={edit.priority}
                  onChange={(e) => setEdit({ ...edit, priority: Number(e.target.value) })}
                  placeholder="1 (Highest)"
                />
              </FormField>

              <FormField label="Status">
                <Select
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Scheduled", label: "Scheduled" },
                    { value: "Ended", label: "Ended" },
                    { value: "Draft", label: "Draft" },
                  ]}
                  value={edit.status}
                  onChange={(e) => setEdit({ ...edit, status: e.target.value as any })}
                />
              </FormField>
            </div>

            <div className="pt-2">
              <Toggle
                checked={edit.stackable}
                onChange={(v) => setEdit({ ...edit, stackable: v })}
                label="Allow Stackable with Coupons"
              />
            </div>
          </>
        )}
      </SlideOver>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          setPromos(promos.filter((p) => p.id !== deleteTarget?.id));
          setDeleteTarget(null);
        }}
        title="Delete Promotion"
        message={`Are you sure you want to delete the promotion "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}

// ── Flash Deals ──────────────────────────────────────────────────────────────

const initFlashDeals: AdminFlashDeal[] = [];

const blankFlashDeal: AdminFlashDeal = {
  id: "",
  title: "",
  productId: "p1",
  productTitle: "",
  originalPrice: 2999,
  salePrice: 1999,
  discountPercent: 33,
  stockLimit: 50,
  soldCount: 0,
  startTime: new Date().toISOString().slice(0, 16),
  endTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  status: "Active",
};

export function FlashDealsPage() {
  const [deals, setDeals] = useState<AdminFlashDeal[]>(initFlashDeals);
  const [edit, setEdit] = useState<AdminFlashDeal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminFlashDeal | null>(null);

  const save = () => {
    if (!edit || !edit.title.trim()) return;
    const calcDiscount =
      edit.originalPrice > 0 && edit.salePrice < edit.originalPrice
        ? Math.round(((edit.originalPrice - edit.salePrice) / edit.originalPrice) * 100)
        : edit.discountPercent;

    const dealToSave: AdminFlashDeal = {
      ...edit,
      discountPercent: calcDiscount,
      id: edit.id || `fd-${Date.now()}`,
    };

    const exists = deals.some((d) => d.id === edit.id);
    if (exists) {
      setDeals(deals.map((d) => (d.id === edit.id ? dealToSave : d)));
    } else {
      setDeals([dealToSave, ...deals]);
    }
    setDrawerOpen(false);
    setEdit(null);
  };

  const columns = [
    {
      key: "title",
      label: "Deal",
      render: (d: AdminFlashDeal) => (
        <div>
          <div className="text-xs font-semibold text-gray-900">{d.title}</div>
          <div className="text-[10px] text-gray-400">{d.productTitle || "FaasBay Featured Product"}</div>
        </div>
      ),
    },
    {
      key: "originalPrice",
      label: "Original",
      render: (d: AdminFlashDeal) => (
        <span className="text-xs text-gray-400 line-through">{formatCurrency(d.originalPrice)}</span>
      ),
    },
    {
      key: "salePrice",
      label: "Sale",
      render: (d: AdminFlashDeal) => (
        <span className="text-xs font-semibold text-emerald-700">{formatCurrency(d.salePrice)}</span>
      ),
    },
    {
      key: "discountPercent",
      label: "Off",
      render: (d: AdminFlashDeal) => (
        <span className="text-xs font-medium text-red-600">{d.discountPercent}%</span>
      ),
    },
    {
      key: "soldCount",
      label: "Sold",
      render: (d: AdminFlashDeal) => (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-700">
            {d.soldCount}/{d.stockLimit}
          </span>
          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, (d.soldCount / (d.stockLimit || 1)) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (d: AdminFlashDeal) => <StatusBadge status={d.status} size="xs" />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Flash Deals"
        subtitle={`${deals.length} flash deal promotions configured`}
        breadcrumbs={[{ label: "Marketing" }, { label: "Flash Deals" }]}
        actions={
          <Btn
            icon={<Plus size={13} />}
            onClick={() => {
              setEdit({ ...blankFlashDeal, id: `fd-${Date.now()}` });
              setDrawerOpen(true);
            }}
          >
            Create Deal
          </Btn>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="Total Deals" value={String(deals.length)} icon={<Zap size={14} />} />
        <KPICard
          title="Active Deals"
          value={String(deals.filter((d) => d.status === "Active").length)}
        />
        <KPICard
          title="Units Sold"
          value={formatNumber(deals.reduce((s, d) => s + (d.soldCount || 0), 0))}
        />
        <KPICard
          title="Total Stock Quota"
          value={formatNumber(deals.reduce((s, d) => s + (d.stockLimit || 0), 0))}
        />
      </div>

      <DataTable
        columns={columns}
        data={deals}
        keyField="id"
        searchPlaceholder="Search deals..."
        actions={(d: AdminFlashDeal) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEdit({ ...d });
                setDrawerOpen(true);
              }}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Edit deal"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => setDeleteTarget(d)}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
              title="Delete deal"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      />

      <SlideOver
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEdit(null);
        }}
        title={edit && deals.some((d) => d.id === edit.id) ? "Edit Flash Deal" : "Create Flash Deal"}
        footer={
          <div className="flex justify-end gap-2">
            <Btn
              variant="secondary"
              onClick={() => {
                setDrawerOpen(false);
                setEdit(null);
              }}
            >
              Cancel
            </Btn>
            <Btn onClick={save}>Save Flash Deal</Btn>
          </div>
        }
      >
        {edit && (
          <>
            <FormField label="Deal Title" required>
              <Input
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                placeholder="e.g. ANC Studio Headphones Mega Drop"
              />
            </FormField>

            <FormField label="Target Product Name / Title">
              <Input
                value={edit.productTitle || ""}
                onChange={(e) => setEdit({ ...edit, productTitle: e.target.value })}
                placeholder="e.g. ANC Studio Wireless Headphones"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Original Regular Price (₹)" required>
                <Input
                  type="number"
                  value={edit.originalPrice}
                  onChange={(e) => {
                    const orig = Number(e.target.value);
                    const disc =
                      orig > 0 && edit.salePrice < orig
                        ? Math.round(((orig - edit.salePrice) / orig) * 100)
                        : edit.discountPercent;
                    setEdit({ ...edit, originalPrice: orig, discountPercent: disc });
                  }}
                  placeholder="4999"
                />
              </FormField>

              <FormField label="Special Flash Price (₹)" required>
                <Input
                  type="number"
                  value={edit.salePrice}
                  onChange={(e) => {
                    const sale = Number(e.target.value);
                    const disc =
                      edit.originalPrice > 0 && sale < edit.originalPrice
                        ? Math.round(((edit.originalPrice - sale) / edit.originalPrice) * 100)
                        : edit.discountPercent;
                    setEdit({ ...edit, salePrice: sale, discountPercent: disc });
                  }}
                  placeholder="3499"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Calculated Discount (%)">
                <Input
                  type="number"
                  value={edit.discountPercent}
                  onChange={(e) => setEdit({ ...edit, discountPercent: Number(e.target.value) })}
                />
              </FormField>

              <FormField label="Flash Stock Allocation (Units)" required>
                <Input
                  type="number"
                  value={edit.stockLimit}
                  onChange={(e) => setEdit({ ...edit, stockLimit: Number(e.target.value) })}
                  placeholder="50"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date/Time">
                <Input
                  type="date"
                  value={edit.startTime ? edit.startTime.slice(0, 10) : ""}
                  onChange={(e) => setEdit({ ...edit, startTime: e.target.value })}
                />
              </FormField>

              <FormField label="End Date/Time">
                <Input
                  type="date"
                  value={edit.endTime ? edit.endTime.slice(0, 10) : ""}
                  onChange={(e) => setEdit({ ...edit, endTime: e.target.value })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Initial Sold Count">
                <Input
                  type="number"
                  value={edit.soldCount}
                  onChange={(e) => setEdit({ ...edit, soldCount: Number(e.target.value) })}
                />
              </FormField>

              <FormField label="Status">
                <Select
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Upcoming", label: "Upcoming" },
                    { value: "Expired", label: "Expired" },
                  ]}
                  value={edit.status}
                  onChange={(e) => setEdit({ ...edit, status: e.target.value as any })}
                />
              </FormField>
            </div>
          </>
        )}
      </SlideOver>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          setDeals(deals.filter((d) => d.id !== deleteTarget?.id));
          setDeleteTarget(null);
        }}
        title="Delete Flash Deal"
        message={`Are you sure you want to delete the flash deal "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}

// ── Abandoned Carts ──────────────────────────────────────────────────────────

const initAbandoned: AdminAbandonedCart[] = [];

export function AbandonedCartsPage() {
  const [carts] = useState<AdminAbandonedCart[]>(initAbandoned);
  const totalValue = carts.filter(c => !c.recovered).reduce((s, c) => s + c.cartValue, 0);
  const recoveredValue = carts.filter(c => c.recovered).reduce((s, c) => s + c.cartValue, 0);
  const columns = [
    { key: "customerName", label: "Customer", render: (c: AdminAbandonedCart) => (<div><div className="text-xs text-gray-900">{c.customerName}</div><div className="text-[10px] text-gray-400">{c.customerEmail}</div></div>) },
    { key: "items", label: "Items", render: (c: AdminAbandonedCart) => <span className="text-xs text-gray-600">{c.items.length} item{c.items.length > 1 ? "s" : ""}</span> },
    { key: "cartValue", label: "Value", sortable: true, render: (c: AdminAbandonedCart) => <span className="text-xs font-medium text-gray-900">{formatCurrency(c.cartValue)}</span> },
    { key: "lastActivity", label: "Last Active", render: (c: AdminAbandonedCart) => <span className="text-xs text-gray-500">{c.lastActivity}</span> },
    { key: "remindersSent", label: "Reminders", render: (c: AdminAbandonedCart) => <span className="text-xs text-gray-500">{c.remindersSent}</span> },
    { key: "recovered", label: "Status", render: (c: AdminAbandonedCart) => <StatusBadge status={c.recovered ? "Recovered" : "Abandoned"} size="xs" /> },
  ];
  return (
    <div>
      <PageHeader title="Abandoned Carts" subtitle={`${carts.length} abandoned carts`} breadcrumbs={[{ label: "Marketing" }, { label: "Abandoned Carts" }]} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="Abandoned" value={String(carts.filter(c => !c.recovered).length)} icon={<ShoppingCart size={14} />} />
        <KPICard title="Abandoned Value" value={formatCurrency(totalValue)} />
        <KPICard title="Recovered" value={String(carts.filter(c => c.recovered).length)} />
        <KPICard title="Recovered Value" value={formatCurrency(recoveredValue)} />
      </div>
      <DataTable columns={columns} data={carts} keyField="id" searchPlaceholder="Search carts..."
        actions={(c: AdminAbandonedCart) => !c.recovered ? (<Btn variant="ghost" size="sm">Send Reminder</Btn>) : null}
      />
    </div>
  );
}

// ── Master Marketing View with Sub-Navigation ──────────────────────────────

export default function MarketingMasterView({
  initialTab = "coupons",
  initialSubTab,
  onSubTabChange,
}: {
  initialTab?: string;
  initialSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}) {
  const [tab, setTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subTab");
      if (sub) return sub;
    }
    return initialSubTab || initialTab || "coupons";
  });

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    onSubTabChange?.(newTab);
    if (typeof window !== "undefined") {
      localStorage.setItem("faasbay_admin_sub_tab", newTab);
      const url = new URL(window.location.href);
      url.searchParams.set("subTab", newTab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="space-y-4">
      <TabSwitcher
        tabs={[
          { key: "coupons", label: "Discounts & Coupons", count: initCoupons.length },
          { key: "promotions", label: "Promotions & Sales", count: initPromotions.length },
          { key: "flash_deals", label: "Flash Deals", count: initFlashDeals.length },
          { key: "abandoned_carts", label: "Abandoned Carts", count: initAbandoned.length },
        ]}
        active={tab}
        onChange={handleTabChange}
      />

      {tab === "coupons" && <CouponsPage />}
      {tab === "promotions" && <PromotionsPage />}
      {tab === "flash_deals" && <FlashDealsPage />}
      {tab === "abandoned_carts" && <AbandonedCartsPage />}
    </div>
  );
}


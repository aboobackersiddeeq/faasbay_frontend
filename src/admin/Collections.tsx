// ============================================================================
// FaasBay Commerce OS — Collections Management (MongoDB-backed)
// ============================================================================
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge, PageHeader, SlideOver, ConfirmDialog, Btn, FormField, Input, Textarea, Select, Toggle, TabSwitcher } from "./shared/components";
import type { AdminCollection, CollectionRule } from "./shared/types";
import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/api-client";
import { useStoreProducts } from "@/components/store/data";

const blank: AdminCollection = { id: "", name: "", slug: "", description: "", type: "manual", productIds: [], productCount: 0, sortOrder: 0, status: "Draft" };

export default function Collections() {
  const [cols, setCols] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<AdminCollection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCollection | null>(null);

  // Published catalog, used to show the real product count per collection
  const liveProducts = useStoreProducts();

  const loadCollections = React.useCallback(async () => {
    try {
      const rows = await api.get<AdminCollection[]>(API_ENDPOINTS.collections);
      setCols(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      toast.error(e?.message || "Could not load collections.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const save = async () => {
    if (!edit) return;
    const isExisting = cols.some((c) => c.id === edit.id);

    try {
      if (isExisting) {
        await api.put(`${API_ENDPOINTS.collections}/${encodeURIComponent(edit.id)}`, edit);
      } else {
        await api.post(API_ENDPOINTS.collections, edit);
      }
      await loadCollections();
      setDrawerOpen(false);
      setEdit(null);
      toast.success(isExisting ? "Collection updated." : "Collection created.");
    } catch (e: any) {
      toast.error(e?.message || "Could not save the collection.");
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.delete(`${API_ENDPOINTS.collections}/${encodeURIComponent(target.id)}`);
      await loadCollections();
      toast.success(`Deleted "${target.name}".`);
    } catch (e: any) {
      toast.error(e?.message || "Could not delete the collection.");
    }
  };

  const columns = [
    { key: "name", label: "Collection", sortable: true, render: (c: AdminCollection) => (<div><div className="text-xs font-medium text-gray-900">{c.name}</div><div className="text-[11px] text-gray-400">/{c.slug}</div></div>) },
    { key: "type", label: "Type", render: (c: AdminCollection) => <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${c.type === "automatic" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{c.type === "automatic" ? "Auto" : "Manual"}</span> },
    {
      key: "productCount",
      label: "Products",
      sortable: true,
      render: (c: AdminCollection) => {
        const key = (c.slug || c.id || "").toLowerCase();
        const count = liveProducts.filter((p: any) => {
          if (!Array.isArray(p.collections)) return false;
          if (key === "trending" || key === "col-trending") return p.collections.includes("trending");
          if (key === "new-arrivals" || key === "col-newarrivals") return p.collections.includes("new-arrivals");
          if (key === "best-sellers" || key === "col-bestsellers") return p.collections.includes("best-sellers");
          if (key === "todays-deals" || key === "hot-deals" || key === "flash-deals" || key === "col-deals") {
            return p.collections.includes("hot-deals") || p.collections.includes("flash-deals") || p.collections.includes("todays-deals") || p.isFlashDeal;
          }
          return p.collections.includes(c.id) || p.collections.includes(c.slug);
        }).length;
        return <span className="text-xs text-gray-700 font-medium">{count}</span>;
      },
    },
    { key: "sortOrder", label: "Order", sortable: true, render: (c: AdminCollection) => <span className="text-xs text-gray-500">{c.sortOrder ?? 0}</span> },
    { key: "status", label: "Status", render: (c: AdminCollection) => <StatusBadge status={c.status} size="xs" /> },
  ];

  return (
    <div>
      <PageHeader title="Collections" subtitle={loading ? "Loading…" : `${cols.length} collections`} breadcrumbs={[{ label: "Catalog" }, { label: "Collections" }]} actions={<Btn icon={<Plus size={13} />} onClick={() => { setEdit({ ...blank }); setDrawerOpen(true); }}>Add Collection</Btn>} />
      <DataTable columns={columns} data={cols} keyField="id" searchPlaceholder="Search collections..." pageSize={20}
        actions={(c: AdminCollection) => (
          <div className="flex items-center gap-1">
            <button onClick={() => { setEdit({ ...c }); setDrawerOpen(true); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Edit2 size={13} /></button>
            <button onClick={() => setDeleteTarget(c)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
          </div>
        )}
      />
      <SlideOver open={drawerOpen} onClose={() => { setDrawerOpen(false); setEdit(null); }} title={edit?.id && cols.find(c => c.id === edit.id) ? "Edit Collection" : "Add Collection"}
        footer={<div className="flex justify-end gap-2"><Btn variant="secondary" onClick={() => { setDrawerOpen(false); setEdit(null); }}>Cancel</Btn><Btn onClick={save}>Save</Btn></div>}>
        {edit && (<>
          <FormField label="Name" required><Input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} /></FormField>
          <FormField label="Slug"><Input value={edit.slug} onChange={e => setEdit({ ...edit, slug: e.target.value })} /></FormField>
          <FormField label="Description"><Textarea rows={3} value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })} /></FormField>
          <FormField label="Type"><Select options={[{ value: "manual", label: "Manual" }, { value: "automatic", label: "Automatic (Rule-based)" }]} value={edit.type} onChange={e => setEdit({ ...edit, type: e.target.value as any })} /></FormField>
          {edit.type === "automatic" && (
            <div className="border border-gray-200 rounded-md p-3 mt-2 mb-3 bg-gray-50">
              <div className="text-xs font-medium text-gray-700 mb-2">Collection Rules</div>
              {(edit.rules || []).map((r, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <Select options={[{ value: "category", label: "Category" }, { value: "price", label: "Price" }, { value: "tags", label: "Tags" }, { value: "stock", label: "Stock" }, { value: "discount", label: "Discount" }, { value: "newness", label: "Newness" }]} value={r.field} onChange={e => { const rules = [...(edit.rules || [])]; rules[i] = { ...r, field: e.target.value as any }; setEdit({ ...edit, rules }); }} className="!w-24 text-xs" />
                  <Select options={[{ value: "equals", label: "equals" }, { value: "contains", label: "contains" }, { value: "greater_than", label: ">" }, { value: "less_than", label: "<" }]} value={r.operator} onChange={e => { const rules = [...(edit.rules || [])]; rules[i] = { ...r, operator: e.target.value as any }; setEdit({ ...edit, rules }); }} className="!w-24 text-xs" />
                  <Input value={r.value} onChange={e => { const rules = [...(edit.rules || [])]; rules[i] = { ...r, value: e.target.value }; setEdit({ ...edit, rules }); }} className="text-xs" />
                  <button onClick={() => { const rules = (edit.rules || []).filter((_, j) => j !== i); setEdit({ ...edit, rules }); }} className="text-red-400 hover:text-red-600 text-xs">×</button>
                </div>
              ))}
              <Btn variant="ghost" size="sm" onClick={() => setEdit({ ...edit, rules: [...(edit.rules || []), { field: "tags", operator: "contains", value: "" }] })}>+ Add Rule</Btn>
            </div>
          )}
          <FormField label="Sort Order"><Input type="number" value={edit.sortOrder} onChange={e => setEdit({ ...edit, sortOrder: Number(e.target.value) })} /></FormField>
          <FormField label="Status"><Select options={[{ value: "Active", label: "Active" }, { value: "Draft", label: "Draft" }, { value: "Scheduled", label: "Scheduled" }]} value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value as any })} /></FormField>
        </>)}
      </SlideOver>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={remove} title="Delete Collection" message={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" destructive />
    </div>
  );
}

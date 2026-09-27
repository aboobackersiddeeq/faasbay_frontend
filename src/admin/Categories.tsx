// ============================================================================
// FaasBay Commerce OS — Categories Management (MongoDB-backed)
// ============================================================================
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FolderTree } from "lucide-react";
import { toast } from "sonner";
import { DataTable, StatusBadge, PageHeader, SlideOver, ConfirmDialog, Btn, FormField, Input, Textarea, Select, Toggle } from "./shared/components";
import type { AdminCategory } from "./shared/types";
import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/api-client";
import { useStoreProducts, refreshCategories } from "@/components/store/data";
import { CategoryIcon, CATEGORY_ICON_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon } from "@/lib/category-icons";

const blank: AdminCategory = { id: "", name: "", slug: "", description: "", icon: DEFAULT_CATEGORY_ICON, sortOrder: 0, productCount: 0, visible: true };

export default function Categories() {
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<AdminCategory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  // Published catalog, used to show the real product count per category
  const storeProducts = useStoreProducts();
  const liveProducts = storeProducts;

  const loadCategories = React.useCallback(async () => {
    try {
      const rows = await api.get<AdminCategory[]>(API_ENDPOINTS.categories);
      setCats(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      toast.error(e?.message || "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const save = async () => {
    if (!edit) return;
    const isExisting = cats.some((c) => c.id === edit.id);

    try {
      if (isExisting) {
        await api.put(`${API_ENDPOINTS.categories}/${encodeURIComponent(edit.id)}`, edit);
      } else {
        await api.post(API_ENDPOINTS.categories, edit);
      }
      await Promise.all([loadCategories(), refreshCategories()]);
      setDrawerOpen(false);
      setEdit(null);
      toast.success(isExisting ? "Category updated." : "Category created.");
    } catch (e: any) {
      toast.error(e?.message || "Could not save the category.");
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.delete(`${API_ENDPOINTS.categories}/${encodeURIComponent(target.id)}`);
      await Promise.all([loadCategories(), refreshCategories()]);
      toast.success(`Deleted "${target.name}".`);
    } catch (e: any) {
      toast.error(e?.message || "Could not delete the category.");
    }
  };

  const columns = [
    { key: "icon", label: "", width: "52px", render: (c: AdminCategory) => <span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-800"><CategoryIcon icon={c.icon} slug={c.slug} className="h-4.5 w-4.5" /></span> },
    { key: "name", label: "Category", sortable: true, render: (c: AdminCategory) => (<div><div className="text-xs font-medium text-gray-900">{c.name}</div><div className="text-[11px] text-gray-400">/{c.slug}</div></div>) },
    { key: "description", label: "Description", render: (c: AdminCategory) => <span className="text-xs text-gray-600 truncate max-w-[200px] block">{c.description}</span> },
    {
      key: "productCount",
      label: "Products",
      sortable: true,
      render: (c: AdminCategory) => {
        const realCount = liveProducts.filter((p: any) => {
          const pCat = (p.category || "").toLowerCase().trim();
          const cName = (c.name || "").toLowerCase().trim();
          const cSlug = (c.slug || "").toLowerCase().trim();
          return pCat === cName || pCat === cSlug || pCat.includes(cName);
        }).length;
        return <span className="text-xs text-gray-700 font-medium">{realCount}</span>;
      },
    },
    { key: "sortOrder", label: "Order", sortable: true, render: (c: AdminCategory) => <span className="text-xs text-gray-500">{c.sortOrder ?? 0}</span> },
    { key: "visible", label: "Visible", render: (c: AdminCategory) => <StatusBadge status={c.visible ? "Yes" : "No"} size="xs" /> },
  ];

  return (
    <div>
      <PageHeader title="Categories" subtitle={loading ? "Loading…" : `${cats.length} categories`} breadcrumbs={[{ label: "Catalog" }, { label: "Categories" }]} actions={<Btn icon={<Plus size={13} />} onClick={() => { setEdit({ ...blank }); setDrawerOpen(true); }}>Add Category</Btn>} />
      <DataTable columns={columns} data={cats} keyField="id" searchPlaceholder="Search categories..." pageSize={20}
        actions={(c: AdminCategory) => (
          <div className="flex items-center gap-1">
            <button onClick={() => { setEdit({ ...c, icon: resolveCategoryIcon(c.icon, c.slug) }); setDrawerOpen(true); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Edit2 size={13} /></button>
            <button onClick={() => setDeleteTarget(c)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
          </div>
        )}
      />
      <SlideOver open={drawerOpen} onClose={() => { setDrawerOpen(false); setEdit(null); }} title={edit?.id && cats.find(c => c.id === edit.id) ? "Edit Category" : "Add Category"}
        footer={<div className="flex justify-end gap-2"><Btn variant="secondary" onClick={() => { setDrawerOpen(false); setEdit(null); }}>Cancel</Btn><Btn onClick={save}>Save</Btn></div>}>
        {edit && (<>
          <FormField label="Name" required><Input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} /></FormField>
          <FormField label="Slug"><Input value={edit.slug} onChange={e => setEdit({ ...edit, slug: e.target.value })} /></FormField>
          <FormField label="Description"><Textarea rows={3} value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })} /></FormField>
          <FormField label="Icon" hint="Shown in the storefront category bar and mobile menu."><IconPicker value={resolveCategoryIcon(edit.icon, edit.slug)} onChange={icon => setEdit({ ...edit, icon })} /></FormField>
          <FormField label="Sort Order"><Input type="number" value={edit.sortOrder} onChange={e => setEdit({ ...edit, sortOrder: Number(e.target.value) })} /></FormField>
          <div className="mt-3"><Toggle checked={edit.visible} onChange={v => setEdit({ ...edit, visible: v })} label="Visible on storefront" /></div>
          <FormField label="SEO Title"><Input value={edit.metaTitle || ""} onChange={e => setEdit({ ...edit, metaTitle: e.target.value })} /></FormField>
          <FormField label="SEO Description"><Textarea rows={2} value={edit.metaDescription || ""} onChange={e => setEdit({ ...edit, metaDescription: e.target.value })} /></FormField>
        </>)}
      </SlideOver>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={remove} title="Delete Category" message={`Delete "${deleteTarget?.name}"? Products in this category will become uncategorized.`} confirmLabel="Delete" destructive />
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5 rounded-lg border border-gray-200 p-2 max-h-56 overflow-y-auto">
      {CATEGORY_ICON_OPTIONS.map((opt) => {
        const selected = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={selected}
            onClick={() => onChange(opt.key)}
            className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors ${
              selected ? "bg-neutral-900 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <CategoryIcon icon={opt.key} className="h-5 w-5" />
            <span className={`text-[9.5px] leading-tight truncate max-w-full ${selected ? "text-white" : "text-gray-500"}`}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

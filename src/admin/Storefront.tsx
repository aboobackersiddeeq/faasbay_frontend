// ============================================================================
// FaasBay Commerce OS — Storefront CMS: Homepage, Banners, Navigation, Pages, Footer
// ============================================================================
import React, { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Upload, Image as ImageIcon, ExternalLink, Globe, FileText, Link2, Columns, ArrowUp, ArrowDown, Copy, ListChecks, Search, Check } from "lucide-react";
import { DataTable, StatusBadge, PageHeader, SlideOver, Modal, ConfirmDialog, Btn, FormField, Input, Textarea, Select, Toggle, Card, TabSwitcher, formatCurrency } from "./shared/components";
import type { AdminHomepageSection, AdminBanner, AdminNavLink, AdminPage, AdminFooter, AdminProduct } from "./shared/types";
import {
  useStorefrontCms,
  DualHeroSlidePair,
  SpotlightSlideItem,
  EditorialCampaignItem,
  HomepageSectionConfig,
  StorefrontFooterConfig,
  StorefrontNavLink,
  StorefrontPageItem,
} from "@/lib/storefront-cms";
import { uploadImageToCloud } from "./shared/uploadImage";
import {
  getCachedAdminProducts,
  isCatalogLoaded,
  loadAdminProducts,
  bulkUpdateProducts,
} from "./shared/product-store";

// The product-slider homepage sections that can be populated from a fast
// searchable product picker, mapped to the product "collections" tag they read.
const SECTION_PRODUCT_COLLECTIONS: Record<string, { key: string; label: string }> = {
  "sec-curated": { key: "new-arrivals", label: "New Arrivals" },
  "sec-trending": { key: "trending", label: "Trending Now" },
  "sec-bestsellers": { key: "best-sellers", label: "Best Sellers" },
  "sec-flash": { key: "hot-deals", label: "Today's Flash Deals" },
  "sec-desk": { key: "desk-workspace", label: "Desk & Workspace" },
};

// ── Homepage Sections ───────────────────────────────────────────────────────

export function HomepagePage() {
  const { sections, toggleSection, moveSection, resetHomepageSections } = useStorefrontCms();
  const [savedToast, setSavedToast] = useState(false);
  const [manageSectionId, setManageSectionId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    toggleSection(id);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    moveSection(index, direction);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const sortedSections = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <PageHeader
        title="Homepage Sections"
        subtitle="Manage storefront homepage layout and real-time live content"
        breadcrumbs={[{ label: "Storefront" }, { label: "Homepage" }]}
        actions={
          <div className="flex items-center gap-2">
            {savedToast && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                ✓ Live Synced to Storefront
              </span>
            )}
            <Btn variant="secondary" size="sm" onClick={resetHomepageSections}>
              Reset to Default Layout
            </Btn>
          </div>
        }
      />
      <div className="text-xs text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <strong>Live Storefront Control:</strong> Toggle switches immediately show or hide sections on the live storefront (<code className="text-blue-600 font-mono">/</code>). Use arrows to change vertical presentation order.
        </div>
        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0 ml-3">
          ● Storefront Connected
        </span>
      </div>

      <div className="space-y-2">
        {sortedSections.map((section, index) => (
          <Card key={section.id} className="flex items-center gap-3 px-4 py-3 border border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all">
            <div className="flex flex-col gap-0.5 items-center">
              <button
                disabled={index === 0}
                onClick={() => handleMove(index, "up")}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Move Up"
              >
                <ArrowUp size={13} />
              </button>
              <button
                disabled={index === sortedSections.length - 1}
                onClick={() => handleMove(index, "down")}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Move Down"
              >
                <ArrowDown size={13} />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{section.name}</span>
                {section.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold shrink-0">
                    {section.badge}
                  </span>
                )}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${section.visible ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500"}`}>
                  {section.visible ? "● Live Visible" : "Hidden"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {section.type} • Order: {section.sortOrder}
                {section.merchandisingMode && <span className="text-blue-600 dark:text-blue-400 ml-2 font-medium">Mode: {section.merchandisingMode}</span>}
              </div>
            </div>

            {SECTION_PRODUCT_COLLECTIONS[section.id] && (
              <Btn
                variant="secondary"
                size="sm"
                icon={<ListChecks size={12} />}
                onClick={() => setManageSectionId(section.id)}
              >
                Manage Products
              </Btn>
            )}

            <Toggle checked={section.visible} onChange={() => handleToggle(section.id)} />
          </Card>
        ))}
      </div>

      {manageSectionId && SECTION_PRODUCT_COLLECTIONS[manageSectionId] && (
        <SectionProductsModal
          open={!!manageSectionId}
          onClose={() => setManageSectionId(null)}
          sectionName={
            sections.find((s) => s.id === manageSectionId)?.name ||
            SECTION_PRODUCT_COLLECTIONS[manageSectionId].label
          }
          collectionKey={SECTION_PRODUCT_COLLECTIONS[manageSectionId].key}
        />
      )}
    </div>
  );
}

// ── Fast Multi-Product Picker (per homepage section) ───────────────────────
//
// Lets an admin search/filter the whole catalog and bulk check/uncheck which
// products belong to one homepage row, instead of opening each product's own
// edit form one at a time.
function SectionProductsModal({
  open,
  onClose,
  sectionName,
  collectionKey,
}: {
  open: boolean;
  onClose: () => void;
  sectionName: string;
  collectionKey: string;
}) {
  const [products, setProducts] = useState<AdminProduct[]>(() => getCachedAdminProducts());
  const [loading, setLoading] = useState(!isCatalogLoaded());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "selected" | "unselected">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const initialSelectedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(!isCatalogLoaded());
    loadAdminProducts().then((rows) => {
      if (cancelled) return;
      setProducts(rows);
      const initial = new Set(rows.filter((p) => (p.collections || []).includes(collectionKey)).map((p) => p.id));
      setSelected(initial);
      initialSelectedRef.current = initial;
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, collectionKey]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      if (visibilityFilter === "selected" && !selected.has(p.id)) return false;
      if (visibilityFilter === "unselected" && selected.has(p.id)) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q);
    });
  }, [products, search, categoryFilter, visibilityFilter, selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllShown = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const clearAllShown = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.delete(p.id));
      return next;
    });
  };

  const dirtyCount = useMemo(() => {
    const before = initialSelectedRef.current;
    const ids = new Set([...before, ...selected]);
    let count = 0;
    ids.forEach((id) => {
      if (before.has(id) !== selected.has(id)) count++;
    });
    return count;
  }, [selected]);

  const handleSave = async () => {
    const before = initialSelectedRef.current;
    const ids = new Set([...before, ...selected]);
    const updates: { id: string; changes: Partial<AdminProduct> }[] = [];

    ids.forEach((id) => {
      const wasIn = before.has(id);
      const isIn = selected.has(id);
      if (wasIn === isIn) return;
      const product = products.find((p) => p.id === id);
      if (!product) return;
      const currentCollections = product.collections || [];
      const nextCollections = isIn
        ? [...currentCollections, collectionKey]
        : currentCollections.filter((c) => c !== collectionKey);
      updates.push({ id, changes: { collections: nextCollections } });
    });

    if (updates.length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const { updated, failed } = await bulkUpdateProducts(updates);
      setProducts(getCachedAdminProducts());
      if (failed.length > 0) {
        toast.error(`Updated ${updated} product${updated === 1 ? "" : "s"}, but ${failed.length} failed to save.`);
      } else {
        toast.success(`Updated ${updated} product${updated === 1 ? "" : "s"} for "${sectionName}".`);
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.message || "Could not save homepage product changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Manage Products — ${sectionName}`}
      subtitle="Search or filter the catalog, then check which products belong in this homepage row"
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold text-slate-500">
            {selected.size} selected
            {dirtyCount > 0 ? ` • ${dirtyCount} unsaved change${dirtyCount === 1 ? "" : "s"}` : ""}
          </span>
          <div className="flex items-center gap-2">
            <Btn variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Btn>
            <Btn onClick={handleSave} disabled={saving || dirtyCount === 0}>
              {saving ? "Saving..." : `Save Changes${dirtyCount > 0 ? ` (${dirtyCount})` : ""}`}
            </Btn>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Visibility filter — quickly narrow to items already on/off this homepage row */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(
            [
              { key: "all", label: "All Products" },
              { key: "selected", label: "On Homepage" },
              { key: "unselected", label: "Not on Homepage" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setVisibilityFilter(opt.key)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                visibilityFilter === opt.key
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {opt.label}
              {opt.key === "selected" && selected.size > 0 && (
                <span className="ml-1 text-slate-400">({selected.size})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product title or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>
            {filtered.length} product{filtered.length === 1 ? "" : "s"} shown
          </span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={selectAllShown} className="hover:text-slate-900 cursor-pointer">
              Select all shown
            </button>
            <button type="button" onClick={clearAllShown} className="hover:text-slate-900 cursor-pointer">
              Clear shown
            </button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-xs text-slate-400">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">No products match your search/filter.</div>
          ) : (
            filtered.map((p) => {
              const checked = selected.has(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                      checked ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300"
                    }`}
                  >
                    {checked && <Check size={10} strokeWidth={3} />}
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={14} className="text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-400">
                      {p.sku} • {p.category}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-700 shrink-0">{formatCurrency(p.price)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── Banners CMS ─────────────────────────────────────────────────────────────

export function BannersPage() {
  const {
    heroPairs,
    updateHeroPairs,
    spotlightSlides,
    updateSpotlightSlides,
    editorialBanners,
    updateEditorialBanners,
  } = useStorefrontCms();

  const [activeTab, setActiveTab] = useState<"hero" | "spotlight" | "editorial">("hero");

  // Hero Pair Edit State
  const [editingHeroPair, setEditingHeroPair] = useState<DualHeroSlidePair | null>(null);
  const [heroDrawerOpen, setHeroDrawerOpen] = useState(false);
  const [deleteHeroTarget, setDeleteHeroTarget] = useState<DualHeroSlidePair | null>(null);

  // Spotlight Edit State
  const [editingSpotlight, setEditingSpotlight] = useState<SpotlightSlideItem | null>(null);
  const [spotlightDrawerOpen, setSpotlightDrawerOpen] = useState(false);
  const [deleteSpotlightTarget, setDeleteSpotlightTarget] = useState<SpotlightSlideItem | null>(null);

  // Editorial Banner Edit State
  const [editingEditorial, setEditingEditorial] = useState<EditorialCampaignItem | null>(null);
  const [editorialDrawerOpen, setEditorialDrawerOpen] = useState(false);
  const [deleteEditorialTarget, setDeleteEditorialTarget] = useState<EditorialCampaignItem | null>(null);

  // File Upload Helper — reads the file, uploads it to Cloudinary, and hands the
  // callback a hosted URL rather than a raw (often multi-MB) base64 data URI.
  const handleFileUpload = (callback: (dataUrl: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      if (typeof ev.target?.result === "string") {
        try {
          const url = await uploadImageToCloud(ev.target.result, "banners");
          callback(url);
        } catch (err) {
          console.error("Banner image upload failed:", err);
          toast.error(err instanceof Error ? err.message : "Could not upload the image. Please try again.");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. Hero Pair Actions
  const saveHeroPair = () => {
    if (!editingHeroPair) return;
    const exists = heroPairs.some((p) => p.id === editingHeroPair.id);
    if (exists) {
      updateHeroPairs(heroPairs.map((p) => (p.id === editingHeroPair.id ? editingHeroPair : p)));
    } else {
      updateHeroPairs([...heroPairs, editingHeroPair]);
    }
    setHeroDrawerOpen(false);
    setEditingHeroPair(null);
  };

  const deleteHeroPair = () => {
    if (!deleteHeroTarget) return;
    if (heroPairs.length <= 1) {
      alert("At least one Dual Hero pair must be maintained on the storefront.");
      setDeleteHeroTarget(null);
      return;
    }
    updateHeroPairs(heroPairs.filter((p) => p.id !== deleteHeroTarget.id));
    setDeleteHeroTarget(null);
  };

  const moveHeroPair = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= heroPairs.length) return;
    const next = [...heroPairs];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    updateHeroPairs(next);
  };

  const duplicateHeroPair = (pair: DualHeroSlidePair) => {
    const copy: DualHeroSlidePair = {
      ...JSON.parse(JSON.stringify(pair)),
      id: `pair-${Date.now()}`,
      left: {
        ...pair.left,
        id: `h-left-${Date.now()}`,
        title: `${pair.left.title} (Copy)`,
      },
      right: {
        ...pair.right,
        id: `h-right-${Date.now()}`,
        title: `${pair.right.title} (Copy)`,
      },
    };
    updateHeroPairs([...heroPairs, copy]);
  };

  // 2. Spotlight Slide Actions
  const saveSpotlightSlide = () => {
    if (!editingSpotlight) return;
    const exists = spotlightSlides.some((s) => s.id === editingSpotlight.id);
    if (exists) {
      updateSpotlightSlides(spotlightSlides.map((s) => (s.id === editingSpotlight.id ? editingSpotlight : s)));
    } else {
      updateSpotlightSlides([...spotlightSlides, editingSpotlight]);
    }
    setSpotlightDrawerOpen(false);
    setEditingSpotlight(null);
  };

  const deleteSpotlightSlide = () => {
    if (!deleteSpotlightTarget) return;
    if (spotlightSlides.length <= 1) {
      alert("At least one Spotlight banner must remain.");
      setDeleteSpotlightTarget(null);
      return;
    }
    updateSpotlightSlides(spotlightSlides.filter((s) => s.id !== deleteSpotlightTarget.id));
    setDeleteSpotlightTarget(null);
  };

  const duplicateSpotlight = (slide: SpotlightSlideItem) => {
    const copy: SpotlightSlideItem = {
      ...JSON.parse(JSON.stringify(slide)),
      id: `sp-${Date.now()}`,
      badgeTitle: `${slide.badgeTitle} (Copy)`,
    };
    updateSpotlightSlides([...spotlightSlides, copy]);
  };

  // 3. Editorial Banner Actions
  const saveEditorialBanner = () => {
    if (!editingEditorial) return;
    const exists = editorialBanners.some((b) => b.id === editingEditorial.id);
    if (exists) {
      updateEditorialBanners(editorialBanners.map((b) => (b.id === editingEditorial.id ? editingEditorial : b)));
    } else {
      updateEditorialBanners([...editorialBanners, editingEditorial]);
    }
    setEditorialDrawerOpen(false);
    setEditingEditorial(null);
  };

  const deleteEditorialBanner = () => {
    if (!deleteEditorialTarget) return;
    if (editorialBanners.length <= 1) {
      alert("At least one Editorial Showcase banner must remain.");
      setDeleteEditorialTarget(null);
      return;
    }
    updateEditorialBanners(editorialBanners.filter((b) => b.id !== deleteEditorialTarget.id));
    setDeleteEditorialTarget(null);
  };

  const moveEditorial = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= editorialBanners.length) return;
    const next = [...editorialBanners];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    updateEditorialBanners(next);
  };

  const duplicateEditorial = (banner: EditorialCampaignItem) => {
    const copy: EditorialCampaignItem = {
      ...JSON.parse(JSON.stringify(banner)),
      id: `banner-${Date.now()}`,
      title: `${banner.title} (Copy)`,
      tierTitle: `Showcase — ${banner.title} (Copy)`,
    };
    updateEditorialBanners([...editorialBanners, copy]);
  };

  return (
    <div>
      <PageHeader
        title="Storefront Banners & Commercial Showcase"
        subtitle="Add and customize unlimited banners across all homepage showcase sections"
        breadcrumbs={[{ label: "Storefront" }, { label: "Hero Banners" }]}
        actions={
          activeTab === "hero" ? (
            <Btn
              icon={<Plus size={13} />}
              onClick={() => {
                setEditingHeroPair({
                  id: `pair-${Date.now()}`,
                  left: {
                    id: `h-left-${Date.now()}`,
                    title: "ANC Studio Acoustics",
                    brand: "FaasBay Audio",
                    tag: "Trending",
                    price: "₹3,499",
                    subtitle: "Custom 40mm Titanium Drivers · 60h Battery",
                    cta: "Shop Acoustics",
                    image: "/assets/banners/headphones.png",
                    link: "/#catalog-section",
                  },
                  right: {
                    id: `h-right-${Date.now()}`,
                    title: "Hot-Swap Mechanical",
                    brand: "FaasBay Desk",
                    tag: "Best Seller",
                    price: "₹3,890",
                    subtitle: "CNC Aluminum Frame · Gateron Yellow Switches",
                    cta: "Order Now",
                    image: "/assets/banners/keyboard.png",
                    link: "/#catalog-section",
                  },
                });
                setHeroDrawerOpen(true);
              }}
            >
              Add Dual Hero Pair
            </Btn>
          ) : activeTab === "spotlight" ? (
            <Btn
              icon={<Plus size={13} />}
              onClick={() => {
                setEditingSpotlight({
                  id: `sp-${Date.now()}`,
                  columnId: "col-1",
                  columnTitle: "Col 1 — Audio & Earbuds",
                  badgeTitle: "SPECIAL PROMO",
                  subtitle: "HIGH DEFINITION AUDIO WIRELESS",
                  price: "₹2,499",
                  tagRibbon: "NEW",
                  image: "/assets/banners/headphones.png",
                  link: "/#catalog-section",
                });
                setSpotlightDrawerOpen(true);
              }}
            >
              Add Spotlight Slide
            </Btn>
          ) : (
            <Btn
              icon={<Plus size={13} />}
              onClick={() => {
                setEditingEditorial({
                  id: `banner-${Date.now()}`,
                  tierTitle: `Showcase Tier #${editorialBanners.length + 1}`,
                  eyebrow: "NEW COLLECTION —",
                  title: "Artisan Studio Essentials",
                  subtitle: "Crafted for Daily Workspaces",
                  description: "Precision engineered with premium materials for maximum durability and tactile comfort.",
                  image: "/assets/banners/modern_chair.png",
                  features: ["Premium Finish", "1-Year Warranty", "Free Dispatch"],
                  ctaText: "Shop Collection",
                  ctaLink: "/#catalog-section",
                });
                setEditorialDrawerOpen(true);
              }}
            >
              Add Showcase Banner
            </Btn>
          )
        }
      />

      <TabSwitcher
        tabs={[
          { key: "hero", label: "1. Top Dual Hero Carousel (2 Banners/Slide)", count: heroPairs.length },
          { key: "spotlight", label: "2. Middle 3-Card Spotlight", count: spotlightSlides.length },
          { key: "editorial", label: "3. Editorial Showcase Banners", count: editorialBanners.length },
        ]}
        active={activeTab}
        onChange={(k) => setActiveTab(k as any)}
      />

      {/* ===================================================================== */}
      {/* TAB 1: DUAL HERO CAROUSEL MANAGER                                     */}
      {/* ===================================================================== */}
      {activeTab === "hero" && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3 text-xs text-blue-900 flex items-center justify-between">
            <div>
              <strong>Top Hero Carousel:</strong> Displays slide pairs (Left & Right) with automatic 3-second sliding. Add as many slide pairs as you want!
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                {heroPairs.length} Slide Pairs ({heroPairs.length * 2} Banners)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {heroPairs.map((pair, idx) => (
              <Card key={pair.id} className="p-4 border border-gray-200 hover:border-gray-300 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-sm text-gray-900">Slide Pair #{idx + 1}</span>
                    <span className="text-[10px] text-gray-400 font-mono">({pair.left.title} & {pair.right.title})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Re-order Up */}
                    <button
                      disabled={idx === 0}
                      onClick={() => moveHeroPair(idx, "up")}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    {/* Re-order Down */}
                    <button
                      disabled={idx === heroPairs.length - 1}
                      onClick={() => moveHeroPair(idx, "down")}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    {/* Duplicate */}
                    <button
                      onClick={() => duplicateHeroPair(pair)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Duplicate Pair"
                    >
                      <Copy size={13} />
                    </button>
                    <Btn
                      variant="secondary"
                      size="sm"
                      icon={<Edit2 size={12} />}
                      onClick={() => {
                        setEditingHeroPair(JSON.parse(JSON.stringify(pair)));
                        setHeroDrawerOpen(true);
                      }}
                    >
                      Edit Pair
                    </Btn>
                    <button
                      onClick={() => setDeleteHeroTarget(pair)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Slide Pair"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Left Card Preview */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0">
                      <img src={pair.left.image} alt={pair.left.title} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                          {pair.left.tag || "Left Card"}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">{pair.left.brand}</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 truncate mt-0.5">{pair.left.title}</h4>
                      <p className="text-[11px] text-gray-500 truncate">{pair.left.subtitle}</p>
                      <div className="text-xs font-black text-gray-900 mt-1">{pair.left.price}</div>
                    </div>
                  </div>

                  {/* Right Card Preview */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0">
                      <img src={pair.right.image} alt={pair.right.title} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                          {pair.right.tag || "Right Card"}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">{pair.right.brand}</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 truncate mt-0.5">{pair.right.title}</h4>
                      <p className="text-[11px] text-gray-500 truncate">{pair.right.subtitle}</p>
                      <div className="text-xs font-black text-gray-900 mt-1">{pair.right.price}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MIDDLE 3-CARD SPOTLIGHT MANAGER                                */}
      {/* ===================================================================== */}
      {activeTab === "spotlight" && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3 text-xs text-emerald-900 flex items-center justify-between">
            <div>
              <strong>Middle 3-Card Auto-Sliding Spotlight:</strong> 3 side-by-side commercial promo columns. Add unlimited rotating promo slides into any column.
            </div>
            <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
              {spotlightSlides.length} Total Promo Cards
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["col-1", "col-2", "col-3"] as const).map((colId, colIdx) => {
              const colSlides = spotlightSlides.filter((s) => s.columnId === colId);
              const colLabel = colIdx === 0 ? "Column 1 (Audio / Acoustics)" : colIdx === 1 ? "Column 2 (Docks / Wearables)" : "Column 3 (Precision / Keyboards)";

              return (
                <div key={colId} className="border border-gray-200 rounded-xl bg-gray-50/50 p-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="font-bold text-xs text-gray-900">{colLabel}</span>
                    <span className="text-[10px] bg-gray-200 font-bold px-1.5 py-0.5 rounded text-gray-700">
                      {colSlides.length} slides
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {colSlides.map((slide) => (
                      <Card key={slide.id} className="p-3 bg-white border border-gray-200">
                        <div className="flex items-start gap-2.5">
                          <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 p-1 flex items-center justify-center shrink-0">
                            <img src={slide.image} alt={slide.badgeTitle} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-50 px-1 rounded">
                                {slide.tagRibbon || "PROMO"}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => duplicateSpotlight(slide)}
                                  className="p-1 text-gray-400 hover:text-gray-700 rounded"
                                  title="Duplicate"
                                >
                                  <Copy size={11} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSpotlight(JSON.parse(JSON.stringify(slide)));
                                    setSpotlightDrawerOpen(true);
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-700 rounded"
                                  title="Edit"
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button
                                  onClick={() => setDeleteSpotlightTarget(slide)}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                            <h5 className="text-xs font-bold text-gray-900 truncate mt-0.5">{slide.badgeTitle}</h5>
                            <p className="text-[10px] text-gray-500 truncate">{slide.subtitle}</p>
                            <div className="text-xs font-black text-gray-900 mt-0.5">{slide.price}</div>
                          </div>
                        </div>
                      </Card>
                    ))}

                    <button
                      onClick={() => {
                        setEditingSpotlight({
                          id: `sp-${Date.now()}`,
                          columnId: colId,
                          columnTitle: colLabel,
                          badgeTitle: "SPECIAL PROMO",
                          subtitle: "NEW HARDWARE ARRIVAL",
                          price: "₹1,999",
                          tagRibbon: "HOT",
                          image: "/assets/banners/watch.png",
                          link: "/#catalog-section",
                        });
                        setSpotlightDrawerOpen(true);
                      }}
                      className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-900 hover:border-gray-400 bg-white/60 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add to this Column
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: EDITORIAL CAMPAIGN BANNERS MANAGER                             */}
      {/* ===================================================================== */}
      {activeTab === "editorial" && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between">
            <div>
              <strong>Editorial Showcase Banners:</strong> Stylized campaign showcases with floating product cutouts and feature chips. Add as many showcase banners as you want!
            </div>
            <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
              {editorialBanners.length} Showcase Banners
            </span>
          </div>

          <div className="space-y-3.5">
            {editorialBanners.map((banner, index) => (
              <Card key={banner.id} className="p-4 border border-gray-200 hover:border-gray-300 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{banner.tierTitle || `Showcase #${index + 1}`}</h4>
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        {banner.eyebrow}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Move Up */}
                    <button
                      disabled={index === 0}
                      onClick={() => moveEditorial(index, "up")}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    {/* Move Down */}
                    <button
                      disabled={index === editorialBanners.length - 1}
                      onClick={() => moveEditorial(index, "down")}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    {/* Duplicate */}
                    <button
                      onClick={() => duplicateEditorial(banner)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Duplicate"
                    >
                      <Copy size={13} />
                    </button>
                    <Btn
                      variant="secondary"
                      size="sm"
                      icon={<Edit2 size={12} />}
                      onClick={() => {
                        setEditingEditorial(JSON.parse(JSON.stringify(banner)));
                        setEditorialDrawerOpen(true);
                      }}
                    >
                      Edit Banner
                    </Btn>
                    <button
                      onClick={() => setDeleteEditorialTarget(banner)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                  <div className="w-full h-24 rounded-lg bg-gray-50 border border-gray-200 p-2 flex items-center justify-center">
                    <img src={banner.image} alt={banner.title} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{banner.title}</span>
                      <span className="text-xs text-gray-500 font-semibold">— {banner.subtitle}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">{banner.description}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      {banner.features?.map((f, fi) => (
                        <span key={fi} className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          ✓ {f}
                        </span>
                      ))}
                      <span className="text-[10px] text-blue-600 font-medium ml-2">CTA: {banner.ctaText}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* APPLE CENTER MODAL: EDIT HERO SLIDE PAIR                              */}
      {/* ===================================================================== */}
      <Modal
        open={heroDrawerOpen}
        onClose={() => {
          setHeroDrawerOpen(false);
          setEditingHeroPair(null);
        }}
        title="Edit Dual Hero Slide Pair"
        subtitle="Configure the 2 product cards (Left & Right) featured in this slide pair"
        width="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Btn
              variant="secondary"
              onClick={() => {
                setHeroDrawerOpen(false);
                setEditingHeroPair(null);
              }}
            >
              Cancel
            </Btn>
            <Btn onClick={saveHeroPair}>
              Save & Update Storefront
            </Btn>
          </div>
        }
      >
        {editingHeroPair && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* LEFT CARD SECTION (APPLE MINIMALIST) */}
              <div className="border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 bg-slate-50/50 dark:bg-white/[0.02] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold flex items-center justify-center">
                      L
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Left Product Banner</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Position 1
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <FormField label="Brand Name" required>
                    <Input
                      value={editingHeroPair.left.brand}
                      placeholder="e.g. FaasBay Audio"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          left: { ...editingHeroPair.left, brand: e.target.value },
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Ribbon Tag">
                    <Input
                      value={editingHeroPair.left.tag}
                      placeholder="e.g. Flagship"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          left: { ...editingHeroPair.left, tag: e.target.value },
                        })
                      }
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <FormField label="Product Title" required>
                    <Input
                      value={editingHeroPair.left.title}
                      placeholder="e.g. ANC Studio Acoustics"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          left: { ...editingHeroPair.left, title: e.target.value },
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Price" required>
                    <Input
                      value={editingHeroPair.left.price}
                      placeholder="e.g. ₹3,499"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          left: { ...editingHeroPair.left, price: e.target.value },
                        })
                      }
                    />
                  </FormField>
                </div>

                <FormField label="Subtitle / Specs">
                  <Input
                    value={editingHeroPair.left.subtitle}
                    placeholder="e.g. Custom 40mm Titanium Drivers · 60h Battery"
                    onChange={(e) =>
                      setEditingHeroPair({
                        ...editingHeroPair,
                        left: { ...editingHeroPair.left, subtitle: e.target.value },
                      })
                    }
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-2.5">
                  <FormField label="Button Text">
                    <Input
                      value={editingHeroPair.left.cta}
                      placeholder="e.g. Shop Now"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          left: { ...editingHeroPair.left, cta: e.target.value },
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Link Destination">
                    <Input
                      value={editingHeroPair.left.link || "/#catalog-section"}
                      placeholder="/#catalog-section"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          left: { ...editingHeroPair.left, link: e.target.value },
                        })
                      }
                    />
                  </FormField>
                </div>

                <FormField label="Product Image (Left Card)" hint="📐 Recommended: 1200 × 600 px (Landscape) or 800 × 800 px (Square PNG/WebP)">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-white/10 border border-slate-200/90 dark:border-white/10 p-1 flex items-center justify-center shrink-0">
                      <img src={editingHeroPair.left.image} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <Input
                        value={editingHeroPair.left.image}
                        onChange={(e) =>
                          setEditingHeroPair({
                            ...editingHeroPair,
                            left: { ...editingHeroPair.left, image: e.target.value },
                          })
                        }
                        placeholder="Image URL"
                        className="text-xs"
                      />
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer transition-colors">
                        <Upload size={11} /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload((url) =>
                            setEditingHeroPair({
                              ...editingHeroPair,
                              left: { ...editingHeroPair.left, image: url },
                            })
                          )}
                        />
                      </label>
                    </div>
                  </div>
                </FormField>
              </div>

              {/* RIGHT CARD SECTION (APPLE MINIMALIST) */}
              <div className="border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 bg-slate-50/50 dark:bg-white/[0.02] space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold flex items-center justify-center">
                      R
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Right Product Banner</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Position 2
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <FormField label="Brand Name" required>
                    <Input
                      value={editingHeroPair.right.brand}
                      placeholder="e.g. FaasBay Desk"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          right: { ...editingHeroPair.right, brand: e.target.value },
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Ribbon Tag">
                    <Input
                      value={editingHeroPair.right.tag}
                      placeholder="e.g. Best Seller"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          right: { ...editingHeroPair.right, tag: e.target.value },
                        })
                      }
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <FormField label="Product Title" required>
                    <Input
                      value={editingHeroPair.right.title}
                      placeholder="e.g. Hot-Swap Mechanical"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          right: { ...editingHeroPair.right, title: e.target.value },
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Price" required>
                    <Input
                      value={editingHeroPair.right.price}
                      placeholder="e.g. ₹3,890"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          right: { ...editingHeroPair.right, price: e.target.value },
                        })
                      }
                    />
                  </FormField>
                </div>

                <FormField label="Subtitle / Specs">
                  <Input
                    value={editingHeroPair.right.subtitle}
                    placeholder="e.g. CNC Aluminum Frame · Gateron Yellow Switches"
                    onChange={(e) =>
                      setEditingHeroPair({
                        ...editingHeroPair,
                        right: { ...editingHeroPair.right, subtitle: e.target.value },
                      })
                    }
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-2.5">
                  <FormField label="Button Text">
                    <Input
                      value={editingHeroPair.right.cta}
                      placeholder="e.g. Order Now"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          right: { ...editingHeroPair.right, cta: e.target.value },
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Link Destination">
                    <Input
                      value={editingHeroPair.right.link || "/#catalog-section"}
                      placeholder="/#catalog-section"
                      onChange={(e) =>
                        setEditingHeroPair({
                          ...editingHeroPair,
                          right: { ...editingHeroPair.right, link: e.target.value },
                        })
                      }
                    />
                  </FormField>
                </div>

                <FormField label="Product Image (Right Card)" hint="📐 Recommended: 1200 × 600 px (Landscape) or 800 × 800 px (Square PNG/WebP)">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-white/10 border border-slate-200/90 dark:border-white/10 p-1 flex items-center justify-center shrink-0">
                      <img src={editingHeroPair.right.image} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <Input
                        value={editingHeroPair.right.image}
                        onChange={(e) =>
                          setEditingHeroPair({
                            ...editingHeroPair,
                            right: { ...editingHeroPair.right, image: e.target.value },
                          })
                        }
                        placeholder="Image URL"
                        className="text-xs"
                      />
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer transition-colors">
                        <Upload size={11} /> Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload((url) =>
                            setEditingHeroPair({
                              ...editingHeroPair,
                              right: { ...editingHeroPair.right, image: url },
                            })
                          )}
                        />
                      </label>
                    </div>
                  </div>
                </FormField>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* APPLE CENTER MODAL: EDIT SPOTLIGHT BANNER SLIDE                       */}
      {/* ===================================================================== */}
      <Modal
        open={spotlightDrawerOpen}
        onClose={() => {
          setSpotlightDrawerOpen(false);
          setEditingSpotlight(null);
        }}
        title="Edit Spotlight Promotional Card"
        subtitle="Configure the rotating commercial promo card for the middle showcase"
        width="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Btn
              variant="secondary"
              onClick={() => {
                setSpotlightDrawerOpen(false);
                setEditingSpotlight(null);
              }}
            >
              Cancel
            </Btn>
            <Btn onClick={saveSpotlightSlide}>
              Save Spotlight Card
            </Btn>
          </div>
        }
      >
        {editingSpotlight && (
          <div className="space-y-3.5">
            <FormField label="Assign to Column" required>
              <Select
                options={[
                  { value: "col-1", label: "Column 1 — Audio & Earbuds" },
                  { value: "col-2", label: "Column 2 — Docks & Wearables" },
                  { value: "col-3", label: "Column 3 — Precision Gear" },
                ]}
                value={editingSpotlight.columnId}
                onChange={(e) =>
                  setEditingSpotlight({
                    ...editingSpotlight,
                    columnId: e.target.value as any,
                  })
                }
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Headline / Badge Title" required>
                <Input
                  value={editingSpotlight.badgeTitle}
                  placeholder="e.g. SPATIAL AUDIO"
                  onChange={(e) => setEditingSpotlight({ ...editingSpotlight, badgeTitle: e.target.value })}
                />
              </FormField>
              <FormField label="Ribbon Tag">
                <Input
                  value={editingSpotlight.tagRibbon}
                  placeholder="e.g. 30% OFF, NEW, HOT"
                  onChange={(e) => setEditingSpotlight({ ...editingSpotlight, tagRibbon: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Subtitle Description" required>
              <Input
                value={editingSpotlight.subtitle}
                placeholder="e.g. LOSSLESS LDAC WIRELESS EARBUDS"
                onChange={(e) => setEditingSpotlight({ ...editingSpotlight, subtitle: e.target.value })}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Price" required>
                <Input
                  value={editingSpotlight.price}
                  placeholder="e.g. ₹2,299"
                  onChange={(e) => setEditingSpotlight({ ...editingSpotlight, price: e.target.value })}
                />
              </FormField>
              <FormField label="Destination Link">
                <Input
                  value={editingSpotlight.link || "/#catalog-section"}
                  placeholder="/#catalog-section"
                  onChange={(e) => setEditingSpotlight({ ...editingSpotlight, link: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Product Image" hint="📐 Recommended: 1000 × 500 px (Landscape) or 800 × 800 px (Square PNG/WebP)">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-white/10 border border-slate-200/90 dark:border-white/10 p-1 flex items-center justify-center shrink-0">
                  <img src={editingSpotlight.image} alt="" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <Input
                    value={editingSpotlight.image}
                    onChange={(e) => setEditingSpotlight({ ...editingSpotlight, image: e.target.value })}
                    placeholder="Image URL"
                    className="text-xs"
                  />
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer transition-colors">
                    <Upload size={11} /> Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload((url) => setEditingSpotlight({ ...editingSpotlight, image: url }))}
                    />
                  </label>
                </div>
              </div>
            </FormField>
          </div>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* APPLE CENTER MODAL: EDIT EDITORIAL SHOWCASE BANNER                    */}
      {/* ===================================================================== */}
      <Modal
        open={editorialDrawerOpen}
        onClose={() => {
          setEditorialDrawerOpen(false);
          setEditingEditorial(null);
        }}
        title="Edit Editorial Campaign Banner"
        subtitle="Configure the full-width architectural showcase tier with pop-out product cutout"
        width="max-w-xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Btn
              variant="secondary"
              onClick={() => {
                setEditorialDrawerOpen(false);
                setEditingEditorial(null);
              }}
            >
              Cancel
            </Btn>
            <Btn onClick={saveEditorialBanner}>
              Save Showcase Banner
            </Btn>
          </div>
        }
      >
        {editingEditorial && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Internal Section Label" required>
                <Input
                  value={editingEditorial.tierTitle}
                  placeholder="e.g. Modern Chair / Living"
                  onChange={(e) => setEditingEditorial({ ...editingEditorial, tierTitle: e.target.value })}
                />
              </FormField>
              <FormField label="Eyebrow Tag" required>
                <Input
                  value={editingEditorial.eyebrow}
                  placeholder="e.g. NEW ARRIVAL —"
                  onChange={(e) => setEditingEditorial({ ...editingEditorial, eyebrow: e.target.value })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Main Title" required>
                <Input
                  value={editingEditorial.title}
                  placeholder="e.g. Modern Chair"
                  onChange={(e) => setEditingEditorial({ ...editingEditorial, title: e.target.value })}
                />
              </FormField>
              <FormField label="Catchphrase / Subtitle" required>
                <Input
                  value={editingEditorial.subtitle}
                  placeholder="e.g. Comfort. Redefined."
                  onChange={(e) => setEditingEditorial({ ...editingEditorial, subtitle: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Description Body" required>
              <Textarea
                rows={2}
                value={editingEditorial.description}
                placeholder="Description of the campaign or collection..."
                onChange={(e) => setEditingEditorial({ ...editingEditorial, description: e.target.value })}
              />
            </FormField>

            <div className="grid grid-cols-3 gap-2">
              <FormField label="Feature #1">
                <Input
                  value={editingEditorial.features?.[0] || ""}
                  placeholder="e.g. Premium Linen"
                  onChange={(e) => {
                    const next = [...(editingEditorial.features || [])];
                    next[0] = e.target.value;
                    setEditingEditorial({ ...editingEditorial, features: next });
                  }}
                />
              </FormField>
              <FormField label="Feature #2">
                <Input
                  value={editingEditorial.features?.[1] || ""}
                  placeholder="e.g. Ergonomic Curve"
                  onChange={(e) => {
                    const next = [...(editingEditorial.features || [])];
                    next[1] = e.target.value;
                    setEditingEditorial({ ...editingEditorial, features: next });
                  }}
                />
              </FormField>
              <FormField label="Feature #3">
                <Input
                  value={editingEditorial.features?.[2] || ""}
                  placeholder="e.g. Solid Oak Base"
                  onChange={(e) => {
                    const next = [...(editingEditorial.features || [])];
                    next[2] = e.target.value;
                    setEditingEditorial({ ...editingEditorial, features: next });
                  }}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="CTA Button Text">
                <Input
                  value={editingEditorial.ctaText}
                  placeholder="e.g. Explore Living"
                  onChange={(e) => setEditingEditorial({ ...editingEditorial, ctaText: e.target.value })}
                />
              </FormField>
              <FormField label="CTA Destination Link">
                <Input
                  value={editingEditorial.ctaLink}
                  placeholder="/#catalog-section"
                  onChange={(e) => setEditingEditorial({ ...editingEditorial, ctaLink: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Popping Product Image (Cutout PNG)" hint="📐 Recommended: 1000 × 1000 px or 1200 × 800 px (Transparent PNG/WebP)">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-white/10 border border-slate-200/90 dark:border-white/10 p-1 flex items-center justify-center shrink-0">
                  <img src={editingEditorial.image} alt="" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <Input
                    value={editingEditorial.image}
                    onChange={(e) => setEditingEditorial({ ...editingEditorial, image: e.target.value })}
                    placeholder="Image URL (e.g. /assets/banners/...)"
                    className="text-xs"
                  />
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer transition-colors">
                    <Upload size={11} /> Upload High-Res Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload((url) => setEditingEditorial({ ...editingEditorial, image: url }))}
                    />
                  </label>
                </div>
              </div>
            </FormField>
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE MODALS */}
      <ConfirmDialog
        open={!!deleteHeroTarget}
        onClose={() => setDeleteHeroTarget(null)}
        onConfirm={deleteHeroPair}
        title="Delete Dual Hero Slide Pair"
        message="Are you sure you want to delete this Dual Hero banner pair from the top carousel?"
        confirmLabel="Delete Pair"
        destructive
      />

      <ConfirmDialog
        open={!!deleteSpotlightTarget}
        onClose={() => setDeleteSpotlightTarget(null)}
        onConfirm={deleteSpotlightSlide}
        title="Delete Spotlight Slide"
        message="Are you sure you want to delete this promotional spotlight card?"
        confirmLabel="Delete Slide"
        destructive
      />

      <ConfirmDialog
        open={!!deleteEditorialTarget}
        onClose={() => setDeleteEditorialTarget(null)}
        onConfirm={deleteEditorialBanner}
        title="Delete Editorial Showcase Banner"
        message="Are you sure you want to delete this editorial showcase banner?"
        confirmLabel="Delete Banner"
        destructive
      />
    </div>
  );
}

// ── Navigation ──────────────────────────────────────────────────────────────

const initNavLinks: AdminNavLink[] = [
  { id: "nav-1", label: "All Products", url: "/#catalog-section", type: "header", sortOrder: 1, visible: true },
  { id: "nav-2", label: "Audio & ANC", url: "/#catalog-section", type: "header", sortOrder: 2, visible: true },
  { id: "nav-3", label: "Wearables", url: "/#catalog-section", type: "header", sortOrder: 3, visible: true },
  { id: "nav-4", label: "Mechanical Keyboards", url: "/#catalog-section", type: "header", sortOrder: 4, visible: true },
  { id: "nav-5", label: "Flash Deals", url: "/#flash-deals", type: "header", sortOrder: 5, visible: true },
  { id: "nav-f1", label: "About Us", url: "/about", type: "footer", sortOrder: 1, visible: true },
  { id: "nav-f2", label: "Privacy Policy", url: "/privacy", type: "footer", sortOrder: 2, visible: true },
  { id: "nav-f3", label: "Terms of Service", url: "/terms", type: "footer", sortOrder: 3, visible: true },
  { id: "nav-f4", label: "Refund Policy", url: "/refund", type: "footer", sortOrder: 4, visible: true },
];

export function NavigationPage() {
  const { navLinks, updateNavLinks } = useStorefrontCms();
  const [edit, setEdit] = useState<StorefrontNavLink | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState("header");

  const filtered = navLinks.filter(l => l.type === tab);

  const save = () => {
    if (!edit) return;
    const idx = navLinks.findIndex(l => l.id === edit.id);
    if (idx >= 0) {
      const next = [...navLinks];
      next[idx] = edit;
      updateNavLinks(next);
    } else {
      updateNavLinks([...navLinks, { ...edit, id: `nav-${Date.now()}` }]);
    }
    setDrawerOpen(false);
    setEdit(null);
  };

  const columns = [
    { key: "label", label: "Label", render: (l: StorefrontNavLink) => <span className="text-xs font-medium text-gray-900 dark:text-white">{l.label}</span> },
    { key: "url", label: "URL", render: (l: StorefrontNavLink) => <span className="text-xs text-gray-500 font-mono">{l.url}</span> },
    { key: "sortOrder", label: "Order", sortable: true, render: (l: StorefrontNavLink) => <span className="text-xs text-gray-500">{l.sortOrder}</span> },
    { key: "visible", label: "Visible", render: (l: StorefrontNavLink) => <StatusBadge status={l.visible ? "Yes" : "No"} size="xs" /> },
  ];

  return (
    <div>
      <PageHeader
        title="Navigation"
        subtitle="Manage storefront navigation links"
        breadcrumbs={[{ label: "Storefront" }, { label: "Navigation" }]}
        actions={
          <Btn
            icon={<Plus size={13} />}
            onClick={() => {
              setEdit({ id: "", label: "", url: "/", type: tab as any, sortOrder: filtered.length + 1, visible: true });
              setDrawerOpen(true);
            }}
          >
            Add Link
          </Btn>
        }
      />
      <TabSwitcher tabs={[{ key: "header", label: "Header Nav" }, { key: "footer", label: "Footer Nav" }, { key: "category", label: "Category Nav" }]} active={tab} onChange={setTab} />
      <DataTable columns={columns} data={filtered} keyField="id"
        actions={(l: StorefrontNavLink) => (<button onClick={() => { setEdit({ ...l }); setDrawerOpen(true); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Edit2 size={13} /></button>)}
      />
      <Modal
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEdit(null); }}
        title={edit?.id ? "Edit Navigation Link" : "Add Navigation Link"}
        subtitle="Configure menu item label, destination route, and display order"
        width="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Btn variant="secondary" onClick={() => { setDrawerOpen(false); setEdit(null); }}>Cancel</Btn>
            <Btn onClick={save}>Save Link</Btn>
          </div>
        }
      >
        {edit && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Menu Label" required>
                <Input value={edit.label} placeholder="e.g. Audio & ANC" onChange={e => setEdit({ ...edit, label: e.target.value })} />
              </FormField>
              <FormField label="URL Route" required>
                <Input value={edit.url} placeholder="/#catalog-section" onChange={e => setEdit({ ...edit, url: e.target.value })} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <FormField label="Display Order">
                <Input type="number" value={edit.sortOrder} onChange={e => setEdit({ ...edit, sortOrder: Number(e.target.value) })} />
              </FormField>
              <div className="pt-4">
                <Toggle checked={edit.visible} onChange={v => setEdit({ ...edit, visible: v })} label="Visible on storefront" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Pages / Legal CMS ───────────────────────────────────────────────────────

export function PagesPage() {
  const { pagesList, updatePagesList } = useStorefrontCms();
  const [edit, setEdit] = useState<StorefrontPageItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? pagesList : pagesList.filter(p => p.type === tab);

  const save = () => {
    if (!edit) return;
    const idx = pagesList.findIndex(p => p.id === edit.id);
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    if (idx >= 0) {
      const next = [...pagesList];
      next[idx] = { ...edit, lastUpdated: dateStr };
      updatePagesList(next);
    } else {
      updatePagesList([...pagesList, { ...edit, id: `page-${Date.now()}`, lastUpdated: dateStr }]);
    }
    setDrawerOpen(false);
    setEdit(null);
  };

  const columns = [
    { key: "title", label: "Page", render: (p: StorefrontPageItem) => (<div><div className="text-xs font-medium text-gray-900 dark:text-white">{p.title}</div><div className="text-[10px] text-gray-400">/{p.slug}</div></div>) },
    { key: "type", label: "Type", render: (p: StorefrontPageItem) => <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${p.type === "legal" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : p.type === "faq" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"}`}>{p.type}</span> },
    { key: "status", label: "Status", render: (p: StorefrontPageItem) => <StatusBadge status={p.status} size="xs" /> },
    { key: "lastUpdated", label: "Updated", render: (p: StorefrontPageItem) => <span className="text-xs text-gray-500">{p.lastUpdated}</span> },
    { key: "updatedBy", label: "By", render: (p: StorefrontPageItem) => <span className="text-xs text-gray-500">{p.updatedBy || "—"}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Pages & Legal"
        subtitle={`${pagesList.length} pages`}
        breadcrumbs={[{ label: "Storefront" }, { label: "Pages" }]}
        actions={
          <Btn
            icon={<Plus size={13} />}
            onClick={() => {
              setEdit({ id: "", title: "", slug: "", type: "page", content: "", status: "Draft", lastUpdated: "" });
              setDrawerOpen(true);
            }}
          >
            Add Page
          </Btn>
        }
      />
      <TabSwitcher tabs={[{ key: "all", label: "All" }, { key: "legal", label: "Legal" }, { key: "page", label: "Pages" }, { key: "faq", label: "FAQ" }]} active={tab} onChange={setTab} />
      <DataTable columns={columns} data={filtered} keyField="id"
        actions={(p: StorefrontPageItem) => (<button onClick={() => { setEdit({ ...p }); setDrawerOpen(true); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Edit2 size={13} /></button>)}
      />
      <Modal
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEdit(null); }}
        title={edit?.id && pagesList.find(p => p.id === edit.id) ? "Edit Page" : "Create New Page"}
        subtitle="Manage page content, legal disclosures, and SEO metadata"
        width="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Btn variant="secondary" onClick={() => { setDrawerOpen(false); setEdit(null); }}>Cancel</Btn>
            <Btn onClick={save}>Save Page</Btn>
          </div>
        }
      >
        {edit && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Page Title" required>
                <Input
                  value={edit.title}
                  placeholder="e.g. Terms of Service & Warranty"
                  onChange={e => setEdit({ ...edit, title: e.target.value, slug: edit.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                />
              </FormField>
              <FormField label="URL Slug" required>
                <Input
                  value={edit.slug}
                  placeholder="e.g. terms-of-service"
                  onChange={e => setEdit({ ...edit, slug: e.target.value })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Page Type" required>
                <Select
                  options={[{ value: "page", label: "Standard Page" }, { value: "legal", label: "Legal Document" }, { value: "faq", label: "FAQ Page" }]}
                  value={edit.type}
                  onChange={e => setEdit({ ...edit, type: e.target.value as any })}
                />
              </FormField>
              <FormField label="Publish Status" required>
                <Select
                  options={[{ value: "Published", label: "Published" }, { value: "Draft", label: "Draft" }]}
                  value={edit.status}
                  onChange={e => setEdit({ ...edit, status: e.target.value as any })}
                />
              </FormField>
            </div>

            <FormField label="Content" required>
              <Textarea
                rows={6}
                value={edit.content}
                placeholder="Enter page content here..."
                onChange={e => setEdit({ ...edit, content: e.target.value })}
              />
            </FormField>

            <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Search Engine Optimization (SEO)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="SEO Title">
                  <Input
                    value={edit.metaTitle || ""}
                    placeholder="Search engine title tag"
                    onChange={e => setEdit({ ...edit, metaTitle: e.target.value })}
                  />
                </FormField>
                <FormField label="SEO Description">
                  <Input
                    value={edit.metaDescription || ""}
                    placeholder="Short meta description"
                    onChange={e => setEdit({ ...edit, metaDescription: e.target.value })}
                  />
                </FormField>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export const PagesCMSPage = PagesPage;

// ── Footer CMS ──────────────────────────────────────────────────────────────

export function FooterCMSPage() {
  const { footerData, updateFooterData } = useStorefrontCms();
  const [footer, setFooter] = useState<StorefrontFooterConfig>(footerData);
  const [toast, setToast] = useState(false);

  React.useEffect(() => {
    setFooter(footerData);
  }, [footerData]);

  const save = () => {
    updateFooterData(footer);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <div>
      <PageHeader
        title="Footer"
        subtitle="Manage storefront footer content, columns, and brand information"
        breadcrumbs={[{ label: "Storefront" }, { label: "Footer" }]}
        actions={
          <div className="flex items-center gap-2">
            {toast && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                ✓ Footer Saved Live
              </span>
            )}
            <Btn onClick={save}>Save Footer</Btn>
          </div>
        }
      />
      <Card className="p-4 mb-4">
        <FormField label="Store Description"><Textarea rows={3} value={footer.description} onChange={e => setFooter({ ...footer, description: e.target.value })} /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Contact Email"><Input value={footer.contactEmail} onChange={e => setFooter({ ...footer, contactEmail: e.target.value })} /></FormField>
          <FormField label="Contact Phone"><Input value={footer.contactPhone} onChange={e => setFooter({ ...footer, contactPhone: e.target.value })} /></FormField>
        </div>
        <FormField label="Copyright"><Input value={footer.copyright} onChange={e => setFooter({ ...footer, copyright: e.target.value })} /></FormField>
      </Card>
      <Card className="p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Footer Columns</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {footer.columns.map((col, ci) => (
            <div key={col.id} className="border border-gray-200 dark:border-white/10 rounded-md p-3">
              <FormField label="Column Title"><Input value={col.title} onChange={e => { const cols = [...footer.columns]; cols[ci] = { ...col, title: e.target.value }; setFooter({ ...footer, columns: cols }); }} /></FormField>
              {col.links.map((link, li) => (
                <div key={li} className="flex gap-2 mb-1">
                  <Input value={link.label} placeholder="Label" onChange={e => { const cols = [...footer.columns]; cols[ci].links[li] = { ...link, label: e.target.value }; setFooter({ ...footer, columns: cols }); }} className="text-xs" />
                  <Input value={link.url} placeholder="URL" onChange={e => { const cols = [...footer.columns]; cols[ci].links[li] = { ...link, url: e.target.value }; setFooter({ ...footer, columns: cols }); }} className="text-xs" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Social Links</h3>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Instagram"><Input value={footer.socialLinks.instagram || ""} onChange={e => setFooter({ ...footer, socialLinks: { ...footer.socialLinks, instagram: e.target.value } })} /></FormField>
          <FormField label="Facebook"><Input value={footer.socialLinks.facebook || ""} onChange={e => setFooter({ ...footer, socialLinks: { ...footer.socialLinks, facebook: e.target.value } })} /></FormField>
          <FormField label="Twitter / X"><Input value={footer.socialLinks.twitter || ""} onChange={e => setFooter({ ...footer, socialLinks: { ...footer.socialLinks, twitter: e.target.value } })} /></FormField>
        </div>
      </Card>
      <div className="mt-4 flex justify-end">
        <Btn onClick={save}>Save Footer</Btn>
      </div>
    </div>
  );
}

// ── Master Storefront CMS View with Sub-Navigation ─────────────────────────

export default function StorefrontMasterView({
  initialTab = "banners",
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
    return initialSubTab || initialTab || "banners";
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
          { key: "banners", label: "Hero & Promo Banners", count: 3 },
          { key: "homepage", label: "Homepage Sections", count: 10 },
          { key: "pages", label: "Pages & Legal CMS", count: 7 },
          { key: "footer", label: "Footer Settings" },
        ]}
        active={tab}
        onChange={handleTabChange}
      />

      {tab === "banners" && <BannersPage />}
      {tab === "homepage" && <HomepagePage />}
      {tab === "pages" && <PagesPage />}
      {tab === "footer" && <FooterCMSPage />}
    </div>
  );
}


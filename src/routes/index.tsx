import React, { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Sparkles, ArrowRight } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { MobileTabBar } from "@/components/store/MobileTabBar";
import { ProductRow } from "@/components/store/ProductRow";
import { ProductCard } from "@/components/store/ProductCard";
import { DualHeroBanner } from "@/components/store/DualHeroBanner";
import { CategoryNav, storeCategories } from "@/components/store/CategoryNav";
import { FeaturedCollectionSection } from "@/components/store/FeaturedCollectionSection";
import { AutoSlidingSpotlight } from "@/components/store/AutoSlidingSpotlight";
import { TrustFeatures } from "@/components/store/TrustFeatures";
import { StudioCampaignBanner } from "@/components/store/StudioCampaignBanner";
import {
  useStoreProducts,
  useStoreCollections,
  type Product,
  type StoreCollection,
} from "@/components/store/data";
import { useStorefrontCms } from "@/lib/storefront-cms";
import { useCart } from "@/hooks/use-cart";

const HOMEPAGE_ROW_LIMIT = 10;

/**
 * Admin-assigned products (via a product's "Homepage Visibility" toggles) lead
 * every homepage row; if that assignment doesn't fill the row, the rest of the
 * catalog fills the remaining slots instead of the row going empty/short.
 */
function withAdminPriority(all: Product[], isAssigned: (p: Product) => boolean, limit = HOMEPAGE_ROW_LIMIT): Product[] {
  const assigned = all.filter(isAssigned);
  if (assigned.length >= limit) return assigned;
  const assignedIds = new Set(assigned.map((p) => p.id));
  const fillers = all.filter((p) => !assignedIds.has(p.id));
  return [...assigned, ...fillers].slice(0, limit);
}

/**
 * Resolves a homepage product row's live title/visibility from the matching
 * admin Collection (by slug — any of `slugs` matches, since "Today's Flash
 * Deals" currently folds two seeded collections into one row). Falls back to
 * the hardcoded default and stays visible if the collection hasn't loaded yet
 * or doesn't exist, so nothing on the storefront ever depends on Collections
 * having been set up.
 */
function resolveCollectionMeta(collections: StoreCollection[], slugs: string[], fallbackTitle: string) {
  const match = collections.find((c) => slugs.includes(c.slug));
  return {
    title: match?.name || fallbackTitle,
    visible: match ? match.status === "Active" : true,
  };
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FaasBay — to cart... to life..." },
      {
        name: "description",
        content:
          "Official FaasBay Direct Store — Shop studio acoustics, mechanical keyboards, titanium wearables, and fast chargers. Warehouse direct with fast shipping and Cash on Delivery.",
      },
      { property: "og:title", content: "FaasBay — to cart... to life..." },
      {
        property: "og:description",
        content: "Discover precision gadgets, studio acoustics, and smart lifestyle tech on FaasBay.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { sections, isSectionVisible } = useStorefrontCms();
  const allStoreProducts = useStoreProducts();
  const collections = useStoreCollections();
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    quickNavFilter,
    setQuickNavFilter,
  } = useCart();

  // Find active category item metadata
  const activeCategoryObj = storeCategories.find((c) => c.id === selectedCategory);

  // Helper to parse numerical price safely
  const parsePrice = (priceStr: string | number) => {
    if (typeof priceStr === "number") return priceStr;
    const num = parseInt(String(priceStr || "0").replace(/[^\d]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  // Helper to detect price search like "under 999", "under 1999", "< 1000", etc.
  const parsePriceQuery = (query: string): number | null => {
    if (!query) return null;
    const clean = query.toLowerCase().replace(/,/g, "").replace(/₹/g, "").trim();
    const match = clean.match(/(?:under|below|less than|<=|<)\s*(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  const maxPriceFromSearch = searchQuery ? parsePriceQuery(searchQuery) : null;

  // Dynamic filter products based on selected category, quick nav filter & search query
  const filteredProducts = useMemo(() => {
    let list = allStoreProducts;

    // 1. Category filter
    if (selectedCategory && selectedCategory !== "all") {
      const sCat = selectedCategory.toLowerCase().trim();
      list = list.filter((p) => {
        if (!p.category) return false;
        const pCat = p.category.toLowerCase().trim();
        const pSlug = pCat.replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
        if (pSlug === sCat || pCat === sCat) return true;
        if (
          (sCat === "mobile-electronics" || sCat === "media-electronics") &&
          (pCat.includes("electronic") || pCat.includes("media") || pCat.includes("mobile") || pCat.includes("gadget"))
        ) {
          return true;
        }
        if (sCat === "audio-speakers" && (pCat.includes("audio") || pCat.includes("speaker") || pCat.includes("sound") || pCat.includes("headphone"))) {
          return true;
        }
        return pCat.includes(sCat) || sCat.includes(pCat);
      });
    }

    // 2. QuickNav filter
    if (quickNavFilter) {
      if (quickNavFilter === "best-sellers") {
        list = list.filter((p) => Array.isArray(p.collections) && p.collections.includes("best-sellers"));
      } else if (quickNavFilter === "trending") {
        list = list.filter((p) => Array.isArray(p.collections) && p.collections.includes("trending"));
      } else if (quickNavFilter === "todays-deals") {
        list = list.filter((p) => p.isFlashDeal || (Array.isArray(p.collections) && (p.collections.includes("hot-deals") || p.collections.includes("flash-deals") || p.collections.includes("todays-deals"))));
      } else if (quickNavFilter === "new-arrivals") {
        list = list.filter((p) => Array.isArray(p.collections) && p.collections.includes("new-arrivals"));
      } else if (quickNavFilter === "offers") {
        list = list.filter((p) => p.compareAt || p.isFlashDeal || (Array.isArray(p.collections) && (p.collections.includes("hot-deals") || p.collections.includes("flash-deals"))));
      }
    }

    // 3. Search query filter
    if (searchQuery && searchQuery.trim()) {
      if (maxPriceFromSearch !== null) {
        list = list.filter((p) => parsePrice(p.price) <= maxPriceFromSearch);
      } else {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.shop.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
      }
    }

    return list;
  }, [allStoreProducts, selectedCategory, searchQuery, quickNavFilter, maxPriceFromSearch]);

  const isFilteringActive =
    (selectedCategory && selectedCategory !== "all") ||
    (searchQuery && searchQuery.trim() !== "") ||
    (quickNavFilter && quickNavFilter !== "for-you");

  const getFilterHeading = () => {
    if (quickNavFilter === "best-sellers") {
      return { eyebrow: "Community Favorites", title: "Best Selling Products" };
    }
    if (quickNavFilter === "trending") {
      return { eyebrow: "Trending Now", title: "Trending Products" };
    }
    if (quickNavFilter === "todays-deals") {
      return { eyebrow: "Flash Deals", title: "Today's Limited-Time Deals" };
    }
    if (quickNavFilter === "new-arrivals") {
      return { eyebrow: "Latest Tech", title: "New Arrivals & Fresh Drops" };
    }
    if (quickNavFilter === "offers") {
      return { eyebrow: "Special Offers", title: "Discounted Picks & Deals" };
    }
    if (selectedCategory && selectedCategory !== "all") {
      return {
        eyebrow: "Filtered Collection",
        title: activeCategoryObj?.label || "Category Products",
      };
    }
    if (searchQuery) {
      return { eyebrow: "Search Results", title: `Results for "${searchQuery}"` };
    }
    return { eyebrow: "All Products", title: "Store Catalog" };
  };

  const filterHeader = getFilterHeading();

  // Helper to render section components by their section ID
  const renderSectionComponent = (sectionId: string) => {
    switch (sectionId) {
      case "sec-hero":
        return <DualHeroBanner key={sectionId} />;
      case "sec-catnav":
        return <CategoryNav key={sectionId} />;
      case "sec-curated": {
        const meta = resolveCollectionMeta(collections, ["new-arrivals"], "New Arrivals");
        if (!meta.visible) return null;
        return <FeaturedCollectionSection key={sectionId} title={meta.title} />;
      }
      case "sec-trending": {
        if (allStoreProducts.length === 0) return null;
        const meta = resolveCollectionMeta(collections, ["trending"], "Trending Now");
        if (!meta.visible) return null;
        const displayItems = withAdminPriority(allStoreProducts, (p) =>
          Array.isArray(p.collections) && p.collections.includes("trending")
        );
        return (
          <ProductRow
            key={sectionId}
            title={meta.title}
            subtitle="Top rated gear trending on FaasBay this week"
            products={displayItems}
            badgeText="TRENDING NOW"
            collectionKey="trending"
          />
        );
      }
      case "sec-bestsellers": {
        if (allStoreProducts.length === 0) return null;
        const meta = resolveCollectionMeta(collections, ["best-sellers"], "Best Sellers");
        if (!meta.visible) return null;
        const displayItems = withAdminPriority(allStoreProducts, (p) =>
          Array.isArray(p.collections) && p.collections.includes("best-sellers")
        );
        return (
          <ProductRow
            key={sectionId}
            title={meta.title}
            subtitle="Top rated gear by the FaasBay community this week"
            products={displayItems}
            badgeText="BEST SELLERS"
            collectionKey="best-sellers"
          />
        );
      }
      case "sec-spotlight":
        return <AutoSlidingSpotlight key={sectionId} />;
      case "sec-flash": {
        if (allStoreProducts.length === 0) return null;
        const meta = resolveCollectionMeta(collections, ["todays-deals", "hot-deals", "flash-deals"], "Today's Flash Deals");
        if (!meta.visible) return null;
        const displayItems = withAdminPriority(
          allStoreProducts,
          (p) =>
            p.isFlashDeal ||
            (Array.isArray(p.collections) &&
              (p.collections.includes("flash-deals") ||
                p.collections.includes("hot-deals") ||
                p.collections.includes("todays-deals")))
        );
        return (
          <ProductRow
            key={sectionId}
            title={meta.title}
            subtitle="Direct warehouse inventory with limited-time price drops"
            products={displayItems}
            isDealsSection={true}
            collectionKey="todays-deals"
          />
        );
      }
      case "sec-promo2":
        return <StudioCampaignBanner key={sectionId} />;
      case "sec-desk": {
        if (allStoreProducts.length === 0) return null;
        const meta = resolveCollectionMeta(collections, ["desk-workspace"], "Desk & Workspace Essentials");
        if (!meta.visible) return null;
        const displayItems = withAdminPriority(
          allStoreProducts,
          (p) => Array.isArray(p.collections) && p.collections.includes("desk-workspace")
        );
        return (
          <ProductRow
            key={sectionId}
            title={meta.title}
            subtitle="Minimalist charging docks, precision tools, and ergonomic productivity tech"
            products={displayItems}
            badgeText="WORK & PRODUCTIVITY"
            collectionKey="offers"
          />
        );
      }
      default:
        return null;
    }
  };

  // Sort sections by sortOrder and filter out hidden sections or footer (rendered separately at bottom)
  const activeMainSections = [...sections]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((s) => s.visible && s.type !== "footer");

  const isFooterVisible = isSectionVisible("sec-footer");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* If user filtered by Category, QuickNav or Search, render interactive filtered catalog */}
        {isFilteringActive ? (
          <div className="space-y-4">
            <CategoryNav />

            <section id="catalog-section" className="mx-auto max-w-[1280px] px-4 sm:px-6 py-2 sm:py-4">
              {/* Active Filter Header */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/[0.06] dark:border-white/10 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      {filterHeader.eyebrow}
                    </span>
                    <span className="rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2.5 py-0.5 text-[10px] font-bold">
                      {filteredProducts.length} items
                    </span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight mt-0.5">
                    {filterHeader.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                    setQuickNavFilter(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-surface px-3.5 py-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear Filter</span>
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-3xl bg-[#f7f5f0] dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-10 text-center space-y-3 my-6">
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">
                    No products found matching your selection
                  </p>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Try selecting "All Tech" or another category from the circular bar above.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearchQuery("");
                      setQuickNavFilter(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 px-5 py-2 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Show All Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Standard CMS Feed */
          activeMainSections.map((sec) => renderSectionComponent(sec.id))
        )}
      </main>

      {/* Special Offer Coupon & Trust Section if active */}
      <TrustFeatures />

      {/* Footer (Controlled by sec-footer toggle) */}
      {isFooterVisible && <Footer />}
      <MobileTabBar />
    </div>
  );
}

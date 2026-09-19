import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useWishlist } from "@/hooks/use-wishlist";
import {
  Star,
  ShieldCheck,
  RotateCcw,
  Truck,
  Heart,
  Headphones,
  Zap,
  ShoppingBag,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  Share2,
  Check,
  CheckCircle2,
  Award,
  ZoomIn,
  Package,
  Clock,
  Sparkles,
  Lock,
  Minus,
  Plus,
  Banknote,
  Bluetooth,
  Battery,
  Volume2,
  Mic,
  SlidersHorizontal,
} from "lucide-react";
import faasbayLogo from "@/assets/faasbay-logo.png";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { MobileTabBar } from "@/components/store/MobileTabBar";
import {
  useStoreProducts,
  type Product,
  formatProductForStorefront,
  fetchProductById,
} from "@/components/store/data";
import { ProductCard } from "@/components/store/ProductCard";
import { useCart } from "@/hooks/use-cart";

function ProductRouteErrorFallback({ reset }: { error: Error; reset: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold">Unable to load product</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        We encountered a temporary issue displaying this product. You can refresh or return to the catalog.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
          className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-transform"
        >
          Refresh Page
        </button>
        <button
          onClick={() => navigate({ to: "/" })}
          className="px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
        >
          Return to Storefront
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/product/$productId")({
  component: ProductDetailPage,
  errorComponent: ProductRouteErrorFallback,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { addToCart, buyNow, openCart, itemCount } = useCart();
  const allStoreProducts = useStoreProducts();
  // Set when the product is not in the loaded catalog and has to be fetched directly
  // (a deep link to a draft, or a direct hit before the catalog finished loading).
  const [directProduct, setDirectProduct] = useState<Product | null>(null);
  const [directLookupDone, setDirectLookupDone] = useState(false);

  // Find product by ID or Slug from the live catalog
  const catalogProduct: Product | undefined = useMemo(() => {
    if (!productId) return undefined;
    const cleanId = decodeURIComponent(String(productId)).trim().toLowerCase();

    // 1. Check reactive store products list
    if (allStoreProducts && allStoreProducts.length > 0) {
      const match =
        allStoreProducts.find((p) => String(p.id).toLowerCase() === cleanId) ||
        allStoreProducts.find((p) => (p as any).slug && String((p as any).slug).toLowerCase() === cleanId) ||
        allStoreProducts.find((p) => p.title && p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanId) ||
        (cleanId.startsWith("p") && !isNaN(parseInt(cleanId.slice(1), 10))
          ? allStoreProducts[parseInt(cleanId.slice(1), 10) - 1] || allStoreProducts.find((p) => String(p.id) === cleanId.slice(1))
          : undefined) ||
        (!isNaN(parseInt(cleanId, 10))
          ? allStoreProducts.find((p) => String(p.id) === cleanId) || allStoreProducts[parseInt(cleanId, 10) - 1]
          : undefined);
      if (match) return match;
    }

    return undefined;
  }, [allStoreProducts, productId]);

  // Fall back to a direct API lookup when the catalog list does not contain it.
  useEffect(() => {
    if (catalogProduct || !productId) return;
    let cancelled = false;

    fetchProductById(decodeURIComponent(String(productId)).trim()).then((found) => {
      if (cancelled) return;
      setDirectProduct(found);
      setDirectLookupDone(true);
    });

    return () => {
      cancelled = true;
    };
  }, [catalogProduct, productId]);

  const product: Product | undefined = catalogProduct || directProduct || undefined;

  if (!product) {
    if (!directLookupDone) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-background">
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 dark:border-white border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Loading product details...</p>
        </div>
      );
    }

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-background">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Product Not Found</h1>
        <p className="text-sm text-neutral-500 mt-2 max-w-md">
          This product is currently unavailable or has been removed from the catalog.
        </p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-6 px-6 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-sm"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const { isWishlisted, toggleWishlist } = useWishlist();
  const isLiked = isWishlisted(product.id);

  // Dynamically calculate available color finishes from product
  const availableColors = useMemo(() => {
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors.filter((c) => c && c.name && c.name !== "None");
    }
    if (Array.isArray(product.variants) && product.variants.length > 0 && product.hasVariants) {
      return product.variants
        .filter((v: any) => v && v.name && v.name !== "Default" && v.name !== "None")
        .map((v: any) => ({
          name: v.name,
          hex: v.hex || "#1e293b",
        }));
    }
    return [];
  }, [product]);

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors[0]?.name || "";
    }
    return "";
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  // Mobile Accordion state: multi-open dictionary (Default: 'desc' is open)
  const [openMobileAccordions, setOpenMobileAccordions] = useState<{ [key: string]: boolean }>({
    desc: true,
    specs: false,
    box: false,
    shipping: false,
    returns: false,
    reviews: false,
  });

  const toggleMobileAccordion = (key: string) => {
    setOpenMobileAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Desktop Hover Magnifier Zoom State
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  // Desktop Tabs: "description" | "specs" | "reviews" (Default: description)
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  // Scroll to top, reset active tab, and ensure Product Description is open on load
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveTab("description");
    setOpenMobileAccordions({
      desc: true,
      specs: false,
      box: false,
      shipping: false,
      returns: false,
      reviews: false,
    });
    setActiveImageIndex(0);
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      setSelectedColor(product.colors[0]?.name || "");
    }
  }, [productId, product]);

  // Calculate pricing & savings safely
  const currentPriceNum = typeof product.price === "number"
    ? product.price
    : parseInt(String(product.price || "0").replace(/[^\d]/g, ""), 10) || 0;
  const compareAtNum = product.compareAt
    ? typeof product.compareAt === "number"
      ? product.compareAt
      : parseInt(String(product.compareAt).replace(/[^\d]/g, ""), 10) || null
    : null;
  const savings =
    compareAtNum && compareAtNum > currentPriceNum
      ? compareAtNum - currentPriceNum
      : 0;
  const discountPercent =
    compareAtNum && compareAtNum > currentPriceNum
      ? Math.round((savings / compareAtNum) * 100)
      : 25;

  // Gallery images
  const galleryImages: string[] =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    buyNow(product, quantity, selectedColor !== "None" ? selectedColor : undefined);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const scrollToReviews = () => {
    const el = document.getElementById("reviews-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const shortEditorialDescription = useMemo(() => {
    if (!product?.description || typeof product.description !== "string") {
      return `Discover the exceptional quality and craftsmanship of ${product?.title || "this item"}. Curated by ${product?.shop || "FaasBay"} for everyday durability and performance.`;
    }
    // Extract only the clean intro overview, stopping before feature bullet lists or sections
    const lines = String(product.description).split(/\r?\n/);
    const introLines: string[] = [];
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        if (introLines.length > 0) break; // First clean paragraph complete
        continue;
      }
      if (
        /^(key\s*features|features|specifications|specs|highlights|details|package\s*includes|what's\s*included):?/i.test(line) ||
        /^[•\-\*✍️🗑️🔒👀♻️🚨✨⚡️📦🔹✔️✔👍🔥]/.test(line)
      ) {
        break;
      }
      introLines.push(line);
    }
    const fullIntro = introLines.join(" ").trim();
    if (fullIntro) {
      return fullIntro;
    }
    const firstPara = String(product.description).split(/\n\s*\n|\r\n\s*\r\n/)[0].trim();
    return firstPara.length > 180 ? firstPara.slice(0, 180).trim() + "..." : firstPara;
  }, [product?.description, product?.title, product?.shop]);

  const relatedProducts = allStoreProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      <Header />

      {/* ========================================================================= */}
      {/* SECTION A: DESKTOP PRODUCT HERO — AMERICAN DTC LUXURY & MINIMAL GLASS     */}
      {/* ========================================================================= */}
      <div className="hidden md:block">
        <main className="mx-auto max-w-6xl px-6 lg:px-8 py-3 space-y-6">
          {/* 1. Breadcrumb Bar & Share */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pb-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
              <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
              <span
                onClick={() => navigate({ to: "/" })}
                className="capitalize hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors font-medium"
              >
                {product.category}
              </span>
              <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[340px]">
                {product.title}
              </span>
            </nav>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shrink-0 ml-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/15 border border-slate-200/60 dark:border-white/10 backdrop-blur-md active:scale-95 shadow-2xs"
              title="Share product link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 opacity-70" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* 2. American DTC Hero Grid */}
          <div className="grid grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
            {/* Gallery Left (6 cols) */}
            <div className="col-span-6 space-y-3.5">
              {/* Main Studio Canvas */}
              <div
                onMouseEnter={() => setIsHoveringImage(true)}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setIsHoveringImage(false)}
                className="relative aspect-[4/3.4] w-full overflow-hidden rounded-3xl bg-slate-50/70 dark:bg-neutral-900/60 backdrop-blur-2xl border border-slate-200/70 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] group select-none cursor-crosshair flex items-center justify-center"
              >
                <img
                  src={galleryImages[activeImageIndex] || product.image}
                  alt={product.title}
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isHoveringImage ? "scale(2.15)" : "scale(1)",
                    transition: isHoveringImage ? "transform 0.08s ease-out" : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset["tried"]) {
                      target.dataset["tried"] = "true";
                      target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
                    }
                  }}
                  className="h-full w-full object-cover pointer-events-none will-change-transform"
                />

                {/* Frosted Circular Wishlist (Top-Right) */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                  className="absolute top-4 right-4 z-10 h-8.5 w-8.5 grid place-items-center rounded-full bg-white/85 dark:bg-slate-900/85 text-slate-500 dark:text-slate-400 hover:text-rose-500 shadow-sm border border-slate-200/60 dark:border-white/10 backdrop-blur-md transition-all active:scale-90 hover:scale-105 cursor-pointer"
                >
                  <Heart className={`h-4 w-4 transition-colors ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>

                {/* Floating Zoom Cue (Bottom-Right) */}
                <div className={`flex absolute bottom-4 right-4 z-10 h-6.5 px-3 items-center gap-1.5 rounded-full bg-slate-900/75 dark:bg-white/85 text-white dark:text-slate-900 backdrop-blur-md shadow-xs text-[10px] font-semibold tracking-wide transition-opacity duration-200 pointer-events-none ${isHoveringImage ? "opacity-0" : "opacity-90"}`}>
                  <ZoomIn className="h-3 w-3" />
                  <span>Hover to zoom</span>
                </div>

                {/* Left / Right Gallery Chevrons */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                      aria-label="Previous image"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer border border-slate-200/60 dark:border-white/10 opacity-70 hover:opacity-100"
                    >
                      <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)}
                      aria-label="Next image"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer border border-slate-200/60 dark:border-white/10 opacity-70 hover:opacity-100"
                    >
                      <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </>
                )}
              </div>

              {/* Minimal Floating Thumbnail Strip */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2.5 pt-0.5 overflow-x-auto scrollbar-none">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-15 w-15 rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer shrink-0 bg-slate-50/80 dark:bg-white/5 backdrop-blur-md p-1 ${
                        activeImageIndex === idx
                          ? "border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20 shadow-xs scale-105"
                          : "border-slate-200/60 dark:border-white/10 opacity-60 hover:opacity-100 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset["tried"]) {
                            target.dataset["tried"] = "true";
                            target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
                          }
                        }}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buy Box Right (6 cols) */}
            <div className="col-span-6 space-y-4">
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    {product.shop || "FaasBay Direct"} • {product.category}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("reviews");
                      window.scrollTo({ top: 600, behavior: "smooth" });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold backdrop-blur-md shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900 dark:text-white">{Number(product.rating || 5).toFixed(1)}</span>
                    <span className="text-slate-400 font-light">·</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{Number(product.reviews || 0)} reviews</span>
                  </button>
                </div>

                {/* Confident American DTC Headline */}
                <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white leading-[1.2] tracking-tight">
                  {product.title}
                </h1>

                {/* Pricing Block */}
                <div className="flex items-baseline flex-wrap gap-2.5 pt-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {product.price}
                  </span>
                  {product.compareAt && (
                    <span className="text-sm text-slate-400 line-through font-normal">
                      {product.compareAt}
                    </span>
                  )}
                  {savings > 0 && (
                    <span className="inline-flex items-center rounded-full bg-[#B0CB1F]/15 text-[#596906] dark:text-[#B0CB1F] border border-[#B0CB1F]/30 px-2.5 py-0.5 text-xs font-bold tracking-tight">
                      Save {discountPercent}%
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-normal ml-auto">
                    Inclusive of all taxes
                  </span>
                </div>

                {/* Frosted Instant Offer Banner with #B0CB1F */}
                <div className="pt-0.5">
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-[#B0CB1F]/10 dark:bg-[#B0CB1F]/15 border border-[#B0CB1F]/25 backdrop-blur-md text-xs font-medium text-slate-900 dark:text-[#f3f7d2]">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-[#73880a] dark:text-[#B0CB1F] fill-[#73880a] dark:fill-[#B0CB1F] shrink-0" />
                      <span>
                        Get it for <strong className="font-bold text-slate-900 dark:text-white">₹{currentPriceNum > 500 ? (currentPriceNum - 350).toLocaleString("en-IN") : currentPriceNum}</strong> with instant UPI & card checkout
                      </span>
                    </div>
                    <Info className="h-3.5 w-3.5 opacity-60 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Editorial Summary (Short Concise Excerpt) */}
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal line-clamp-3">
                {shortEditorialDescription}
              </p>

              {/* Color Swatches (Rendered only if product has colors configured) */}
              {availableColors.length > 0 && (
                <div className="space-y-1.5 pt-0.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                    Color: <strong className="text-slate-900 dark:text-white font-bold">{selectedColor || availableColors[0]?.name}</strong>
                  </span>
                  <div className="flex items-center gap-2.5">
                    {availableColors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`h-7.5 w-7.5 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer relative ${
                          (selectedColor || availableColors[0]?.name) === c.name
                            ? "border-slate-900 dark:border-white ring-2 ring-slate-900/30 dark:ring-white/30 scale-110 shadow-xs"
                            : "border-black/10 dark:border-white/20 hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {(selectedColor || availableColors[0]?.name) === c.name && (
                          <Check className={`h-3 w-3 ${c.hex === "#e7e5e4" || c.hex === "#ffffff" || c.hex === "#f8fafc" ? "text-slate-900" : "text-white"}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Dispatch Indicator & COD badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-800 dark:text-slate-200 font-semibold pt-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B0CB1F] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B0CB1F]" />
                  </span>
                  <span>In Stock — Dispatches within 24 hours</span>
                </div>
                <div className="inline-flex items-center gap-1 text-[#5b6a07] dark:text-[#B0CB1F] bg-[#B0CB1F]/15 border border-[#B0CB1F]/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  <span>💵 Cash on Delivery Available</span>
                </div>
              </div>

              {/* Quantity Stepper & DTC Primary Action Buttons */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center border border-slate-200/80 dark:border-white/10 rounded-2xl bg-slate-50/80 dark:bg-white/5 backdrop-blur-md h-12 px-2 shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="h-8 w-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-90 font-bold text-sm cursor-pointer rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                      className="h-8 w-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-90 font-bold text-sm cursor-pointer rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-12 rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-sm tracking-wide transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    {justAdded ? (
                      <>
                        <Check className="h-4 w-4 text-[#B0CB1F]" />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4 stroke-[2.2]" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 h-12 rounded-2xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 font-black text-sm tracking-wide transition-all shadow-[0_4px_18px_rgba(176,203,31,0.35)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <Zap className="h-4 w-4 fill-slate-950 stroke-none" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Desktop Tabs */}
          <div className="pt-8 border-t border-border">
            <div className="flex items-center justify-center gap-12 border-b border-border pb-px">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={`pb-3 text-sm font-bold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "description"
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Description</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={`pb-3 text-sm font-bold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "specs"
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Info className="h-3.5 w-3.5" />
                <span>Specifications</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={`pb-3 text-sm font-bold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "reviews"
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className="h-3.5 w-3.5" />
                <span>Reviews ({product.reviews})</span>
              </button>
            </div>

            {activeTab === "description" && (
              <div className="py-8 max-w-3xl mx-auto space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {product.description ? (
                  <div className="space-y-3 font-normal">
                    {String(product.description).split("\n\n").map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>
                ) : (
                  <p>
                    Discover the exceptional quality and craftsmanship of {product.title}. Carefully curated by {product.shop} for everyday durability, performance, and style.
                  </p>
                )}
                {Array.isArray(product.materials) && product.materials.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">Key Highlights</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-foreground">
                      {product.materials.map((m, mIdx) => (
                        <li key={mIdx} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="py-8 max-w-2xl mx-auto">
                <div className="border border-border rounded-xl overflow-hidden text-xs divide-y divide-border">
                  <div className="grid grid-cols-2 p-3 bg-card">
                    <span className="font-semibold text-muted-foreground">Brand</span>
                    <span className="font-bold text-foreground">{product.shop}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-secondary/30">
                    <span className="font-semibold text-muted-foreground">Category</span>
                    <span className="font-bold text-foreground capitalize">{product.category}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-card">
                    <span className="font-semibold text-muted-foreground">Warranty & Returns</span>
                    <span className="font-bold text-foreground">{product.warranty || "3 Days Checking Warranty / Replacement"}</span>
                  </div>
                  {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                    product.specifications.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className={`grid grid-cols-2 p-3 ${sIdx % 2 === 0 ? "bg-secondary/30" : "bg-card"}`}
                      >
                        <span className="font-semibold text-muted-foreground">{spec?.label || "Specification"}</span>
                        <span className="font-bold text-foreground">{spec?.value || "-"}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="grid grid-cols-2 p-3 bg-secondary/30">
                        <span className="font-semibold text-muted-foreground">Authenticity</span>
                        <span className="font-bold text-foreground">100% Original & Verified</span>
                      </div>
                      <div className="grid grid-cols-2 p-3 bg-card">
                        <span className="font-semibold text-muted-foreground">Dispatch</span>
                        <span className="font-bold text-foreground">Within 24 Hours Express</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="py-8 space-y-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-12 gap-6 items-center pb-6 border-b border-border">
                  <div className="col-span-4 text-center space-y-1">
                    <div className="text-5xl font-black text-foreground">{Number(product.rating || 5).toFixed(1)}</div>
                    <div className="flex justify-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">out of 5 ({Number(product.reviews || 0)} Reviews)</div>
                  </div>

                  <div className="col-span-8 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="w-10 font-medium">5 ★</span>
                      <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                        <div className="bg-[#0f766e] h-full rounded-full" style={{ width: "88%" }} />
                      </div>
                      <span className="w-8 text-right font-medium">183</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-10 font-medium">4 ★</span>
                      <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: "25%" }} />
                      </div>
                      <span className="w-8 text-right font-medium">52</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-10 font-medium">3 ★</span>
                      <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: "8%" }} />
                      </div>
                      <span className="w-8 text-right font-medium">15</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-10 font-medium">2 ★</span>
                      <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                        <div className="bg-stone-300 dark:bg-stone-700 h-full rounded-full" style={{ width: "2%" }} />
                      </div>
                      <span className="w-8 text-right font-medium">4</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-10 font-medium">1 ★</span>
                      <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                        <div className="bg-stone-300 dark:bg-stone-700 h-full rounded-full" style={{ width: "1%" }} />
                      </div>
                      <span className="w-8 text-right font-medium">2</span>
                    </div>
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-5">
                  {product.customerReviews && product.customerReviews.length > 0 ? (
                    product.customerReviews.map((rev) => (
                      <div key={rev.id} className="space-y-2.5 pb-5 border-b border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {rev.userPhoto ? (
                              <img
                                src={rev.userPhoto}
                                alt={rev.author}
                                className="h-9 w-9 rounded-full object-cover border border-border"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                                {String(rev.author || "Customer")
                                  .split(" ")
                                  .filter(Boolean)
                                  .map((n) => n[0] || "")
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase() || "FB"}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-xs text-foreground">{rev.author || "Customer"}</div>
                              {rev.verified && (
                                <span className="text-[10px] font-bold text-[#0f766e] dark:text-emerald-400">
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] text-muted-foreground">{rev.date}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < (rev.rating || 5)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-stone-300 dark:text-stone-700"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-muted-foreground bg-slate-50/60 dark:bg-white/5 rounded-2xl border border-dashed border-border p-6">
                      No customer reviews yet. Verified purchases will appear here.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Desktop 4-Pillar Trust Features */}
          <div className="grid grid-cols-4 gap-4 p-6 rounded-2xl bg-card border border-border text-xs">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground shrink-0">
                <Truck className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div>
                <span className="font-bold text-foreground block text-xs">Warehouse Direct</span>
                <span className="text-[11px] text-muted-foreground">Dispatched in 24h</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground shrink-0">
                <RotateCcw className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div>
                <span className="font-bold text-foreground block text-xs">7-Day Easy Returns</span>
                <span className="text-[11px] text-muted-foreground">Doorstep pickup</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground shrink-0">
                <ShieldCheck className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div>
                <span className="font-bold text-foreground block text-xs">1-Year Warranty</span>
                <span className="text-[11px] text-muted-foreground">100% Genuine FaasBay</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground shrink-0">
                <Headphones className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div>
                <span className="font-bold text-foreground block text-xs">Direct Support</span>
                <span className="text-[11px] text-muted-foreground">24/7 dedicated help</span>
              </div>
            </div>
          </div>

          {/* 5. Desktop Recommendations Grid */}
          <div className="pt-12 border-t border-border space-y-6">
            <div className="flex items-end justify-between pb-1 border-b border-border/60">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  CURATED FOR YOU —
                </span>
                <h3 className="text-2xl lg:text-3xl font-black text-foreground font-display tracking-tight leading-tight">
                  You May Also Like
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">Handpicked precision tech & smart essentials</p>
            </div>

            <div className="grid grid-cols-5 gap-4.5">
              {relatedProducts.slice(0, 5).map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        </main>
      </div>


      {/* ========================================================================= */}
      {/* SECTION B: REDESIGNED MOBILE PRODUCT DETAIL PAGE (EXACT REFERENCE DESIGN) */}
      {/* ========================================================================= */}
      <div className="block md:hidden">
        {/* 1. Mobile Sticky Product Header: [← Back] [Centered FaasBay Logo] [♡ Wishlist] [🛒 Cart (n)] */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08] bg-background/95 backdrop-blur-md">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            aria-label="Go Back"
            className="grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-secondary active:scale-90 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 stroke-[2.2]" />
          </button>

          <a href="/" className="flex items-center gap-1.5">
            <img
              src={faasbayLogo}
              alt="FaasBay"
              className="h-6.5 w-auto object-contain"
            />
          </a>

          <div className="flex items-center gap-2">
            {/* Wishlist Heart */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label={isLiked ? "Remove from wishlist" : "Save to wishlist"}
              className="grid h-8.5 w-8.5 place-items-center rounded-full text-foreground hover:bg-secondary active:scale-90 transition-all cursor-pointer"
            >
              <Heart className={`h-4.5 w-4.5 transition-colors ${isLiked ? "fill-rose-500 text-rose-500 stroke-rose-500" : "stroke-[1.9]"}`} />
            </button>

            {/* Shopping Cart with Live Badge */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                openCart();
              }}
              aria-label="Open cart"
              className="relative grid h-8.5 w-8.5 place-items-center rounded-full text-foreground hover:bg-secondary active:scale-90 transition-all cursor-pointer"
            >
              <ShoppingCart className="h-4.5 w-4.5 stroke-[1.9]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#B0CB1F] text-slate-950 text-[9px] font-black ring-1 ring-background">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="pb-28">
          {/* 2. Full-Width Hero Product Canvas (Screen 01 Matching Reference Design) */}
          <div className="space-y-3">
            <div className="relative w-full aspect-square bg-[#f8f7f4] dark:bg-[#18181b] flex items-center justify-center overflow-hidden select-none border-b border-black/[0.04] dark:border-white/[0.08]">
              <img
                src={galleryImages[activeImageIndex] || product.image}
                alt={product.title}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset["tried"]) {
                    target.dataset["tried"] = "true";
                    target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
                  }
                }}
                className="h-full w-full object-contain p-2 sm:p-4 drop-shadow-md transition-all duration-300"
              />

              {/* Discount Tag Top-Left (Matching Reference: Red Pill) */}
              {discountPercent && (
                <span className="absolute top-4 left-4 rounded-md bg-[#e11d48] text-white px-2.5 py-0.5 text-[10.5px] font-bold shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}

              {/* Floating Circular Wishlist Button Top-Right */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute top-4 right-4 z-10 grid h-8.5 w-8.5 place-items-center rounded-full bg-white/95 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-200 hover:text-rose-500 shadow-sm border border-black/[0.06] dark:border-white/10 backdrop-blur-xs transition-all active:scale-90 cursor-pointer"
              >
                <Heart className={`h-4.5 w-4.5 transition-colors ${isLiked ? "fill-rose-500 text-rose-500 stroke-rose-500" : ""}`} />
              </button>

              {/* Left / Right Gallery Chevrons */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-100 shadow-sm transition-all hover:scale-105 active:scale-90 cursor-pointer border border-black/[0.06] dark:border-white/10"
                  >
                    <ChevronLeft className="h-4.5 w-4.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-100 shadow-sm transition-all hover:scale-105 active:scale-90 cursor-pointer border border-black/[0.06] dark:border-white/10"
                  >
                    <ChevronRight className="h-4.5 w-4.5 stroke-[2.5]" />
                  </button>
                </>
              )}

              {/* Bottom-Right 1/6 Pill Indicator (Matching Reference) */}
              <div className="absolute bottom-3.5 right-4 z-10 px-2.5 py-0.5 rounded-full bg-neutral-900/80 text-white text-[10.5px] font-bold tracking-wide shadow-xs backdrop-blur-xs">
                {activeImageIndex + 1} / {galleryImages.length}
              </div>
            </div>

            {/* Thumbnail Strip (Matching Screen 01 from Reference) */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none px-4 py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-15 w-15 rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer shrink-0 bg-[#f8f7f4] dark:bg-neutral-800 p-1 ${
                      activeImageIndex === idx
                        ? "border-neutral-950 dark:border-white ring-2 ring-neutral-950/20 dark:ring-white/20 shadow-xs scale-105"
                        : "border-black/[0.08] dark:border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset["tried"]) {
                          target.dataset["tried"] = "true";
                          target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
                        }
                      }}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Padded Content Body for Info, Features, Accordions & Related */}
          <div className="px-4 space-y-4 pt-2">
            {/* 3. Product Information (Matching Screen 01) */}
          <div className="space-y-2 pt-1">
            {/* Product Title */}
            <h1 className="font-display text-2xl font-black text-neutral-950 dark:text-white tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              {product.shop ? `${product.shop} • ` : ""}{product.category ? (product.category.charAt(0).toUpperCase() + product.category.slice(1)) : "Collection"}
            </p>

            {/* Star Rating & In Stock Status Row */}
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setOpenMobileAccordions((prev) => ({ ...prev, reviews: true }));
                  const el = document.getElementById("reviews-mobile-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 font-bold cursor-pointer active:opacity-75"
              >
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{Number(product.rating || 5).toFixed(1)}</span>
                <span className="text-neutral-500 font-normal">({Number(product.reviews || 0).toLocaleString()} reviews)</span>
              </button>

              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>In Stock</span>
              </div>
            </div>

            {/* Price Row (Matching Reference) */}
            <div className="flex items-baseline gap-2.5 pt-1 flex-wrap">
              <span className="font-display text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
                {product.price}
              </span>
              {product.compareAt && (
                <span className="text-sm text-neutral-400 line-through font-normal">
                  {product.compareAt}
                </span>
              )}
              {discountPercent && (
                <span className="inline-flex items-center rounded-md bg-[#ffe4e6] text-[#e11d48] dark:bg-[#e11d48]/20 dark:text-[#fda4af] px-2 py-0.5 text-xs font-bold tracking-tight">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <p className="text-[11px] text-neutral-400 font-normal">
              Inclusive of all taxes
            </p>

            {/* Dynamic Delivery Info Banner */}
            <div className="pt-1.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#B0CB1F]/10 dark:bg-[#B0CB1F]/10 border border-[#B0CB1F]/25 dark:border-[#B0CB1F]/20 text-xs text-neutral-800 dark:text-neutral-200">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#B0CB1F]/25 dark:bg-[#B0CB1F]/20 text-[#5b6a07] dark:text-[#B0CB1F] shrink-0">
                    <Truck className="h-4 w-4 stroke-[2]" />
                  </div>
                  <div>
                    <span className="font-bold block text-neutral-950 dark:text-white text-xs">
                      {(parseInt(String(product.price).replace(/[^\d]/g, ""), 10) || 0) >= 499 ? "Free Delivery Available" : "Standard Express Shipping"}
                    </span>
                    <span className="text-[10.5px] text-neutral-500 dark:text-neutral-400">
                      {(parseInt(String(product.price).replace(/[^\d]/g, ""), 10) || 0) >= 499 ? "On orders above ₹499" : "Dispatches within 24–48 hours"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* 4. Key Features Grid (Dynamic from Product Features) */}
          {Array.isArray((product as any).features) && (product as any).features.length > 0 && (
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/10 space-y-3">
              <h3 className="font-display text-sm font-black text-neutral-950 dark:text-white tracking-tight">
                Key Features
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(product as any).features.map((feat: string, fIdx: number) => (
                  <div
                    key={fIdx}
                    className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#faf9f6] dark:bg-[#18181b] border border-black/[0.04] dark:border-white/[0.06]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#73880a] dark:text-[#B0CB1F] shrink-0" />
                    <span className="text-[11px] font-bold text-neutral-950 dark:text-white leading-tight">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Information Accordions (Matching Screen 02 from Reference) */}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/10 divide-y divide-black/[0.06] dark:divide-white/10 text-xs">
            {/* Product Description (Default: Open) */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileAccordion("desc")}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-neutral-950 dark:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="text-[13px] font-bold">Product Description</span>
                </div>
                <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${openMobileAccordions.desc ? "rotate-90" : ""}`} />
              </button>
              {openMobileAccordions.desc && (
                <div className="pb-3.5 text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-2.5 text-xs whitespace-pre-line">
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <p>
                      Discover the exceptional quality and craftsmanship of {product.title}. Curated by {product.shop} for everyday durability, performance, and style.
                    </p>
                  )}
                  {Array.isArray(product.materials) && product.materials.length > 0 && (
                    <div className="pt-2">
                      <span className="font-bold text-neutral-900 dark:text-white block mb-1">Highlights:</span>
                      <ul className="space-y-1">
                        {product.materials.map((m, mIdx) => (
                          <li key={mIdx} className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                            <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileAccordion("specs")}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-neutral-950 dark:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="text-[13px] font-bold">Specifications</span>
                </div>
                <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${openMobileAccordions.specs ? "rotate-90" : ""}`} />
              </button>
              {openMobileAccordions.specs && (
                <div className="pb-3.5 space-y-1.5 text-neutral-600 dark:text-neutral-300 text-xs divide-y divide-black/[0.04] dark:divide-white/5">
                  <div className="flex justify-between py-1.5">
                    <span>Brand</span>
                    <strong className="text-neutral-900 dark:text-white">{product.shop}</strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>Category</span>
                    <strong className="text-neutral-900 dark:text-white capitalize">{product.category}</strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>Warranty</span>
                    <strong className="text-neutral-900 dark:text-white">{product.warranty || "3 Days Checking Warranty / Replacement"}</strong>
                  </div>
                  {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                    product.specifications.map((spec, sIdx) => (
                      <div key={sIdx} className="flex justify-between py-1.5">
                        <span>{spec?.label || "Specification"}</span>
                        <strong className="text-neutral-900 dark:text-white text-right max-w-[60%]">{spec?.value || "-"}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between py-1.5">
                      <span>Dispatch</span>
                      <strong className="text-neutral-900 dark:text-white">Within 24 Hours Express</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* What's in the Box */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileAccordion("box")}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-neutral-950 dark:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="text-[13px] font-bold">What's in the Box</span>
                </div>
                <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${openMobileAccordions.box ? "rotate-90" : ""}`} />
              </button>
              {openMobileAccordions.box && (
                <div className="pb-3.5 text-neutral-600 dark:text-neutral-300 space-y-1.5 text-xs">
                  <p>• 1x {product.title}</p>
                  <p>• 1x USB-C Fast Charging Cable</p>
                  <p>• 1x Premium Carry Pouch</p>
                  <p>• 1x User Manual & 1-Year Warranty Card</p>
                </div>
              )}
            </div>

            {/* Shipping & Delivery */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileAccordion("shipping")}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-neutral-950 dark:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="text-[13px] font-bold">Shipping & Delivery</span>
                </div>
                <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${openMobileAccordions.shipping ? "rotate-90" : ""}`} />
              </button>
              {openMobileAccordions.shipping && (
                <div className="pb-3.5 text-neutral-600 dark:text-neutral-300 space-y-2 text-xs leading-relaxed">
                  <p>• <strong>Free Express Shipping:</strong> Orders dispatch within 24h and arrive in 2–4 business days.</p>
                  <p>• <strong>Cash on Delivery (COD) Available:</strong> Pay only when the package arrives at your doorstep.</p>
                </div>
              )}
            </div>

            {/* Returns & Warranty */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileAccordion("returns")}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-neutral-950 dark:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="text-[13px] font-bold">Returns & Warranty</span>
                </div>
                <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${openMobileAccordions.returns ? "rotate-90" : ""}`} />
              </button>
              {openMobileAccordions.returns && (
                <div className="pb-3.5 text-neutral-600 dark:text-neutral-300 space-y-2 text-xs leading-relaxed">
                  <p>• <strong>7-Day Easy Returns:</strong> Doorstep pickup and instant exchange or refund.</p>
                  <p>• <strong>1-Year Official Warranty:</strong> 100% replacement coverage for manufacturing defects.</p>
                </div>
              )}
            </div>

            {/* Customer Reviews (with star rating badge on right) */}
            <div id="reviews-mobile-section">
              <button
                type="button"
                onClick={() => toggleMobileAccordion("reviews")}
                className="w-full py-3.5 flex items-center justify-between text-left font-bold text-neutral-950 dark:text-white cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-neutral-500 shrink-0" />
                  <span className="text-[13px] font-bold">Customer Reviews ({Number(product.reviews || 0)})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-500">★ {Number(product.rating || 5).toFixed(1)}</span>
                  <ChevronRight className={`h-4 w-4 text-neutral-400 transition-transform ${openMobileAccordions.reviews ? "rotate-90" : ""}`} />
                </div>
              </button>
              {openMobileAccordions.reviews && (
                <div className="pb-4 space-y-4">
                  {/* Rating Breakdown Header */}
                  <div className="p-3.5 rounded-2xl bg-[#faf9f6] dark:bg-[#18181b] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-4">
                    <div className="text-center space-y-0.5">
                      <div className="text-3xl font-black text-neutral-950 dark:text-white font-display">
                        {Number(product.rating || 5).toFixed(1)}
                      </div>
                      <div className="flex text-amber-400 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{Number(product.reviews || 0)} Reviews</div>
                    </div>

                    <div className="flex-1 space-y-1 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>5★</span>
                        <div className="flex-1 bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#15803d] h-full rounded-full" style={{ width: "88%" }} />
                        </div>
                        <span className="w-6 text-right">88%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>4★</span>
                        <div className="flex-1 bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: "10%" }} />
                        </div>
                        <span className="w-6 text-right">10%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>3★</span>
                        <div className="flex-1 bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: "2%" }} />
                        </div>
                        <span className="w-6 text-right">2%</span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Verified Reviews List */}
                  <div className="space-y-3 divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                    {product.customerReviews && product.customerReviews.length > 0 ? (
                      product.customerReviews.map((rev) => (
                        <div key={rev.id} className="pt-3 space-y-1.5 first:pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-[10px]">
                                {String(rev.author || "Customer").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-neutral-950 dark:text-white leading-tight">
                                  {rev.author || "Customer"}
                                </div>
                                {rev.verified && (
                                  <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Verified Buyer
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                          </div>

                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (rev.rating || 5)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-neutral-300 dark:text-neutral-700"
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-[11.5px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No reviews yet. Verified purchases will appear here.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. "You May Also Like" Related Products (Matching Screen 02) */}
          <div className="pt-4 border-t border-black/[0.06] dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-black text-neutral-950 dark:text-white tracking-tight">
                You May Also Like
              </h3>
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="text-xs font-bold text-[#5b6a07] dark:text-[#B0CB1F] flex items-center gap-0.5 cursor-pointer active:opacity-75"
              >
                <span>View All</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.slice(0, 4).map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        </div>

        </main>
      </div>

      {/* ========================================================================= */}
      {/* SECTION C: STICKY DUAL CTA BAR (MATCHING SCREEN 01 & 02 FROM REFERENCE)   */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-black/[0.06] dark:border-white/10 px-4 py-3 pb-[calc(0.8rem+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5">
          {/* Add to Cart Button (White pill with border) */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 h-11 rounded-xl bg-white dark:bg-neutral-900 border border-black/15 dark:border-white/20 text-neutral-900 dark:text-white font-bold text-xs tracking-wide shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Added to Bag!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 stroke-[2]" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {/* Buy Now Button (FaasBay Signature Brand Button matching Desktop) */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 h-11 rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 font-black text-xs tracking-wide shadow-[0_4px_16px_rgba(176,203,31,0.3)] active:scale-95 transition-all flex items-center justify-center cursor-pointer gap-1.5"
          >
            <Zap className="h-4 w-4 fill-slate-950 stroke-none" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

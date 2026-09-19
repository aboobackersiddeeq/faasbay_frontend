import React, { useState } from "react";
import {
  X,
  Star,
  ShieldCheck,
  RotateCcw,
  Truck,
  Heart,
  Plus,
  Minus,
  CheckCircle2,
  Headphones,
  Zap,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  Sparkles,
  HelpCircle,
  Banknote,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStoreProducts, type Product } from "./data";

export function ProductDetailModal() {
  const {
    selectedProductForDetail,
    closeProductDetail,
    addToCart,
    buyNow,
    openProductDetail,
  } = useCart();
  const allStoreProducts = useStoreProducts();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Matte Black");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Accordion states
  const [specsOpen, setSpecsOpen] = useState(true);
  const [boxOpen, setBoxOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!selectedProductForDetail) return null;
  const p = selectedProductForDetail;

  // Calculate discount and savings safely
  const currentPriceNum = typeof p.price === "number"
    ? p.price
    : parseInt(String(p.price || "0").replace(/[^\d]/g, ""), 10) || 0;
  const compareAtNum = p.compareAt
    ? typeof p.compareAt === "number"
      ? p.compareAt
      : parseInt(String(p.compareAt).replace(/[^\d]/g, ""), 10) || null
    : null;
  const savings = compareAtNum && compareAtNum > currentPriceNum ? compareAtNum - currentPriceNum : 0;
  const discountPercent = compareAtNum && compareAtNum > currentPriceNum ? Math.round((savings / compareAtNum) * 100) : 30;

  // Color variants
  const colorOptions = [
    { name: "Matte Black", hex: "#1c1917" },
    { name: "Platinum Silver", hex: "#e7e5e4" },
    { name: "Midnight Navy", hex: "#1e293b" },
  ];

  // Gallery images (Strictly only the viewed product's images - never cross-product images)
  const galleryImages =
    p.images && p.images.length > 0 ? p.images : [p.image];

  // FAQ List
  const faqs = [
    {
      q: "How fast is delivery & shipping?",
      a: "All orders are dispatched within 24 hours via Express Air courier. Delivery takes 2-4 business days across India with live tracking sent to your WhatsApp and email.",
    },
    {
      q: "Is there a warranty included?",
      a: "Yes! Every gadget includes a 1-Year Official Brand Replacement Warranty covering manufacturing defects.",
    },
    {
      q: "What is the 30-Day return policy?",
      a: "If you are not 100% satisfied with your product, you can initiate a hassle-free doorstep return within 30 days for a full refund.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We support instant UPI (Google Pay, PhonePe, Paytm), All Major Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).",
    },
  ];

  const handleAddToCart = () => {
    addToCart(p, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    closeProductDetail();
    buyNow(p, quantity, selectedColor !== "None" ? selectedColor : undefined);
  };

  // Related products from live store catalog
  const relatedProducts = allStoreProducts.filter((item) => item.id !== p.id).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeProductDetail}
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-label={p.title}
        className="relative z-50 flex h-full sm:h-auto sm:max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden bg-white dark:bg-stone-950 sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl animate-in zoom-in-95 duration-200 text-stone-900 dark:text-stone-100"
      >
        {/* Sticky Top Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md px-4 py-3 sm:px-6">
          {/* Breadcrumbs Navigation (Matching Reference) */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="hover:text-emerald-700 cursor-pointer">Home</span>
            <span>&gt;</span>
            <span className="hover:text-emerald-700 cursor-pointer capitalize">{p.category}</span>
            <span>&gt;</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 truncate max-w-[200px] sm:max-w-[300px]">
              {p.title}
            </span>
          </div>

          <button
            type="button"
            onClick={closeProductDetail}
            aria-label="Close product anatomy"
            className="grid h-8 w-8 place-items-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-32 sm:pb-8">
          
          {/* ========================================================================= */}
          {/* 1. HERO PRODUCT ANATOMY SECTION (2-COLUMNS: GALLERY + BUY BOX)           */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT: PRODUCT IMAGE GALLERY (5 cols) */}
            <div className="lg:col-span-6 space-y-3">
              {/* Main Showcase Image Container */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center justify-center">
                <img
                  src={galleryImages[activeImageIndex] || p.image}
                  alt={p.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset["tried"]) {
                      target.dataset["tried"] = "true";
                      target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
                    }
                  }}
                  className="h-full w-full object-cover transition-all duration-300"
                />

                {/* Discount Tag */}
                <span className="absolute top-3 left-3 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-2.5 py-1 text-[11px] font-black tracking-wide shadow-md">
                  -{discountPercent}% OFF
                </span>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => setIsLiked(!isLiked)}
                  aria-label="Wishlist"
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 dark:bg-stone-800/90 shadow-md backdrop-blur-xs text-stone-700 dark:text-stone-200 hover:scale-110 active:scale-90 transition-all"
                >
                  <Heart
                    className={`h-4 w-4 stroke-[2] ${
                      isLiked ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                </button>
              </div>

              {/* 4 Interactive Thumbnail Slots (Matching Reference Image) */}
              <div className="grid grid-cols-4 gap-2.5">
                {galleryImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-emerald-600 ring-2 ring-emerald-600/30"
                        : "border-stone-200 dark:border-stone-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Angle ${idx + 1}`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset["tried"]) {
                          target.dataset["tried"] = "true";
                          target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
                        }
                      }}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: PRICING, VARIANTS, CTA & URGENCY (7 cols) */}
            <div className="lg:col-span-6 space-y-4">
              
              <div>
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  {p.shop}
                </span>
                <h1 className="font-extrabold text-xl sm:text-2xl text-stone-900 dark:text-stone-50 leading-tight mt-1">
                  {p.title}
                </h1>

                {/* Star Ratings & Verified Badge */}
                <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {Number(p.rating || 5).toFixed(1)}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400">
                    ({Number(p.reviews || 0).toLocaleString()} verified customer reviews)
                  </span>
                </div>
              </div>

              {/* Pricing, Discounts & Offers Card (Matching Reference) */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-1.5">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-stone-900 dark:text-stone-50 tracking-tight">
                    {p.price}
                  </span>
                  {p.compareAt && (
                    <span className="text-base text-stone-400 line-through font-medium">
                      {p.compareAt}
                    </span>
                  )}
                  {savings > 0 && (
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      You save ₹{savings.toLocaleString()} ({discountPercent}%)
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] text-stone-500 dark:text-stone-400">
                  Inclusive of all taxes · Free Delivery on prepaid orders
                </div>
              </div>

              {/* Psychological Urgency Live Counter */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 font-semibold">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0 animate-bounce" />
                <span>
                  🔥 <strong>{p.boughtLast24h || 38} people ordered</strong> in last 24h ·{" "}
                  <strong>{p.viewersNow || 16} viewing right now</strong>
                </span>
              </div>

              {/* Color Swatches */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  Color: <strong className="text-stone-900 dark:text-white">{selectedColor}</strong>
                </span>
                <div className="flex items-center gap-2.5">
                  {colorOptions.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                        selectedColor === c.name
                          ? "border-emerald-600 ring-2 ring-emerald-600/30 scale-110"
                          : "border-stone-300 dark:border-stone-700"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {selectedColor === c.name && (
                        <CheckCircle2
                          className={`h-4 w-4 ${c.name === "Platinum Silver" ? "text-stone-900" : "text-white"}`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & High-Converting Buy CTAs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Quantity:</span>
                  <div className="flex items-center rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="grid h-9 w-9 place-items-center text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 active:scale-90"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-3 text-xs font-black text-stone-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="grid h-9 w-9 place-items-center text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 active:scale-90"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {p.stock && p.stock <= 5 && (
                    <span className="text-xs font-extrabold text-rose-600">
                      ⚠️ Only {p.stock} units left!
                    </span>
                  )}
                </div>

                {/* Primary Dual CTA Buttons (Matching Reference Anatomy) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-extrabold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-xs ${
                      justAdded
                        ? "border-[#0f766e] bg-[#0f766e] text-white"
                        : "border-[#0f766e] text-[#0f766e] hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0f766e] hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Zap className="h-4 w-4 fill-current" />
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* Estimated Delivery & COD Prompts */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-600 dark:text-stone-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Free Express Shipping (2–4 Days)</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                    <Banknote className="h-3.5 w-3.5 shrink-0" />
                    <span>Cash on Delivery Available</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. 4-PILLAR TRUST BADGES ROW (MATCHING REFERENCE ANATOMY)                */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-stone-900 dark:text-white block">Free Shipping</span>
                <span className="text-[11px] text-stone-500">Free delivery on all orders</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-stone-900 dark:text-white block">30-Day Returns</span>
                <span className="text-[11px] text-stone-500">100% money back guarantee</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-stone-900 dark:text-white block">Secure Payment</span>
                <span className="text-[11px] text-stone-500">256-bit SSL encrypted</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-stone-900 dark:text-white block">Live Support</span>
                <span className="text-[11px] text-stone-500">24/7 dedicated assistance</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. 3-COLUMN DEEP-DIVE SECTION (DESCRIPTION, REVIEWS, FAQ)                */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* COLUMN 1: PRODUCT DESCRIPTION & SPECS */}
            <div className="space-y-4 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-950">
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-800">
                Product Details
              </h3>
              
              <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                {p.description ||
                  "Engineered with aerospace-grade materials and custom dynamic acoustic tuning. Designed for all-day comfort with active noise cancellation and multi-device fast pairing."}
              </p>

              {/* Key Bullet Features */}
              <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  <span>Industry-leading active noise cancellation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  <span>Up to 40 hours of continuous battery playback</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  <span>Quick charge: 10 min charge for 5 hours play</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  <span>Multipoint seamless Bluetooth 5.3 pairing</span>
                </div>
              </div>

              {/* Accordion: Specifications */}
              <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
                <button
                  type="button"
                  onClick={() => setSpecsOpen(!specsOpen)}
                  className="flex items-center justify-between w-full text-xs font-bold text-stone-900 dark:text-white cursor-pointer"
                >
                  <span>Technical Specifications</span>
                  {specsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {specsOpen && (
                  <div className="mt-2 space-y-1 text-[11px] text-stone-500 dark:text-stone-400">
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                      <span>Driver Size</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">40mm Custom</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                      <span>Frequency</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">4Hz - 40,000Hz</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Weight</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">254g</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion: What's in the Box */}
              <div className="border-t border-stone-100 dark:border-stone-800 pt-3">
                <button
                  type="button"
                  onClick={() => setBoxOpen(!boxOpen)}
                  className="flex items-center justify-between w-full text-xs font-bold text-stone-900 dark:text-white cursor-pointer"
                >
                  <span>What's in the Box</span>
                  {boxOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {boxOpen && (
                  <div className="mt-2 space-y-1 text-[11px] text-stone-600 dark:text-stone-400">
                    <div>✓ 1x {p.title}</div>
                    <div>✓ 1x USB-C Braided Fast Charge Cable</div>
                    <div>✓ 1x Hard Travel Case</div>
                    <div>✓ 1x User Manual & 1-Yr Warranty Card</div>
                  </div>
                )}
              </div>

            </div>

            {/* COLUMN 2: CUSTOMER REVIEWS BREAKDOWN */}
            <div className="space-y-4 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-950">
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-800">
                Customer Ratings
              </h3>

              {/* Overall Score */}
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black text-stone-900 dark:text-white">{Number(p.rating || 5).toFixed(1)}</div>
                <div>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {Array.isArray(p.customerReviews) && p.customerReviews.length > 0
                      ? `${p.customerReviews.length} reviews`
                      : "0 reviews"}
                  </span>
                </div>
              </div>

              {/* Buyer Reviews Snippets */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                {Array.isArray(p.customerReviews) && p.customerReviews.length > 0 ? (
                  p.customerReviews.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-900 dark:text-white">{rev.author}</span>
                        {rev.verified && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded font-semibold">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-[11.5px] text-stone-600 dark:text-stone-300 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 py-3 text-center">
                    No reviews yet. Verified customer reviews will appear here.
                  </p>
                )}
              </div>
            </div>

            {/* COLUMN 3: FREQUENTLY ASKED QUESTIONS (FAQ) */}
            <div className="space-y-4 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-950">
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-emerald-600" />
                <span>Buyer FAQs</span>
              </h3>

              <div className="space-y-2 text-xs">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 space-y-1"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="flex items-center justify-between w-full font-bold text-left text-stone-900 dark:text-white cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {openFaq === idx ? (
                        <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </button>
                    {openFaq === idx && (
                      <p className="text-[11.5px] text-stone-600 dark:text-stone-300 leading-relaxed pt-1">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 4. RELATED PRODUCTS ROW (MATCHING REFERENCE ANATOMY)                      */}
          {/* ========================================================================= */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                  Related Gadgets & Accessories
                </h3>
                <p className="text-xs text-stone-400">Buyers also purchased these alongside</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id}
                  onClick={() => openProductDetail(rp)}
                  className="p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/40 hover:border-emerald-500 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img src={rp.image} alt={rp.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-white line-clamp-1 group-hover:text-emerald-700">
                    {rp.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-stone-900 dark:text-white">{rp.price}</span>
                    <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400" /> {rp.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sticky Bottom Bar on Mobile */}
        <div className="fixed sm:hidden bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-surface/95 dark:bg-stone-950/95 px-4 py-3 pb-[calc(0.8rem+env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-md flex items-center gap-2">
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#d9f99d] via-[#bef264] to-[#a3e635] text-neutral-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <Zap className="h-4 w-4 fill-neutral-950 stroke-none" />
            <span>Book Order {p.price}</span>
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-surface text-foreground shadow-xs active:scale-90 cursor-pointer"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

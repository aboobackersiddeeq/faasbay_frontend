import React, { useState } from "react";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Bell,
  SlidersHorizontal,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogIn,
  Headphones,
  Watch,
  Keyboard,
  BatteryCharging,
  Gamepad2,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Layers,
  Smartphone,
  Car,
  HeartPulse,
  UtensilsCrossed,
  Lightbulb,
  Box,
  Luggage,
  Home,
  ShieldAlert,
  BookOpen,
  Wrench,
  Smile,
} from "lucide-react";
import faasbayLogo from "@/assets/faasbay-logo.png";
import { HeaderQuickNav } from "./HeaderQuickNav";
import { useCart } from "@/hooks/use-cart";

export function Header() {
  const {
    itemCount,
    openCart,
    openAuthModal,
    userProfile,
    selectedCategory,
    setSelectedCategory,
    recordCategoryView,
    searchQuery,
    setSearchQuery,
  } = useCart();
  const [searchTerm, setSearchTerm] = useState(searchQuery || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  React.useEffect(() => {
    setSearchTerm(searchQuery || "");
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const catalogElement = document.getElementById("catalog-section") || document.getElementById("categories");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCategoryClick = (id: string) => {
    setSelectedCategory(id);
    setIsMobileMenuOpen(false);
    if (id !== "all") {
      recordCategoryView(id);
    }
    const catalogElement = document.getElementById("catalog-section") || document.getElementById("categories");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filterChips = [
    { id: "all", label: "All Products", icon: Layers },
    { id: "mobile-electronics", label: "Mobile & Electronics", icon: Smartphone },
    { id: "audio-speakers", label: "Audio & Speakers", icon: Headphones },
    { id: "car-accessories", label: "Car Accessories", icon: Car },
    { id: "home-cleaning", label: "Home Cleaning", icon: Sparkles },
    { id: "kitchen-dining", label: "Kitchen & Dining", icon: UtensilsCrossed },
  ];

  const categories = [
    { id: "all", label: "All Products", icon: Layers, desc: "Explore entire catalogue" },
    { id: "mobile-electronics", label: "Mobile & Electronics", icon: Smartphone, desc: "Smartphones, chargers & accessories" },
    { id: "audio-speakers", label: "Audio & Speakers", icon: Headphones, desc: "Studio acoustics & wireless audio" },
    { id: "car-accessories", label: "Car Accessories", icon: Car, desc: "Dashboard mounts, chargers & tech" },
    { id: "home-cleaning", label: "Home Cleaning & Appliances", icon: Sparkles, desc: "Vacuum, sprays & smart cleaners" },
    { id: "health-wellness", label: "Health, Wellness & Massage", icon: HeartPulse, desc: "Massagers & relaxation essentials" },
    { id: "beauty-personal-care", label: "Beauty & Personal Care", icon: Smile, desc: "Grooming, skincare & haircare" },
    { id: "kitchen-dining", label: "Kitchen & Dining", icon: UtensilsCrossed, desc: "Cookware, organizers & dinnerware" },
    { id: "lighting", label: "Lights & Home Lighting", icon: Lightbulb, desc: "Ambient LEDs & modern lamps" },
    { id: "kids-toys", label: "Kids & Toys", icon: Gamepad2, desc: "Educational toys & play sets" },
    { id: "watches-fashion", label: "Watches & Fashion Accessories", icon: Watch, desc: "Luxury watches, bands & accessories" },
    { id: "storage-organizers", label: "Storage & Organizers", icon: Box, desc: "Modular drawer & closet bins" },
    { id: "travel-products", label: "Travel Products", icon: Luggage, desc: "Suitcases, backpacks & travel gear" },
    { id: "home-lifestyle", label: "Home & Lifestyle", icon: Home, desc: "Modern home decor & living essentials" },
    { id: "pest-control", label: "Pest Control", icon: ShieldAlert, desc: "Ultrasonic repellers & safe pest solutions" },
    { id: "stationery-office", label: "Stationery & Office", icon: BookOpen, desc: "Desk journals, organizers & pens" },
    { id: "utility-tools", label: "Utility & Tools", icon: Wrench, desc: "Multi-tools, hardware & DIY gear" },
  ];

  const INITIAL_CATEGORY_COUNT = 6; // Shows All Products + first 5 categories
  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, INITIAL_CATEGORY_COUNT);
  const hiddenCount = categories.length - INITIAL_CATEGORY_COUNT;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/[0.06] dark:border-white/10 bg-surface/80 backdrop-blur-xl transition-all shadow-[0_1px_15px_rgba(0,0,0,0.02)]">
      {/* 1. DESKTOP & TABLET HEADER (100% Intact & Untouched) */}
      <div className="mx-auto hidden max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6 py-3 md:flex">
        {/* Left: Brand Logo */}
        <a href="/" className="flex items-center gap-2 group shrink-0">
          <img
            src={faasbayLogo}
            alt="FaasBay — to cart... to life..."
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </a>

        {/* Center: Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex max-w-xl flex-1 items-center rounded-full border border-input/80 bg-secondary/60 backdrop-blur-md pl-4 pr-1.5 py-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-neutral-400 focus-within:bg-surface focus-within:ring-2 focus-within:ring-neutral-400/10 transition-all"
        >
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ANC audio, smartwatches, mechanical keyboards, power docks..."
            aria-label="Search products"
            className="w-full bg-transparent text-xs sm:text-[13px] text-foreground outline-none placeholder:text-muted-foreground font-medium"
          />
          <button
            type="submit"
            aria-label="Search button"
            className="grid h-8 w-8 place-items-center rounded-full bg-neutral-900 text-white hover:bg-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-95 transition-all cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 stroke-[2.2]" />
          </button>
        </form>

        {/* Right: Quick Action Icons */}
        <nav className="flex items-center gap-1">
          {/* <button
            type="button"
            aria-label="Wishlist"
            className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary cursor-pointer"
          >
            <Heart className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary cursor-pointer"
          >
            <Bell className="h-[18px] w-[18px]" />
          </button> */}
          <button
            type="button"
            aria-label="Account"
            onClick={openAuthModal}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary cursor-pointer"
          >
            {userProfile ? (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#B0CB1F] text-slate-950 font-black text-[11px]">
                {userProfile.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-[18px] w-[18px]" />
            )}
          </button>

          {/* Cart Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              openCart();
            }}
            aria-label={`Cart, ${itemCount} items`}
            className="relative grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary cursor-pointer"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-neutral-900 px-1 text-[9.5px] font-bold text-white shadow-xs animate-in zoom-in-50">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* 2. MOBILE HEADER (Premium iPhone App-Style Top Navigation) */}
      <div className="px-4 pt-3 pb-2.5 md:hidden space-y-2.5">
        {/* Top Header Row: [Brand Logo / Wordmark] [Wishlist + Cart] */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Brand Logo & Menu Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open category menu"
              className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/80 text-foreground hover:bg-secondary active:scale-90 transition-all cursor-pointer shrink-0 border border-border/50"
            >
              <Menu className="h-4.5 w-4.5 stroke-[2.2]" />
            </button>
            <a href="/" className="flex items-center gap-2 group">
              <img
                src={faasbayLogo}
                alt="FaasBay"
                className="h-7 w-auto object-contain transition-transform active:scale-95"
              />
            </a>
          </div>

          {/* Right Action Icons: [Wishlist] [Cart Bag] */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("catalog-section") || document.getElementById("categories");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              aria-label="Wishlist"
              className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/60 text-foreground active:scale-90 transition-all cursor-pointer border border-border/40"
            >
              <Heart className="h-4.5 w-4.5 stroke-[2]" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                openCart();
              }}
              aria-label={`Cart with ${itemCount} items`}
              className="relative grid h-9 w-9 place-items-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs active:scale-90 transition-all cursor-pointer shrink-0"
            >
              <ShoppingCart className="h-4 w-4 stroke-[2.2]" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-emerald-600 text-white px-1 text-[9px] font-black shadow-xs ring-2 ring-surface animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Full-Width Prominent Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center rounded-xl border border-black/[0.08] dark:border-white/15 bg-neutral-100/90 dark:bg-neutral-800/70 px-3.5 py-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-neutral-900 dark:focus-within:border-white focus-within:bg-surface transition-all"
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0 stroke-[2.2]" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audio, smartwatches, keyboards..."
            aria-label="Search products"
            className="min-w-0 flex-1 bg-transparent px-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSearchQuery("");
              }}
              aria-label="Clear search"
              className="mr-1 grid h-5 w-5 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground active:scale-90"
            >
              <X className="h-3 w-3 stroke-[2.5]" />
            </button>
          )}
        </form>
      </div>

      {/* 3. MOBILE SLIDE-OUT CATEGORY DRAWER / SHEET */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop: Tapping anywhere on the right / outside closes the drawer immediately */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Close menu backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            onTouchEnd={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer z-40"
          />

          {/* Drawer Content — Full Screen Height with stopPropagation */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-50 w-[85%] max-w-[320px] bg-surface h-[100dvh] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200"
          >
            {/* Top Drawer Content */}
            <div>
              {/* Sticky Top Bar (Close Button + Brand) */}
              <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <img src={faasbayLogo} alt="FaasBay" className="h-6 w-auto object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground active:scale-90 transition-all cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* USER ACCOUNT / SIGN IN CARD (Top position for effortless access) */}
              <div className="p-3 border-b border-border/70 bg-gradient-to-br from-secondary/50 to-secondary/20">
                {userProfile ? (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-card border border-border/80 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-950 text-white font-black text-xs shadow-xs">
                        {userProfile.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {userProfile.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {userProfile.phone || userProfile.email || "Active Member"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-secondary text-foreground text-[11px] font-semibold hover:bg-neutral-200 active:scale-95 transition-all shrink-0 cursor-pointer"
                    >
                      Account
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">Welcome to FaasBay</p>
                        <p className="text-[10px] text-muted-foreground">Sign in for orders & fast checkout</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer hover:opacity-90"
                    >
                      <LogIn className="h-3.5 w-3.5 stroke-[2.2]" />
                      <span>Sign In / Register</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Categories Title */}
              <div className="px-4 pt-3.5 pb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Shop By Category
                </span>
                <span className="text-[10.5px] font-semibold text-neutral-950 dark:text-white">
                  {categories.length - 1} Categories
                </span>
              </div>

              {/* Categories List (Initial 5 categories + expand toggle) */}
              <div className="p-2 space-y-1">
                {displayedCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all text-left group cursor-pointer ${
                        isSelected
                          ? "bg-neutral-950 text-white shadow-xs"
                          : "hover:bg-secondary/70 active:scale-[0.98]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`grid h-8.5 w-8.5 shrink-0 place-items-center rounded-xl transition-colors ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-secondary text-foreground group-hover:bg-neutral-950 group-hover:text-white"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              isSelected
                                ? "text-white"
                                : "text-foreground group-hover:text-neutral-950 dark:group-hover:text-white"
                            }`}
                          >
                            {cat.label}
                          </p>
                          <p
                            className={`text-[10px] truncate ${
                              isSelected ? "text-white/80" : "text-muted-foreground"
                            }`}
                          >
                            {cat.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isSelected
                            ? "text-white"
                            : "text-muted-foreground group-hover:translate-x-0.5"
                        }`}
                      />
                    </button>
                  );
                })}

                {/* View More Categories / Show Less Button */}
                <button
                  type="button"
                  onClick={() => setShowAllCategories((prev) => !prev)}
                  className="w-full mt-1.5 py-2.5 px-3 rounded-2xl border border-dashed border-border hover:border-neutral-900 bg-secondary/40 hover:bg-secondary text-foreground text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                >
                  {showAllCategories ? (
                    <>
                      <span>Show Less</span>
                      <ChevronUp className="h-4 w-4 stroke-[2.2]" />
                    </>
                  ) : (
                    <>
                      <span>View More Categories (+{hiddenCount})</span>
                      <ChevronDown className="h-4 w-4 stroke-[2.2]" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Drawer Guarantees & Quick Links */}
            <div className="p-4 border-t border-border bg-secondary/30 space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>1-Yr Warranty</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Fast Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                  <span>Easy 7D Returns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  <span>100% Genuine</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openCart();
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>View My Bag ({itemCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Quick Nav Strip (Hidden on Mobile) */}
      <div className="hidden md:block">
        <HeaderQuickNav />
      </div>
    </header>
  );
}

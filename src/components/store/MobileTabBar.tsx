import React, { useState } from "react";
import { Home, Layers, Search, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

export function MobileTabBar() {
  const [activeTab, setActiveTab] = useState("home");
  const { itemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (id === "cart") {
      openCart();
    } else if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "categories") {
      const el = document.getElementById("categories") || document.getElementById("catalog-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (id === "search") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement | null;
        if (searchInput) searchInput.focus();
      }, 300);
    } else if (id === "wishlist") {
      const el = document.getElementById("catalog-section") || document.querySelector("main");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "search", label: "Search", icon: Search },
    { id: "wishlist", label: "Wishlist", icon: Heart, badge: wishlistCount },
    { id: "cart", label: "Cart", icon: ShoppingBag, badge: itemCount },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.06] dark:border-white/10 bg-surface/95 backdrop-blur-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.04)] md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className="relative flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 text-center transition-all duration-200 cursor-pointer select-none active:scale-90"
            >
              <div
                className={`relative flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "text-neutral-950 dark:text-white"
                    : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? "stroke-[2.4px] scale-105" : "stroke-[1.8px]"
                  }`}
                />

                {/* Live Animated Bag Badge */}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -right-2.5 -top-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 px-1 text-[9px] font-black shadow-xs ring-2 ring-surface animate-in zoom-in-50">
                    {tab.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`mt-1 text-[10px] tracking-tight transition-colors ${
                  isActive
                    ? "font-extrabold text-neutral-950 dark:text-white"
                    : "font-medium text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {tab.label}
              </span>

              {/* Active Dot Indicator */}
              {isActive && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-neutral-950 dark:bg-white animate-in zoom-in-50 duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

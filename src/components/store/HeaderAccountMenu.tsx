import React, { useState } from "react";
import {
  ChevronDown,
  Heart,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { openWishlist } from "@/hooks/use-wishlist";

/** "Name ⌄" header trigger that reveals the account links on hover. */
export function HeaderAccountMenu() {
  const [open, setOpen] = useState(false);
  const { userProfile, openAuthModal, openAccountView, logoutUser } = useCart();

  // Signed out: a plain button that opens the login modal.
  if (!userProfile) {
    return (
      <button
        type="button"
        onClick={openAuthModal}
        className="flex h-9 items-center px-3 text-sm font-medium text-foreground transition-colors hover:text-foreground/70 cursor-pointer"
      >
        Login
      </button>
    );
  }

  const items: { label: string; Icon: LucideIcon; onSelect: () => void; danger?: boolean }[] = [
    { label: "My Profile", Icon: UserCircle, onSelect: () => openAccountView("menu") },
    { label: "Change Password", Icon: KeyRound, onSelect: () => openAccountView("password") },
    { label: "Orders", Icon: Package, onSelect: () => openAccountView("orders") },
    { label: "Saved Addresses", Icon: MapPin, onSelect: () => openAccountView("addresses") },
    { label: "Wishlist", Icon: Heart, onSelect: openWishlist },
    { label: "Logout", Icon: LogOut, onSelect: logoutUser, danger: true },
  ];

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 pl-1.5 pr-3 text-sm font-medium text-foreground cursor-pointer"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#B0CB1F] text-slate-950 font-black text-[11px]">
          {userProfile.name.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[120px] truncate">{userProfile.name.split(" ")[0]}</span>
        <ChevronDown
          className={`h-4 w-4 stroke-[2.2] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        // pt-2 bridges the gap so the pointer can travel into the panel without closing it.
        <div className="absolute right-0 top-full z-50 pt-2">
          <div
            role="menu"
            className="w-64 rounded-2xl border border-border bg-surface py-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-in fade-in-0 slide-in-from-top-1 duration-150"
          >
            <p className="px-5 pb-1.5 text-sm font-bold text-foreground">Your Account</p>
            {items.map(({ label, Icon, onSelect, danger }) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onSelect();
                }}
                className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                  danger
                    ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 stroke-[1.8]" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

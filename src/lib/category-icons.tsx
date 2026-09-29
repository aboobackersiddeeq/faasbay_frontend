// ============================================================================
// FaasBay — Category icon library
// ============================================================================
//
// Categories store an icon *key* (e.g. "headphones"), never an emoji. Admin picks
// from this list and the storefront renders the same SVG, so both always match.

import React from "react";
import {
  Baby,
  Bike,
  Camera,
  Coffee,
  Dumbbell,
  Flower2,
  Folder,
  Gamepad2,
  Gem,
  Gift,
  Keyboard,
  Laptop,
  Leaf,
  Music,
  Package,
  PawPrint,
  Pill,
  Plug,
  Printer,
  Scissors,
  Shirt,
  Sofa,
  Tag,
  Tv,
  type LucideIcon,
} from "lucide-react";

const ACCENT = "#B0CB1F";
const LIME = "#B0CB1F";

type SvgProps = { className?: string };

const Svg = ({ className, children }: SvgProps & { children: React.ReactNode }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {children}
  </svg>
);

/** Hand-drawn two-tone icons used across the storefront category rail. */
const CUSTOM_ICONS: Record<string, { label: string; render: (p: SvgProps) => React.ReactNode }> = {
  "for-you": {
    label: "For You",
    render: (p) => (
      <Svg {...p}>
        <path d="M10.5 8a4 4 0 0 1 8 0Z" fill={ACCENT} />
        <path d="M4.5 8h15l-1.2 11.2a2 2 0 0 1-2 1.8H7.7a2 2 0 0 1-2-1.8L4.5 8Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M9.5 12.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </Svg>
    ),
  },
  sparkle: {
    label: "Sparkle",
    render: (p) => (
      <Svg {...p}>
        <path d="M12 2.5L14.4 9.6L21.5 12L14.4 14.4L12 21.5L9.6 14.4L2.5 12L9.6 9.6L12 2.5Z" fill={ACCENT} stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <circle cx="18.5" cy="5.5" r="1.5" fill={LIME} />
        <circle cx="5.5" cy="18.5" r="1.5" fill={LIME} />
      </Svg>
    ),
  },
  phone: {
    label: "Phone",
    render: (p) => (
      <Svg {...p}>
        <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="5" r="1" fill={ACCENT} />
        <path d="M8 8h8" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
  headphones: {
    label: "Headphones",
    render: (p) => (
      <Svg {...p}>
        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 14v4a1 1 0 0 0 1 1h2v-5H4a1 1 0 0 0-1 1Z" fill={ACCENT} />
        <path d="M19 14v4a1 1 0 0 1-1 1h-2v-5h2a1 1 0 0 1 1 1Z" fill={ACCENT} />
      </Svg>
    ),
  },
  car: {
    label: "Car",
    render: (p) => (
      <Svg {...p}>
        <path d="M5 17h14M4 14l2-6h12l2 6v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7.5" cy="14.5" r="1.5" fill={ACCENT} stroke="currentColor" strokeWidth="1" />
        <circle cx="16.5" cy="14.5" r="1.5" fill={ACCENT} stroke="currentColor" strokeWidth="1" />
      </Svg>
    ),
  },
  cleaning: {
    label: "Cleaning",
    render: (p) => (
      <Svg {...p}>
        <path d="M12 3v4M8 5l2 2M16 5l-2 2" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 10h12l-1.5 9a2 2 0 0 1-2 1.7h-5a2 2 0 0 1-2-1.7L6 10Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M9 14h6" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    ),
  },
  health: {
    label: "Health",
    render: (p) => (
      <Svg {...p}>
        <path d="M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 1 1 7.5-6.566 5 5 0 1 1 7.5 6.566Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 12h2.5l1.5-3 2 6 1.5-3h2.5" stroke={ACCENT} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  beauty: {
    label: "Beauty",
    render: (p) => (
      <Svg {...p}>
        <rect x="7" y="8" width="10" height="13" rx="3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M10 8V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2v2" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="14" r="2.5" fill={ACCENT} />
      </Svg>
    ),
  },
  cookware: {
    label: "Cookware",
    render: (p) => (
      <Svg {...p}>
        <path d="M3 11h14a1 1 0 0 1 1 1v1a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-1a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M18 14h3a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M7 6v2M10 5v3M13 6v2" stroke={ACCENT} strokeWidth="1.75" strokeLinecap="round" />
      </Svg>
    ),
  },
  bulb: {
    label: "Light Bulb",
    render: (p) => (
      <Svg {...p}>
        <path d="M9 18h6M10 21h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 3a7 7 0 0 0-4.5 12.3c.6.5 1 1.2 1.2 1.7h6.6c.2-.5.6-1.2 1.2-1.7A7 7 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="9" r="3" fill={ACCENT} stroke={LIME} strokeWidth="1" />
      </Svg>
    ),
  },
  teddy: {
    label: "Teddy",
    render: (p) => (
      <Svg {...p}>
        <circle cx="12" cy="13" r="6" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="7" cy="7" r="2.5" fill={ACCENT} stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17" cy="7" r="2.5" fill={ACCENT} stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="12" r="1" fill="currentColor" />
        <circle cx="14" cy="12" r="1" fill="currentColor" />
        <path d="M11 15c.5.5 1.5.5 2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
  watch: {
    label: "Watch",
    render: (p) => (
      <Svg {...p}>
        <rect x="6" y="5" width="12" height="14" rx="4" stroke="currentColor" strokeWidth="1.75" />
        <path d="M9 5V2h6v3M9 19v3h6v-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" fill={ACCENT} stroke={LIME} strokeWidth="1.2" />
        <path d="M12 10.5v1.5l1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </Svg>
    ),
  },
  storage: {
    label: "Storage",
    render: (p) => (
      <Svg {...p}>
        <rect x="3" y="4" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <rect x="3" y="14" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M10 7h4M10 17h4" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    ),
  },
  luggage: {
    label: "Luggage",
    render: (p) => (
      <Svg {...p}>
        <rect x="6" y="7" width="12" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="21" r="1" fill={ACCENT} />
        <circle cx="15.5" cy="21" r="1" fill={ACCENT} />
        <path d="M6 11h12M6 16h12" stroke={ACCENT} strokeWidth="1.2" />
      </Svg>
    ),
  },
  home: {
    label: "Home",
    render: (p) => (
      <Svg {...p}>
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M10 15h4v6h-4v-6Z" fill={ACCENT} stroke="currentColor" strokeWidth="1.2" />
      </Svg>
    ),
  },
  shield: {
    label: "Shield",
    render: (p) => (
      <Svg {...p}>
        <path d="M12 3a9 9 0 0 0-9 9c0 5 4 8 9 9s9-4 9-9a9 9 0 0 0-9-9Z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M13 7l-3 5h4l-2 5" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  notebook: {
    label: "Notebook",
    render: (p) => (
      <Svg {...p}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M9 6h6M9 10h4" stroke={ACCENT} strokeWidth="1.75" strokeLinecap="round" />
      </Svg>
    ),
  },
  tools: {
    label: "Tools",
    render: (p) => (
      <Svg {...p}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="1" fill={ACCENT} />
      </Svg>
    ),
  },
};

/** Extra single-tone icons for categories added later from the admin. */
const LUCIDE_ICONS: Record<string, { label: string; Icon: LucideIcon }> = {
  laptop: { label: "Laptop", Icon: Laptop },
  tv: { label: "TV", Icon: Tv },
  camera: { label: "Camera", Icon: Camera },
  keyboard: { label: "Keyboard", Icon: Keyboard },
  gamepad: { label: "Gaming", Icon: Gamepad2 },
  plug: { label: "Plug", Icon: Plug },
  printer: { label: "Printer", Icon: Printer },
  music: { label: "Music", Icon: Music },
  shirt: { label: "Clothing", Icon: Shirt },
  gem: { label: "Jewellery", Icon: Gem },
  scissors: { label: "Grooming", Icon: Scissors },
  pill: { label: "Medicine", Icon: Pill },
  dumbbell: { label: "Fitness", Icon: Dumbbell },
  bike: { label: "Bike", Icon: Bike },
  baby: { label: "Baby", Icon: Baby },
  paw: { label: "Pets", Icon: PawPrint },
  sofa: { label: "Furniture", Icon: Sofa },
  coffee: { label: "Coffee", Icon: Coffee },
  leaf: { label: "Garden", Icon: Leaf },
  flower: { label: "Flowers", Icon: Flower2 },
  gift: { label: "Gifts", Icon: Gift },
  tag: { label: "Offers", Icon: Tag },
  package: { label: "Package", Icon: Package },
  folder: { label: "Folder", Icon: Folder },
};

export const DEFAULT_CATEGORY_ICON = "folder";

/** Every icon the admin can pick, in display order. */
export const CATEGORY_ICON_OPTIONS: { key: string; label: string }[] = [
  ...Object.entries(CUSTOM_ICONS).map(([key, v]) => ({ key, label: v.label })),
  ...Object.entries(LUCIDE_ICONS).map(([key, v]) => ({ key, label: v.label })),
];

/** Icons for the seeded categories, used when a stored value is still an old emoji. */
const SLUG_DEFAULTS: Record<string, string> = {
  all: "for-you",
  "mobile-electronics": "phone",
  "audio-speakers": "headphones",
  "car-accessories": "car",
  "home-cleaning": "cleaning",
  "health-wellness": "health",
  "beauty-personal-care": "beauty",
  "kitchen-dining": "cookware",
  lighting: "bulb",
  "kids-toys": "teddy",
  "watches-fashion": "watch",
  "storage-organizers": "storage",
  "travel-products": "luggage",
  "home-lifestyle": "home",
  "pest-control": "shield",
  "stationery-office": "notebook",
  "utility-tools": "tools",
};

export function isCategoryIconKey(key: string | undefined): key is string {
  return !!key && (key in CUSTOM_ICONS || key in LUCIDE_ICONS);
}

/** Turns whatever is stored (key, legacy emoji or nothing) into a valid icon key. */
export function resolveCategoryIcon(icon: string | undefined, slug?: string): string {
  if (isCategoryIconKey(icon)) return icon;
  return (slug && SLUG_DEFAULTS[slug]) || DEFAULT_CATEGORY_ICON;
}

export function CategoryIcon({
  icon,
  slug,
  className = "h-6 w-6",
}: {
  icon?: string | undefined;
  slug?: string | undefined;
  className?: string;
}) {
  const key = resolveCategoryIcon(icon, slug);
  const custom = CUSTOM_ICONS[key];
  if (custom) return <>{custom.render({ className })}</>;
  const Icon = (LUCIDE_ICONS[key] ?? LUCIDE_ICONS[DEFAULT_CATEGORY_ICON]!).Icon;
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}

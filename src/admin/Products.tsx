// ============================================================================
// FaasBay Commerce OS — Products Management (Salesai UI Matching Design)
// ============================================================================
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Upload,
  Image as ImageIcon,
  Check,
  ArrowLeft,
  Bookmark,
  Sparkles,
  X,
  Zap,
  Truck,
  Cpu,
  Search,
  LayoutGrid,
  List as ListIcon,
  Filter,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  Globe,
  Share2,
  Smartphone,
  Monitor,
  AlertCircle,
  Link2,
  ExternalLink,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Eye,
  Tag,
  HelpCircle,
  Bot,
  Wand2,
  Star,
  MessageSquare,
  ThumbsUp,
  Camera,
  Info,
  Loader2,
  Minus,
  Package,
  Boxes,
  Layers,
  Home,
} from "lucide-react";
import {
  ConfirmDialog,
  formatCurrency,
  TabSwitcher,
} from "./shared/components";
import Categories from "./Categories";
import Collections from "./Collections";
import Inventory from "./Inventory";
import { RichDescriptionEditor } from "./RichDescriptionEditor";
import type { AdminProduct } from "./shared/types";
import {
  formatProductForStorefront,
  type Review,
} from "@/components/store/data";
import {
  getCachedAdminProducts,
  setCachedAdminProducts,
  refreshAdminProducts,
  loadAdminProducts,
  createProduct as createProductApi,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
  deleteProducts as deleteProductsApi,
} from "./shared/product-store";
import { uploadImageToCloud, uploadImagesToCloud } from "./shared/uploadImage";
import { API_ENDPOINTS } from "@/config/api";

// The homepage rows a product can be assigned to. Shared by the full edit
// form and the fast inline toggle in the product list.
const HOMEPAGE_COLLECTIONS = [
  { id: "trending", label: "Trending Now" },
  { id: "new-arrivals", label: "New Arrivals" },
  { id: "best-sellers", label: "Best Sellers" },
  { id: "hot-deals", label: "Flash Deals" },
  { id: "desk-workspace", label: "Desk & Workspace" },
];

// Canvas-based image compression helper for smooth uploads and avoiding localStorage quota limits
const compressImageFile = (file: File, maxWidth = 720, maxHeight = 720, quality = 0.72): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve((e.target?.result as string) || "");
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL("image/webp", quality);
          resolve(compressed);
        } catch {
          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || "");
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

/**
 * Publishes a locally-computed catalog to every listening admin screen.
 *
 * MongoDB is written by the product-store API calls; this only keeps the in-memory
 * copy in step so other tabs re-render without waiting for a refetch.
 */
export const syncProductsStorage = (updatedAdminProducts: AdminProduct[]) => {
  setCachedAdminProducts(updatedAdminProducts);
};

/** Empty until the first GET /api/products lands. */
const initProducts: AdminProduct[] = getCachedAdminProducts();

const defaultCategories = [
  "All Collection",
  "Mobile & Electronics",
  "Audio & Speakers",
  "Car Accessories",
  "Home Cleaning & Appliances",
  "Health, Wellness & Massage",
  "Beauty & Personal Care",
  "Kitchen & Dining",
  "Lights & Home Lighting",
  "Kids & Toys",
  "Watches & Fashion Accessories",
  "Storage & Organizers",
  "Travel Products",
  "Home & Lifestyle",
  "Pest Control",
  "Stationery & Office",
  "Utility & Tools",
];

export interface ColorVariantOption {
  name: string;
  hex: string;
  isNone?: boolean;
}

const availableColorVariants: ColorVariantOption[] = [
  { name: "None", hex: "transparent", isNone: true },
  { name: "Matte Black", hex: "#1e293b" },
  { name: "Space Gray", hex: "#64748b" },
  { name: "Pure White", hex: "#f8fafc" },
  { name: "FaasBay Lime", hex: "#B0CB1F" },
  { name: "Cyber Green", hex: "#10b981" },
  { name: "Navy Blue", hex: "#1e3a8a" },
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Crimson Red", hex: "#dc2626" },
  { name: "Rose Pink", hex: "#f43f5e" },
  { name: "Beige / Cream", hex: "#f5f5dc" },
  { name: "Mocha Brown", hex: "#78350f" },
  { name: "Neon Orange", hex: "#f97316" },
  { name: "Gold", hex: "#eab308" },
  { name: "Silver", hex: "#94a3b8" },
];

const availableColorOptions = availableColorVariants;

const availableSizeOptions = [
  "Free Size / Standard",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "Pack of 1",
  "Pack of 2",
  "Pack of 3",
  "50 ml",
  "100 ml",
  "250 ml",
  "500 ml",
  "1 Litre",
];

const availableProductStyles = [
  "Standard / Regular",
  "Premium Edition",
  "Limited Release",
  "Single Unit",
  "None / Custom",
];

const availableDepartments = [
  "All / Universal",
  "Men",
  "Women",
  "Unisex",
  "Kids & Teens",
  "Babies & Toddlers",
  "Home & General",
];

const quickFeatureTags = [
  "Premium Quality Material",
  "100% Authentic / Original",
  "100% Pure Cotton",
  "Breathable & Comfortable",
  "Machine Washable",
  "Water Resistant",
  "BPA Free & Food Safe",
  "Eco-Friendly / Sustainable",
  "Handcrafted / Artisanal",
  "Bluetooth 5.3",
  "USB-C Fast Charging",
  "Rechargeable Battery",
  "Long Lasting Durability",
  "Official Brand Warranty",
];

const discountTypeOptions = [
  "None / Regular Price",
  "Festival Deal",
  "Flash Sale Discount",
  "Percentage Discount",
  "Flat Discount (₹)",
  "Special Launch Offer",
  "Clearance Sale",
  "Buy 1 Get 1 / Bundle",
];

export function ProductsList({
  onViewModeChange,
}: {
  onViewModeChange?: (mode: "list" | "form") => void;
} = {}) {
  const [products, setProducts] = useState<AdminProduct[]>(initProducts);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [viewMode, setViewMode] = useState<"list" | "form">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const action = params.get("action");
      if (action === "add" || action === "edit" || action === "form") return "form";
    }
    return "list";
  });
  const [displayType, setDisplayType] = useState<"list" | "grid">("list");
  const [isEditing, setIsEditing] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("action") === "edit";
    }
    return false;
  });
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ tab: string; subTab?: string } | null>(null);
  // Position captured from the trigger button so the popover can be portaled to
  // <body> and rendered with fixed coordinates — the table wrapper clips
  // absolutely-positioned children (overflow-hidden/overflow-x-auto), which was
  // cutting the popover off whenever a row had little/no space below it.
  const [homepagePopoverAnchor, setHomepagePopoverAnchor] = useState<{ id: string; top: number; left: number } | null>(null);

  useEffect(() => {
    if (!homepagePopoverAnchor) return;
    const close = () => setHomepagePopoverAnchor(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [homepagePopoverAnchor]);

  // Same portal-anchored popover pattern, but for the bulk-selection toolbar
  // action — lets staff set homepage visibility for every selected product at
  // once instead of one row at a time.
  const [bulkHomepagePopoverAnchor, setBulkHomepagePopoverAnchor] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!bulkHomepagePopoverAnchor) return;
    const close = () => setBulkHomepagePopoverAnchor(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [bulkHomepagePopoverAnchor]);
  const draftRestoredRef = React.useRef(false);

  React.useEffect(() => {
    onViewModeChange?.(viewMode);
    if (typeof window !== "undefined") {
      (window as any).__faasbay_is_form_open = viewMode === "form";
    }
    return () => {
      if (typeof window !== "undefined") {
        (window as any).__faasbay_is_form_open = false;
      }
    };
  }, [viewMode, onViewModeChange]);

  React.useEffect(() => {
    const handleRequestNav = (e: Event) => {
      if (viewMode !== "form") return;
      const ce = e as CustomEvent;
      ce.preventDefault();
      setPendingNavigation(ce.detail || null);
      setShowDiscardModal(true);
    };
    window.addEventListener("faasbay_request_navigate", handleRequestNav);
    return () => {
      window.removeEventListener("faasbay_request_navigate", handleRequestNav);
    };
  }, [viewMode]);

  React.useEffect(() => {
    const refresh = () => setProducts(getCachedAdminProducts());
    // Pull the catalog from MongoDB, then follow the shared cache from there on.
    void loadAdminProducts().then(refresh);
    window.addEventListener("faasbay_products_updated", refresh);

    const handleNav = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.tab === "catalog") {
        setViewMode("list");
        setIsEditing(false);
      }
    };
    window.addEventListener("faasbay_admin_navigated", handleNav);

    return () => {
      window.removeEventListener("faasbay_products_updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("faasbay_admin_navigated", handleNav);
    };
  }, []);

  // Filter States (Salesai matching)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Collection");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [selectedHomepageFilter, setSelectedHomepageFilter] = useState("All Homepage");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortBy, setSortBy] = useState("Default");
  const [showProductLimit, setShowProductLimit] = useState("All Products");

  // Selected items checkbox set
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Form State (Universal for Fashion, Footwear, Electronics, Home, Beauty, etc.)
  const [formId, setFormId] = useState("");
  const [nameProduct, setNameProduct] = useState("");
  const [brandName, setBrandName] = useState("");
  const [descriptionProduct, setDescriptionProduct] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>(["None"]);
  const [customColorsList, setCustomColorsList] = useState<{ name: string; hex: string }[]>([]);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#10b981");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<string>("Standard / Regular");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("All / Universal");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Dynamic custom inputs
  const [customColorInput, setCustomColorInput] = useState("");
  const [customFeatureInput, setCustomFeatureInput] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [showAddCustomColor, setShowAddCustomColor] = useState(false);
  const [showAddCustomSize, setShowAddCustomSize] = useState(false);
  const [showAddCustomFeature, setShowAddCustomFeature] = useState(false);

  // Payment & Delivery Settings
  const [codAvailable, setCodAvailable] = useState<boolean>(false);
  const [codCharge, setCodCharge] = useState<string>("");
  const [isCodFree, setIsCodFree] = useState<boolean>(false);
  const [deliveryType, setDeliveryType] = useState<"free" | "custom">("custom");
  const [deliveryCharge, setDeliveryCharge] = useState<string>("");

  // Pricing, Stock & Tax
  const [basePrice, setBasePrice] = useState<string>("");
  const [mrpPrice, setMrpPrice] = useState<string>("");
  const [stockCount, setStockCount] = useState<string>("");
  const [skuCode, setSkuCode] = useState<string>("");
  const [lowStockThreshold, setLowStockThreshold] = useState<string>("5");
  const [gstRate, setGstRate] = useState<string>("18% GST");
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [discountType, setDiscountType] = useState<string>("None / Regular Price");
  const [warrantyInfo, setWarrantyInfo] = useState<string>("3 Days Checking Warranty");

  // Variant Items (Per-variant SKU, Stock & Pricing)
  const [variantItems, setVariantItems] = useState<
    { id?: string; name: string; sku: string; stock: string; price: string }[]
  >([]);

  const syncVariantItems = (colors: string[]) => {
    const activeColors = colors.filter((c) => c !== "None");
    setVariantItems((prev) => {
      return activeColors.map((col) => {
        const existing = prev.find((v) => v.name === col);
        if (existing) return existing;
        const codeSuffix = col.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase();
        return {
          id: `var-${col.toLowerCase().replace(/\s+/g, "-")}`,
          name: col,
          sku: skuCode ? `${skuCode}-${codeSuffix}` : `FB-${codeSuffix}`,
          stock: stockCount || "10",
          price: basePrice || "0",
        };
      });
    });
  };

  const updateVariantItem = (index: number, field: "sku" | "stock" | "price", val: string) => {
    setVariantItems((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], [field]: val };
      }
      return next;
    });
  };

  // Category & Media
  const [productCategory, setProductCategory] = useState<string>("Fashion & Apparel");
  const [productStatus, setProductStatus] = useState<"Published" | "Draft" | "Archived">("Draft");
  // Tracks whether the form has actually changed since it was opened, so the
  // unsaved-changes prompts (native beforeunload + the in-app modal) only fire
  // when there's really something to lose.
  const [isDirty, setIsDirty] = useState(false);
  const formBaselineRef = React.useRef<string | null>(null);
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);

  const [mainImage, setMainImage] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedThumbIndex, setSelectedThumbIndex] = useState(0);
  const [draggedImgIndex, setDraggedImgIndex] = useState<number | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const reviewFileInputRef = useRef<HTMLInputElement>(null);
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [imageUrlTarget, setImageUrlTarget] = useState<"primary" | "gallery">("primary");
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Advanced SEO & Google Search SERP States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [urlSlug, setUrlSlug] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("wireless headphones");
  const [keywordsList, setKeywordsList] = useState<string[]>([
    "smart gadgets",
    "electronics",
    "online store",
    "faasbay",
  ]);
  const [keywordInput, setKeywordInput] = useState("");
  const [isIndexable, setIsIndexable] = useState(true);
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [seoPreviewTab, setSeoPreviewTab] = useState<"google-mobile" | "google-desktop" | "social">("google-desktop");
  
  // Custom Overrides & Auto-Sync Flags
  const [isCustomMetaTitle, setIsCustomMetaTitle] = useState(false);
  const [isCustomMetaDesc, setIsCustomMetaDesc] = useState(false);
  const [isCustomSlug, setIsCustomSlug] = useState(false);

  // Customer Reviews & Social Proof States
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewDate, setReviewDate] = useState("2 days ago");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewVerified, setReviewVerified] = useState(true);
  const [reviewAvatar, setReviewAvatar] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewImageInput, setReviewImageInput] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  // Homepage Collections & Placements (all active by default for new products)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([
    "trending",
    "new-arrivals",
    "best-sellers",
    "hot-deals",
    "desk-workspace",
  ]);

  const toggleCollection = (colId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  // Dynamic Product Specifications
  const [specificationsList, setSpecificationsList] = useState<{ label: string; value: string }[]>([
    { label: "Material", value: "" },
    { label: "Warranty", value: "" },
  ]);

  const handleAddSpecificationRow = (label = "", value = "") => {
    setSpecificationsList((prev) => [...prev, { label, value }]);
  };

  const handleUpdateSpecificationRow = (index: number, field: "label" | "value", val: string) => {
    setSpecificationsList((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], [field]: val };
      }
      return next;
    });
  };

  const handleRemoveSpecificationRow = (index: number) => {
    setSpecificationsList((prev) => prev.filter((_, i) => i !== index));
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const generateCleanMetaTitle = (title: string, brand?: string): string => {
    const clean = (title || "").trim();
    if (!clean) return "";
    const b = (brand || brandName || "FaasBay").trim();

    // If title already includes the brand name, don't append it again
    if (clean.toLowerCase().includes(b.toLowerCase())) {
      return clean.length > 60 ? `${clean.slice(0, 57).trim()}...` : clean;
    }

    const withBrand = `${clean} | ${b}`;
    if (withBrand.length <= 60) {
      return withBrand;
    }

    // When the title is already long, use clean title without adding a truncated suffix
    return clean.length > 60 ? `${clean.slice(0, 57).trim()}...` : clean;
  };

  const generateCleanMetaDesc = (desc: string, title?: string): string => {
    const cleanDesc = (desc || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (cleanDesc) {
      if (cleanDesc.length <= 155) return cleanDesc;
      return `${cleanDesc.slice(0, 152).trim()}...`;
    }
    const cleanTitle = (title || "").trim();
    if (cleanTitle) {
      const defaultText = `Buy ${cleanTitle} online at FaasBay with express delivery, cash on delivery & verified warranty.`;
      return defaultText.length <= 160 ? defaultText : `${defaultText.slice(0, 157).trim()}...`;
    }
    return "";
  };

  // Real-time Auto-sync Handlers
  const handleProductNameChange = (newVal: string) => {
    setNameProduct(newVal);
    if (!isCustomMetaTitle) {
      setMetaTitle(generateCleanMetaTitle(newVal, brandName));
    }
    if (!isCustomSlug) {
      setUrlSlug(slugify(newVal));
    }
  };

  const handleProductDescriptionChange = (newVal: string) => {
    setDescriptionProduct(newVal);
    if (!isCustomMetaDesc) {
      setMetaDescription(generateCleanMetaDesc(newVal, nameProduct));
    }
  };

  const handleResetSyncSEO = () => {
    setIsCustomMetaTitle(false);
    setIsCustomMetaDesc(false);
    setIsCustomSlug(false);
    if (nameProduct) {
      setMetaTitle(generateCleanMetaTitle(nameProduct, brandName));
      setUrlSlug(slugify(nameProduct));
    } else {
      setMetaTitle("");
      setUrlSlug("");
    }
    if (descriptionProduct) {
      setMetaDescription(generateCleanMetaDesc(descriptionProduct, nameProduct));
    } else {
      setMetaDescription("");
    }
  };

  // Derived Live SEO properties for Live Preview (Dynamically calculated from product input)
  const cleanTitle = (nameProduct || "").trim();
  const cleanDesc = (descriptionProduct || "").replace(/<[^>]*>/g, "").trim();

  const effectiveTitle =
    metaTitle.trim() ||
    generateCleanMetaTitle(cleanTitle, brandName);

  const effectiveDescription =
    metaDescription.trim() ||
    generateCleanMetaDesc(cleanDesc, cleanTitle);

  const effectiveSlug =
    urlSlug.trim() ||
    (cleanTitle ? slugify(cleanTitle) : "");

  // Real-time SEO Health Score calculation (0 - 100)
  const calcSeoScore = () => {
    let score = 0;
    const tLen = effectiveTitle.length;
    const dLen = effectiveDescription.length;

    // Title score (max 30)
    if (tLen >= 40 && tLen <= 65) score += 30;
    else if (tLen > 20 && tLen <= 75) score += 18;
    else if (tLen > 0) score += 10;

    // Description score (max 30)
    if (dLen >= 110 && dLen <= 165) score += 30;
    else if (dLen >= 60 && dLen <= 190) score += 20;
    else if (dLen > 0) score += 10;

    // Slug score (max 15)
    if (effectiveSlug && !effectiveSlug.includes(" ") && effectiveSlug.length > 3) score += 15;

    // Focus keyword score (max 15)
    if (focusKeyword.trim()) {
      const kw = focusKeyword.toLowerCase().trim();
      const inTitle = effectiveTitle.toLowerCase().includes(kw);
      const inDesc = effectiveDescription.toLowerCase().includes(kw);
      if (inTitle && inDesc) score += 15;
      else if (inTitle || inDesc) score += 10;
      else score += 5;
    } else {
      score += 10;
    }

    // Indexable (max 10)
    if (isIndexable) score += 10;

    return Math.min(100, score);
  };

  const handleAutoOptimizeSEO = () => {
    const brand = brandName || "FaasBay";
    const name = nameProduct || "Premium Lifestyle Product";
    const specs = selectedFeatures.filter((f) => !f.includes("✓") && !f.includes("+")).slice(0, 2).join(", ");
    
    const baseTitle =
      selectedEdition && selectedEdition !== "None / Custom" && selectedEdition !== "Standard / Regular"
        ? `${name} (${selectedEdition})`
        : name;
    const smartTitle = generateCleanMetaTitle(baseTitle, brand);
    const smartDesc = generateCleanMetaDesc(
      specs ? `${name}. Highlights: ${specs}.` : "",
      name
    );
    const smartSlug = slugify(name);
    
    setMetaTitle(smartTitle);
    setMetaDescription(smartDesc);
    setUrlSlug(smartSlug);
    setIsCustomMetaTitle(true);
    setIsCustomMetaDesc(true);
    setIsCustomSlug(true);
    setFocusKeyword(name.split(" ").slice(0, 2).join(" ").toLowerCase());
  };

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    const clean = keywordInput.trim().toLowerCase();
    if (!keywordsList.includes(clean)) {
      setKeywordsList([...keywordsList, clean]);
    }
    setKeywordInput("");
  };

  const removeKeyword = (kw: string) => {
    setKeywordsList(keywordsList.filter((k) => k !== kw));
  };

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Category
      // Product records may store either the category slug (e.g. "mobile-electronics")
      // or the display label (e.g. "Mobile & Electronics"), so compare slugified forms.
      if (selectedCategory !== "All Collection") {
        if (slugify(p.category || "") !== slugify(selectedCategory)) return false;
      }
      // Status
      if (selectedStatus === "Active" && p.status !== "Published") return false;
      if (selectedStatus === "No Active" && p.status !== "Draft") return false;

      // Brand
      if (selectedBrand !== "All Brands" && p.brand !== selectedBrand) return false;

      // Homepage visibility
      if (selectedHomepageFilter === "On Homepage" && (p.collections || []).length === 0) return false;
      if (selectedHomepageFilter === "Not on Homepage" && (p.collections || []).length > 0) return false;
      if (
        selectedHomepageFilter !== "All Homepage" &&
        selectedHomepageFilter !== "On Homepage" &&
        selectedHomepageFilter !== "Not on Homepage" &&
        !(p.collections || []).includes(selectedHomepageFilter)
      ) {
        return false;
      }

      // Show limit / Stock filter
      if (showProductLimit === "In Stock" && p.stock <= 0) return false;
      if (showProductLimit === "Low Stock" && p.stock > 5) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Alphabetical") return a.title.localeCompare(b.title);
      if (sortBy === "Stock: High to Low") return b.stock - a.stock;
      return 0;
    });

  const toggleRowSelect = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAllRows = () => {
    if (filteredProducts.length === 0) return;
    if (selectedRows.size === filteredProducts.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    const ids = Array.from(selectedRows);

    try {
      const { deleted, failed } = await deleteProductsApi(ids);
      setProducts(getCachedAdminProducts());
      setSelectedRows(new Set());

      if (deleted > 0) toast.success(`Deleted ${deleted} product${deleted > 1 ? "s" : ""}! 🗑️`);
      if (failed.length > 0) toast.error(`${failed.length} product(s) could not be deleted.`);
    } catch (e: any) {
      toast.error(e?.message || "Could not delete the selected products.");
    }
  };

  // Bulk homepage visibility toggle: applied across every currently selected
  // product. If every selected product already has the row, this clears it
  // for all of them; otherwise it adds the row to all of them (matching the
  // tri-state "select all" behavior used elsewhere in this list).
  const bulkUpdateHomepageCollection = async (colId: string) => {
    const ids = Array.from(selectedRows);
    if (ids.length === 0) return;
    const selected = products.filter((p) => selectedRows.has(p.id));
    const allHaveIt = selected.every((p) => (p.collections || []).includes(colId));

    const nextCollectionsById = new Map(
      selected.map((p) => {
        const current = p.collections || [];
        const next = allHaveIt
          ? current.filter((c) => c !== colId)
          : current.includes(colId)
          ? current
          : [...current, colId];
        return [p.id, next];
      })
    );

    setProducts(
      products.map((p) => (nextCollectionsById.has(p.id) ? { ...p, collections: nextCollectionsById.get(p.id)! } : p))
    );

    const label = HOMEPAGE_COLLECTIONS.find((c) => c.id === colId)?.label || colId;

    try {
      await Promise.all(
        ids.map((id) => updateProductApi(id, { collections: nextCollectionsById.get(id) } as Partial<AdminProduct>))
      );
      setProducts(getCachedAdminProducts());
      toast.success(
        allHaveIt
          ? `Removed ${ids.length} product${ids.length > 1 ? "s" : ""} from ${label}.`
          : `Added ${ids.length} product${ids.length > 1 ? "s" : ""} to ${label}.`
      );
    } catch (e: any) {
      toast.error(e?.message || "Could not update homepage visibility for the selected products.");
      await refreshAdminProducts();
      setProducts(getCachedAdminProducts());
    }
  };

  // Form Dirty Tracking & Protection
  const isFormDirty =
    viewMode === "form" &&
    Boolean(
      nameProduct.trim() ||
      descriptionProduct.trim() ||
      basePrice.trim() ||
      mainImage ||
      galleryImages.length > 0 ||
      brandName.trim() ||
      skuCode.trim()
    );

  // BeforeUnload event listener — only while the form actually has unsaved changes
  React.useEffect(() => {
    if (viewMode !== "form" || isSavingProduct || !isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved product changes. Are you sure you want to leave or refresh?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [viewMode, isSavingProduct, isDirty]);

  // Auto-save form draft to localStorage
  React.useEffect(() => {
    if (viewMode !== "form" || isSavingProduct) return;

    const draftData = {
      formId,
      nameProduct,
      brandName,
      descriptionProduct,
      selectedColors,
      customColorsList,
      selectedSizes,
      selectedEdition,
      selectedAgeGroup,
      selectedFeatures,
      basePrice,
      mrpPrice,
      stockCount,
      skuCode,
      lowStockThreshold,
      gstRate,
      discountPercent,
      discountType,
      warrantyInfo,
      productCategory,
      productStatus,
      isFlashDeal,
      freeShipping,
      codAvailable,
      codCharge,
      isCodFree,
      deliveryType,
      deliveryCharge,
      selectedCollections,
      specificationsList,
      metaTitle,
      metaDescription,
      urlSlug,
      focusKeyword,
      keywordsList,
      isIndexable,
      mainImage,
      galleryImages,
      isEditing,
      timestamp: Date.now(),
    };

    // Compare against the snapshot taken when the form was opened. `timestamp`
    // is excluded since it changes on every run regardless of real edits, and
    // `productStatus` is excluded because its dropdown already saves itself
    // immediately (see handleProductStatusChange) — it should never trigger the
    // unsaved-changes prompt.
    const comparable = JSON.stringify({ ...draftData, timestamp: undefined, productStatus: undefined });
    if (formBaselineRef.current === null) {
      formBaselineRef.current = comparable;
    } else if (formBaselineRef.current !== comparable) {
      setIsDirty(true);
    }

    try {
      localStorage.setItem("faasbay_product_form_draft", JSON.stringify(draftData));
    } catch {}
  }, [
    viewMode,
    isSavingProduct,
    formId,
    nameProduct,
    brandName,
    descriptionProduct,
    selectedColors,
    customColorsList,
    selectedSizes,
    selectedEdition,
    selectedAgeGroup,
    selectedFeatures,
    basePrice,
    mrpPrice,
    stockCount,
    skuCode,
    lowStockThreshold,
    gstRate,
    discountPercent,
    discountType,
    warrantyInfo,
    productCategory,
    productStatus,
    isFlashDeal,
    freeShipping,
    codAvailable,
    codCharge,
    isCodFree,
    deliveryType,
    deliveryCharge,
    selectedCollections,
    specificationsList,
    metaTitle,
    metaDescription,
    urlSlug,
    focusKeyword,
    keywordsList,
    isIndexable,
    mainImage,
    galleryImages,
    isEditing,
  ]);

  // Restore draft or edit mode on mount / URL action
  React.useEffect(() => {
    if (draftRestoredRef.current) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    const editId = params.get("productId");

    if (action === "edit" && editId) {
      // Wait for the catalog to finish loading before giving up on finding the
      // product — but once resolved (found or not), never re-run this. Without
      // that guard, any later `products` update (e.g. a save elsewhere resolving
      // after the admin has already clicked into a different product to edit)
      // re-reads the *current* URL and misreads an ordinary in-session edit as a
      // reload-recovered one, reopening the form and popping the discard modal
      // over work the admin never actually left.
      if (products.length === 0) return;
      draftRestoredRef.current = true;
      const loaded = getCachedAdminProducts();
      const target = loaded.find((p) => p.id === editId) || products.find((p) => p.id === editId);
      if (target) {
        openEditProduct(target);
      }
      return;
    }

    draftRestoredRef.current = true;

    if (action === "add" || action === "form") {
      try {
        const draftStr = localStorage.getItem("faasbay_product_form_draft");
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          if (draft && (draft.nameProduct || draft.basePrice || draft.mainImage || draft.brandName || draft.descriptionProduct)) {
            setFormId(draft.formId || `p${Date.now()}`);
            setNameProduct(draft.nameProduct || "");
            setBrandName(draft.brandName || "");
            setDescriptionProduct(draft.descriptionProduct || "");
            setSelectedColors(draft.selectedColors || ["None"]);
            setCustomColorsList(draft.customColorsList || []);
            setSelectedSizes(draft.selectedSizes || []);
            setSelectedEdition(draft.selectedEdition || "Standard / Regular");
            setSelectedAgeGroup(draft.selectedAgeGroup || "All / Universal");
            setSelectedFeatures(draft.selectedFeatures || []);
            setBasePrice(draft.basePrice || "");
            setMrpPrice(draft.mrpPrice || "");
            setStockCount(draft.stockCount || "");
            setSkuCode(draft.skuCode || "");
            setLowStockThreshold(draft.lowStockThreshold || "5");
            setGstRate(draft.gstRate || "18% GST");
            setDiscountPercent(draft.discountPercent || "");
            setDiscountType(draft.discountType || "None / Regular Price");
            setWarrantyInfo(draft.warrantyInfo || "");
            setProductCategory(draft.productCategory || "All Collection");
            setProductStatus(draft.productStatus || "Draft");
            setIsFlashDeal(draft.isFlashDeal || false);
            setFreeShipping(draft.freeShipping || false);
            setCodAvailable(draft.codAvailable || false);
            setCodCharge(draft.codCharge || "");
            setIsCodFree(draft.isCodFree || false);
            setDeliveryType(draft.deliveryType || "custom");
            setDeliveryCharge(draft.deliveryCharge || "");
            setSelectedCollections(draft.selectedCollections || []);
            setSpecificationsList(draft.specificationsList || [{ label: "Material", value: "" }, { label: "Warranty", value: "" }]);
            setMetaTitle(draft.metaTitle || "");
            setMetaDescription(draft.metaDescription || "");
            setUrlSlug(draft.urlSlug || "");
            setFocusKeyword(draft.focusKeyword || "");
            setKeywordsList(draft.keywordsList || []);
            setIsIndexable(draft.isIndexable ?? true);
            setMainImage(draft.mainImage || "");
            setGalleryImages(draft.galleryImages || []);
            setIsEditing(draft.isEditing || false);
            setViewMode("form");
            setIsDirty(true);
            setShowDiscardModal(true);
            draftRestoredRef.current = true;
            return;
          }
        }
      } catch {}

      openCreateProduct();
      setShowDiscardModal(true);
      draftRestoredRef.current = true;
    }
  }, [products]);

  const handleForceCloseForm = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("faasbay_product_form_draft");
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      url.searchParams.delete("productId");
      window.history.replaceState({}, "", url.toString());
    }
    setShowDiscardModal(false);
    setViewMode("list");
    setIsEditing(false);
    formBaselineRef.current = null;
    setIsDirty(false);
  };

  const handleRequestCloseForm = () => {
    if (!isDirty) {
      handleForceCloseForm();
      return;
    }
    setShowDiscardModal(true);
  };

  const toggleProductActive = async (id: string) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;
    const nextStatus = current.status === "Published" ? "Draft" : "Published";

    // Show the change straight away, then persist it.
    setProducts(products.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)));

    try {
      await updateProductApi(id, { status: nextStatus } as Partial<AdminProduct>);
      setProducts(getCachedAdminProducts());
    } catch (e: any) {
      toast.error(e?.message || "Could not update the product status.");
      await refreshAdminProducts();
      setProducts(getCachedAdminProducts());
    }
  };

  // Fast per-row homepage section toggle from the product list, without opening
  // the full edit form.
  const toggleProductHomepageCollection = async (id: string, colId: string) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;
    const currentCollections = current.collections || [];
    const nextCollections = currentCollections.includes(colId)
      ? currentCollections.filter((c) => c !== colId)
      : [...currentCollections, colId];

    setProducts(products.map((p) => (p.id === id ? { ...p, collections: nextCollections } : p)));

    try {
      await updateProductApi(id, { collections: nextCollections } as Partial<AdminProduct>);
      setProducts(getCachedAdminProducts());
    } catch (e: any) {
      toast.error(e?.message || "Could not update homepage visibility.");
      await refreshAdminProducts();
      setProducts(getCachedAdminProducts());
    }
  };

  // Status dropdown inside the product form. For an existing product this saves
  // immediately (it's the only way to reach "Archived" — there's no dedicated
  // button for it); for a not-yet-saved product it just updates local state.
  const handleProductStatusChange = async (newStatus: "Published" | "Draft" | "Archived") => {
    const previous = productStatus;
    setProductStatus(newStatus);
    if (!isEditing || !formId) return;

    try {
      await updateProductApi(formId, { status: newStatus } as Partial<AdminProduct>);
      setProducts(getCachedAdminProducts());
      toast.success(`Status changed to ${newStatus}`);
    } catch (e: any) {
      setProductStatus(previous);
      toast.error(e?.message || "Could not update the product status.");
    }
  };

  const openCreateProduct = () => {
    setFormId(`p${Date.now()}`);
    setNameProduct("");
    setBrandName("");
    setDescriptionProduct("");
    setSelectedColors(["None"]);
    setSelectedSizes([]);
    setSelectedEdition("Standard / Regular");
    setSelectedAgeGroup("All / Universal");
    setSelectedFeatures([]);
    setBasePrice("");
    setMrpPrice("");
    setStockCount("");
    setSkuCode("");
    setLowStockThreshold("5");
    setGstRate("18% GST");
    setVariantItems([]);
    setDiscountPercent("");
    setDiscountType("None / Regular Price");
    setWarrantyInfo("");
    setProductCategory("All Collection");
    setProductStatus("Draft");
    setIsFlashDeal(false);
    setFreeShipping(true);
    setCodAvailable(true);
    setCodCharge("100");
    setIsCodFree(false);
    setDeliveryType("free");
    setDeliveryCharge("100");
    setSelectedCollections([]);
    setSpecificationsList([
      { label: "Material", value: "" },
      { label: "Warranty", value: "" },
    ]);

    // Reset and auto-sync SEO
    setIsCustomMetaTitle(false);
    setIsCustomMetaDesc(false);
    setIsCustomSlug(false);
    setMetaTitle("");
    setMetaDescription("");
    setUrlSlug("");
    setFocusKeyword("");
    setKeywordsList([]);
    setIsIndexable(true);
    setCanonicalUrl("");

    // Zero initial photos
    setMainImage("");
    setGalleryImages([]);
    setSelectedThumbIndex(0);

    // Zero initial reviews for a new product
    setReviewsList([]);

    setIsEditing(false);
    setViewMode("form");
    formBaselineRef.current = null;
    setIsDirty(false);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("action", "add");
      url.searchParams.delete("productId");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const openEditProduct = (p: AdminProduct) => {
    setFormId(p.id);
    setNameProduct(p.title);
    setBrandName(p.brand || "FaasBay Collection");
    setDescriptionProduct(p.description || "");
    setCodAvailable(p.codAvailable ?? true);
    const fee = p.deliveryCharge !== undefined ? String(p.deliveryCharge) : (p.codCharge !== undefined ? String(p.codCharge) : "100");
    setCodCharge(fee);
    setDeliveryCharge(fee);
    setIsCodFree(false);
    setDeliveryType("free");
    setFreeShipping(true);
    // Safe extraction of genuine color variants (ignoring non-color keywords and tags)
    const nonColorKeywords = ["warranty", "delivery", "cash on delivery", "cod", "replacement", "fast express", "authentic", "shipping", "material", "deal", "discount"];
    const isCleanColor = (str: string) => {
      if (!str || typeof str !== "string") return false;
      const lower = str.toLowerCase().trim();
      if (!lower || lower === "default" || lower === "none") return false;
      return !nonColorKeywords.some((k) => lower.includes(k));
    };

    const variantColors = (p.variants && p.variants.length > 0)
      ? p.variants.map((v) => v.name).filter(isCleanColor)
      : [];
    const directColors = Array.isArray(p.colors)
      ? p.colors.map((c: any) => (typeof c === "string" ? c : c?.name || "")).filter(isCleanColor)
      : [];

    const candidateColors = variantColors.length > 0 ? variantColors : directColors;
    const finalCols = candidateColors.length > 0 ? candidateColors : ["None"];

    setSelectedColors(finalCols);
    setCustomColorsList(
      finalCols
        .filter((c) => c !== "None")
        .map((c) => {
          const matched = Array.isArray(p.colors) ? p.colors.find((pc: any) => (typeof pc === "object" ? pc.name === c : pc === c)) : null;
          return { name: c, hex: (typeof matched === "object" && matched?.hex) || "#10b981" };
        })
    );
    setSelectedSizes(["Free Size / Standard"]);
    setSelectedEdition("Standard / Regular");
    setSelectedAgeGroup("All / Universal");

    // Clean features list
    const nonFeatureWords = ["fast express delivery", "cash on delivery (cod)", "3 days checking warranty / replacement"];
    const rawFeatures = Array.isArray(p.features) && p.features.length > 0
      ? p.features.filter((f) => f && typeof f === "string" && !nonFeatureWords.includes(f.trim().toLowerCase()))
      : [];

    setSelectedFeatures(
      rawFeatures.length > 0
        ? rawFeatures
        : ["Premium Quality Material", "100% Authentic / Original"]
    );
    setBasePrice(String(p.price));
    setMrpPrice(String(p.mrp || Math.round(p.price * 1.3)));
    setStockCount(String(p.stock));
    setSkuCode(p.sku || "");
    setLowStockThreshold(String(p.lowStockThreshold ?? 5));
    setGstRate(p.gstRate || "18% GST");

    if (p.variants && p.variants.length > 0) {
      setVariantItems(
        p.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku || "",
          stock: String(v.stock ?? 0),
          price: String(v.price ?? p.price),
        }))
      );
    } else if (!finalCols.includes("None") && finalCols.length > 0) {
      syncVariantItems(finalCols);
    } else {
      setVariantItems([]);
    }

    setDiscountPercent(
      p.compareAt && p.compareAt > p.price
        ? `${Math.round(((p.compareAt - p.price) / p.compareAt) * 100)}% Off`
        : "20% Off"
    );
    setDiscountType("Festival Deal");
    setWarrantyInfo(p.warranty || "3 Days Checking Warranty / Replacement");
    setProductCategory(p.category || "Fashion & Apparel");
    setProductStatus(p.status || "Published");
    setIsFlashDeal(p.isFlashDeal || false);
    setFreeShipping(p.freeShipping ?? true);

    // Collections & Specifications
    setSelectedCollections(
      Array.isArray(p.collections)
        ? p.collections
        : []
    );

    let loadedSpecs: { label: string; value: string }[] = [];
    if (Array.isArray(p.specifications)) {
      loadedSpecs = p.specifications
        .filter((s: any) => s && (s.label || s.key) && s.value)
        .map((s: any) => ({
          label: s.label || s.key,
          value: s.value,
        }));
    } else if (p.specifications && typeof p.specifications === "object") {
      loadedSpecs = Object.entries(p.specifications).map(([label, value]) => ({
        label,
        value: String(value),
      }));
    }
    if (loadedSpecs.length === 0) {
      loadedSpecs = [
        { label: "Material", value: "" },
        { label: "Warranty", value: p.warranty || "" },
      ];
    }
    setSpecificationsList(loadedSpecs);

    // Initialize SEO with existing values
    setMetaTitle(p.metaTitle || "");
    setMetaDescription(p.metaDescription || "");
    setUrlSlug(p.slug || slugify(p.title || ""));
    setFocusKeyword(p.tags?.[0] || "product");
    setKeywordsList(p.tags && p.tags.length > 0 ? p.tags : ["lifestyle", "online store"]);
    setIsIndexable(p.indexable ?? true);
    setCanonicalUrl("");
    setIsCustomMetaTitle(Boolean(p.metaTitle));
    setIsCustomMetaDesc(Boolean(p.metaDescription));
    setIsCustomSlug(Boolean(p.slug));

    setMainImage(p.image || (Array.isArray(p.images) && p.images[0]) || "");
    setGalleryImages(p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []));
    setSelectedThumbIndex(0);

    const loadedReviews = p.customerReviews && p.customerReviews.length > 0
      ? p.customerReviews
      : Array.isArray(getCachedAdminProducts())
        ? getCachedAdminProducts().find((mp) => mp.id === p.id)?.customerReviews || []
        : [];
    setReviewsList(loadedReviews);

    setIsEditing(true);
    setViewMode("form");
    formBaselineRef.current = null;
    setIsDirty(false);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("action", "edit");
      url.searchParams.set("productId", p.id);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const toggleColor = (colorName: string) => {
    if (colorName === "None") {
      setSelectedColors(["None"]);
      setCustomColorsList([]);
      setVariantItems([]);
      return;
    }
    const filtered = selectedColors.filter((c) => c !== "None");
    let next: string[];
    if (filtered.includes(colorName)) {
      const remaining = filtered.filter((c) => c !== colorName);
      next = remaining.length > 0 ? remaining : ["None"];
    } else {
      next = [...filtered, colorName];
    }
    setSelectedColors(next);
    syncVariantItems(next);
  };

  const handleAddCustomColor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = customColorName.trim();
    if (!name) {
      toast.error("Please enter a color name");
      return;
    }
    const hex = customColorHex.trim() || "#10b981";
    if (!customColorsList.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      const updatedList = [...customColorsList, { name, hex }];
      setCustomColorsList(updatedList);
      const filtered = selectedColors.filter((c) => c !== "None");
      const nextCols = [...filtered, name];
      setSelectedColors(nextCols);
      syncVariantItems(nextCols);
      toast.success(`Color "${name}" added!`);
    } else {
      toast.info(`Color "${name}" is already added.`);
    }
    setCustomColorName("");
    setShowAddCustomColor(false);
  };

  const handleRemoveCustomColor = (colorName: string) => {
    const nextList = customColorsList.filter((c) => c.name !== colorName);
    setCustomColorsList(nextList);
    const nextCols = selectedColors.filter((c) => c !== colorName);
    const finalCols = nextCols.length > 0 ? nextCols : ["None"];
    setSelectedColors(finalCols);
    syncVariantItems(finalCols);
  };

  const toggleSize = (sizeName: string) => {
    if (selectedSizes.includes(sizeName)) {
      const next = selectedSizes.filter((s) => s !== sizeName);
      setSelectedSizes(next.length > 0 ? next : ["Free Size / Standard"]);
    } else {
      setSelectedSizes([...selectedSizes, sizeName]);
    }
  };

  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customSizeInput.trim()) return;
    const clean = customSizeInput.trim();
    if (!selectedSizes.includes(clean)) {
      setSelectedSizes([...selectedSizes, clean]);
    }
    setCustomSizeInput("");
    setShowAddCustomSize(false);
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleAddCustomFeature = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customFeatureInput.trim()) return;
    const clean = customFeatureInput.trim();
    if (!selectedFeatures.includes(clean)) {
      setSelectedFeatures([...selectedFeatures, clean]);
    }
    setCustomFeatureInput("");
    setShowAddCustomFeature(false);
  };

  const insertDescriptionSnippet = (snippet: string, mode: "append" | "replace" = "append") => {
    if (mode === "replace") {
      setDescriptionProduct(snippet);
      handleProductDescriptionChange(snippet);
      return;
    }
    const current = descriptionProduct || "";
    const updated = current.trim() ? `${current}\n\n${snippet}` : snippet;
    setDescriptionProduct(updated);
    handleProductDescriptionChange(updated);
  };

  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1200, 1200, 0.82);
      if (compressed) {
        const url = await uploadImageToCloud(compressed, "products");
        setMainImage(url);
        setGalleryImages((prev) => {
          const filtered = prev.filter((img) => img !== url);
          return [url, ...filtered];
        });
        setSelectedThumbIndex(0);
        toast.success("Primary cover image set! ⭐");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error(err instanceof Error ? err.message : "Could not process the selected image.");
    }
    e.target.value = "";
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileList = Array.from(files);
      const compressed = await Promise.all(fileList.map((file) => compressImageFile(file, 1200, 1200, 0.82)));
      const urls = await uploadImagesToCloud(compressed.filter(Boolean), "products");
      const validUrls = urls.filter(Boolean);

      if (validUrls.length > 0) {
        setGalleryImages((prev) => {
          const updated = [...prev, ...validUrls];
          if (!mainImage && updated.length > 0) {
            setMainImage(updated[0]);
          }
          return updated;
        });
        toast.success(`${validUrls.length} image(s) added to gallery! Drag to reorder.`);
      }
    } catch (err) {
      console.error("Gallery upload failed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load some images.");
    }
    e.target.value = "";
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImgIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedImgIndex === null || draggedImgIndex === targetIndex) return;
    const updated = [...galleryImages];
    const [draggedItem] = updated.splice(draggedImgIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    setGalleryImages(updated);
    setMainImage(updated[0] || "");
    setDraggedImgIndex(null);
    toast.success(targetIndex === 0 ? "Cover photo updated!" : "Images reordered!");
  };

  const handleSetPrimaryImage = (img: string, index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (index === 0) return;
    const updated = [...galleryImages];
    const [item] = updated.splice(index, 1);
    updated.unshift(item);
    setGalleryImages(updated);
    setMainImage(updated[0]);
    setSelectedThumbIndex(0);
    toast.success("Cover photo set to primary! ⭐");
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    if (imageUrlTarget === "primary") {
      setMainImage(url);
      setGalleryImages((prev) => [url, ...prev.filter((x) => x !== url)]);
      setSelectedThumbIndex(0);
    } else {
      setGalleryImages((prev) => [...prev, url]);
      if (!mainImage) {
        setMainImage(url);
      }
    }
    setImageUrlInput("");
    setShowImageUrlModal(false);
    toast.success("Image URL added!");
  };

  const handleRemoveGalleryImage = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = galleryImages.filter((_, idx) => idx !== indexToRemove);
    setGalleryImages(updated);
    setMainImage(updated.length > 0 ? updated[0] : "");
    setSelectedThumbIndex(0);
  };

  const handleClearAllMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMainImage("");
    setGalleryImages([]);
    setSelectedThumbIndex(0);
  };

  const handleReviewFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const fileList = Array.from(files);
      const compressed = await Promise.all(fileList.map((file) => compressImageFile(file, 800, 800, 0.75)));
      const urls = await uploadImagesToCloud(compressed.filter(Boolean), "reviews");
      const validUrls = urls.filter(Boolean);
      if (validUrls.length > 0) {
        setReviewImages((prev) => [...prev, ...validUrls]);
        toast.success("Proof photo attached to review!");
      }
    } catch (err) {
      console.error("Review photo upload failed:", err);
      toast.error(err instanceof Error ? err.message : "Could not process review image.");
    }
    e.target.value = "";
  };

  const handleSaveProduct = async (status: "Published" | "Draft"): Promise<boolean> => {
    if (isSavingProduct) return false;
    let cleanTitle = (nameProduct || "").trim();
    if (!cleanTitle) {
      if (status === "Published") {
        toast.error("Please enter a Product Title before publishing.");
        return false;
      }
      cleanTitle = "Untitled Product Draft";
    }

    setIsSavingProduct(true);
    try {
      const parsedPrice = parseFloat(String(basePrice || "").replace(/[^0-9.]/g, "")) || 0;
      const parsedMrp = parseFloat(String(mrpPrice || "").replace(/[^0-9.]/g, "")) || Math.round((parsedPrice || 999) * 1.3);
      const parsedStock = parseInt(String(stockCount || "").replace(/[^0-9]/g, ""), 10) || 0;

      const safeReviews = Array.isArray(reviewsList) ? reviewsList : [];
      const calculatedRating = safeReviews.length > 0
        ? Number((safeReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / safeReviews.length).toFixed(1))
        : 5.0;

      const safeColors = Array.isArray(selectedColors) ? selectedColors : ["None"];
      const activeColors = safeColors.filter((c) => c !== "None");
      const safeVariants = Array.isArray(variantItems) ? variantItems : [];
      const hasVariants = activeColors.length > 0 && safeVariants.length > 0;
      const parsedLowThreshold = parseInt(String(lowStockThreshold || "").replace(/[^0-9]/g, ""), 10) || 5;
      const effectiveSku = String(skuCode || "").trim() || `FB-${Math.floor(Math.random() * 900000 + 100000)}`;

      const finalVariants: ProductVariant[] = hasVariants
        ? safeVariants.map((vi) => ({
            id: vi.id || `var-${(vi.name || "").toLowerCase().replace(/\s+/g, "-")}`,
            sku: String(vi.sku || "").trim() || `${effectiveSku}-${(vi.name || "").slice(0, 3).toUpperCase()}`,
            name: vi.name || "Default",
            price: parseFloat(String(vi.price || "").replace(/[^0-9.]/g, "")) || parsedPrice,
            mrp: parsedMrp,
            stock: parseInt(String(vi.stock || "").replace(/[^0-9]/g, ""), 10) || parsedStock,
            attributes: { color: vi.name },
          }))
        : [];

      const coverImg = mainImage || (Array.isArray(galleryImages) && galleryImages[0]) || "";
      const allImgs = Array.isArray(galleryImages) && galleryImages.length > 0 ? galleryImages : (coverImg ? [coverImg] : []);

      const advanceDeliveryFee = codAvailable ? (parseFloat(String(deliveryCharge || codCharge).replace(/[^0-9.]/g, "")) || 100) : 0;

      const newProduct: AdminProduct = {
        id: formId || `p${Date.now()}`,
        title: cleanTitle,
        sku: effectiveSku,
        brand: String(brandName || "FaasBay Collection").trim(),
        codAvailable: codAvailable,
        codCharge: advanceDeliveryFee,
        isCodFree: false,
        deliveryType: "free",
        deliveryCharge: advanceDeliveryFee,
        freeShipping: true,
        category: productCategory || "Fashion & Apparel",
        collections: selectedCollections,
        tags: Array.from(
          new Set([
            ...(selectedCollections || []),
            ...(keywordsList || []).filter(Boolean),
            ...(selectedFeatures || []).filter(Boolean),
          ])
        ),
        features: (selectedFeatures || []).filter(Boolean),
        specifications: specificationsList.filter((s) => s.label.trim() && s.value.trim()),
        colors: hasVariants ? customColorsList.filter((c) => c.name && c.name !== "None") : [],
        description: descriptionProduct || "",
        shortDescription: (descriptionProduct || "").slice(0, 80),
        price: parsedPrice,
        mrp: parsedMrp,
        gstRate: gstRate || "18% GST",
        stock: parsedStock,
        reserved: 0,
        available: parsedStock,
        lowStockThreshold: parsedLowThreshold,
        backorderEnabled: false,
        stockStatus: parsedStock <= 0 ? "Out of Stock" : parsedStock <= parsedLowThreshold ? "Low Stock" : "In Stock",
        image: coverImg,
        images: allImgs,
        // Advanced SEO fields
        metaTitle: String(metaTitle || "").trim() || effectiveTitle,
        metaDescription: String(metaDescription || "").trim() || effectiveDescription,
        slug: effectiveSlug,
        indexable: isIndexable ?? true,
        status: status,
        variants: finalVariants,
        hasVariants: hasVariants,
        warranty: warrantyInfo || specificationsList.find((s) => s.label.toLowerCase() === "warranty" && s.value.trim())?.value || "",
        rating: calculatedRating,
        reviewsCount: safeReviews.length,
        customerReviews: safeReviews,
        freeShipping: deliveryType === "free",
        isFlashDeal: isFlashDeal ?? false,
        unitsSold: 0,
        viewsCount: 1,
        addToCartCount: 0,
        conversionRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Write to MongoDB first — the database is the source of truth. Only once it
      // has accepted the product do we update what the admin is looking at.
      try {
        if (isEditing) {
          await updateProductApi(formId, newProduct);
        } else {
          await createProductApi(newProduct);
        }
        setProducts(getCachedAdminProducts());
      } catch (e: any) {
        toast.error(e?.message || "Could not save the product. Nothing was changed.");
        setIsSavingProduct(false);
        return;
      }

      if (status === "Published") {
        toast.success(`"${cleanTitle}" published successfully! 🚀`);
      } else {
        toast.success(`"${cleanTitle}" saved as draft! 📁`);
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("faasbay_product_form_draft");
        const url = new URL(window.location.href);
        url.searchParams.delete("action");
        url.searchParams.delete("productId");
        window.history.replaceState({}, "", url.toString());
      }

      setViewMode("list");
      setIsEditing(false);
      formBaselineRef.current = null;
      setIsDirty(false);
      return true;
    } catch (err: any) {
      console.error("Error saving product:", err);
      toast.error(`Could not save product: ${err?.message || "Unknown error"}`);
      return false;
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Review Management Helpers
  const handleOpenAddReview = () => {
    setEditingReviewId(null);
    setReviewAuthor("");
    setReviewRating(5);
    setReviewDate("2 days ago");
    setReviewComment("");
    setReviewVerified(true);
    setReviewAvatar("");
    setReviewImages([]);
    setReviewImageInput("");
    setShowAddReviewModal(true);
  };

  const handleOpenEditReview = (rev: Review) => {
    setEditingReviewId(rev.id);
    setReviewAuthor(rev.author);
    setReviewRating(rev.rating);
    setReviewDate(rev.date);
    setReviewComment(rev.comment);
    setReviewVerified(rev.verified);
    setReviewAvatar(rev.userPhoto || "");
    setReviewImages(rev.images || []);
    setReviewImageInput("");
    setShowAddReviewModal(true);
  };

  const handleSaveCustomReview = () => {
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    if (editingReviewId) {
      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === editingReviewId
            ? {
                ...r,
                author: reviewAuthor.trim(),
                rating: reviewRating,
                date: reviewDate.trim() || "Recently",
                comment: reviewComment.trim(),
                verified: reviewVerified,
                userPhoto: reviewAvatar.trim() || undefined,
                images: reviewImages,
              }
            : r
        )
      );
    } else {
      const newRev: Review = {
        id: `rev-${Date.now()}`,
        author: reviewAuthor.trim(),
        rating: reviewRating,
        date: reviewDate.trim() || "Just now",
        comment: reviewComment.trim(),
        verified: reviewVerified,
        userPhoto: reviewAvatar.trim() || undefined,
        images: reviewImages,
      };
      setReviewsList((prev) => [newRev, ...prev]);
    }
    setShowAddReviewModal(false);
  };

  const handleDeleteReview = (revId: string) => {
    setReviewsList((prev) => prev.filter((r) => r.id !== revId));
  };

  const handleAddReviewImage = (url: string) => {
    if (!url.trim()) return;
    setReviewImages((prev) => [...prev, url.trim()]);
    setReviewImageInput("");
  };

  const handleRemoveReviewImage = (idxToRemove: number) => {
    setReviewImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    const trimmed = newCatInput.trim();
    if (!categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setProductCategory(trimmed);
    }
    setNewCatInput("");
    setShowAddCategoryModal(false);
  };

  const deleteProduct = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    try {
      await deleteProductApi(target.id);
      setProducts(getCachedAdminProducts());
      toast.success(`Deleted "${target.title}". 🗑️`);
    } catch (e: any) {
      toast.error(e?.message || "Could not delete the product.");
    }
  };

  const duplicateProduct = (p: AdminProduct) => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 90000 + 10000);
    const newId = `p${timestamp}_${randomSuffix}`;
    const newSku = p.sku ? `${p.sku}-COPY` : `FB-${Math.floor(Math.random() * 900000 + 100000)}`;
    const newTitle = `${p.title} (Copy)`;

    const clonedProduct: AdminProduct = {
      ...p,
      id: newId,
      title: newTitle,
      sku: newSku,
      status: p.status || "Published",
      salesCount: 0,
      viewsCount: 0,
      collections:
        Array.isArray(p.collections) && p.collections.length > 0
          ? p.collections
          : ["trending", "new-arrivals", "best-sellers"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: Array.isArray(p.variants)
        ? p.variants.map((v, idx) => ({
            ...v,
            id: `${newId}-v${idx + 1}`,
            sku: v.sku ? `${v.sku}-COPY` : `${newSku}-V${idx + 1}`,
          }))
        : [],
    };

    createProductApi(clonedProduct)
      .then(() => {
        setProducts(getCachedAdminProducts());
        toast.success(`Duplicated "${p.title}" successfully! 📋`);
      })
      .catch((e: any) => toast.error(e?.message || "Could not duplicate the product."));
  };

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW: Add / Edit Product (Simplified Clean FaasBay Design)
  // ──────────────────────────────────────────────────────────────────────────
  if (viewMode === "form") {
    // Calculated helpers for live preview & calculations
    const displaySellingPrice = parseFloat(String(basePrice || "").replace(/[^0-9.]/g, "")) || 0;
    const displayMrpPrice = parseFloat(String(mrpPrice || "").replace(/[^0-9.]/g, "")) || (displaySellingPrice ? Math.round(displaySellingPrice * 1.3) : 0);
    const discountPercentCalc = displayMrpPrice > displaySellingPrice && displaySellingPrice > 0
      ? Math.round(((displayMrpPrice - displaySellingPrice) / displayMrpPrice) * 100)
      : 0;
    const previewCoverImage = mainImage || (galleryImages && galleryImages[0]) || "";
    const avgRating = reviewsList.length > 0
      ? (reviewsList.reduce((sum, r) => sum + (r.rating || 5), 0) / reviewsList.length).toFixed(1)
      : "4.9";

    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
        {/* ── Top Header Bar (Exact FaasBay Design) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRequestCloseForm}
              className="p-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="Back to products list"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {isEditing ? (nameProduct || "Edit Product") : "New Product"}
                </h1>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                    isEditing
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {isEditing ? (formId || "Active") : "Draft"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {nameProduct ? `Editing ${productCategory || "Product"} • SKU: ${skuCode || "Auto"}` : "Configure product details, images, price, stock & delivery"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Discard / Cancel */}
            <button
              type="button"
              onClick={handleRequestCloseForm}
              className="px-3.5 py-2 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-all cursor-pointer"
            >
              Discard
            </button>

            {/* Duplicate Product (when editing) */}
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  const currentProd = products.find((prod) => prod.id === formId);
                  if (currentProd) {
                    duplicateProduct(currentProd);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                title="Duplicate this product as a new draft"
              >
                <Copy size={13} className="text-slate-500" />
                <span>Duplicate</span>
              </button>
            )}

            {/* Secondary: Save Draft */}
            <button
              type="button"
              disabled={isSavingProduct}
              onClick={() => handleSaveProduct("Draft")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProduct ? (
                <Loader2 size={13} className="animate-spin text-slate-500" />
              ) : (
                <Bookmark size={13} className="text-slate-400" />
              )}
              <span>Save Draft</span>
            </button>

            {/* Primary: Publish / Update Product */}
            <button
              type="button"
              disabled={isSavingProduct}
              onClick={() => handleSaveProduct("Published")}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingProduct ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : (
                <Check size={14} />
              )}
              <span>{isSavingProduct ? "Saving..." : isEditing ? "Update & Publish Product" : "Publish Product"}</span>
            </button>
          </div>
        </div>

        {/* ── 2-Column Responsive Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* LEFT MAIN COLUMN (lg:col-span-8)                                   */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-6">

            {/* ── 1. BASIC INFORMATION ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  1. Basic Information
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Product title, URL handle & rich formatted description</p>
              </div>

              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. LCD Drawing Pen Case – Reusable Writing & Drawing Tablet"
                  value={nameProduct}
                  onChange={(e) => handleProductNameChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all font-medium"
                />
              </div>

              {/* URL Handle / Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">URL Handle / Slug</label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden focus-within:border-slate-400 focus-within:bg-white transition-all">
                  <span className="px-3 text-xs text-slate-400 border-r border-slate-200/70 select-none">
                    faasbay.com/product/
                  </span>
                  <input
                    type="text"
                    placeholder="lcd-drawing-pen-case"
                    value={urlSlug}
                    onChange={(e) => {
                      setUrlSlug(e.target.value);
                      setIsCustomSlug(true);
                    }}
                    className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Product Description <span className="text-rose-500">*</span>
                </label>
                <RichDescriptionEditor
                  value={descriptionProduct}
                  onChange={handleProductDescriptionChange}
                  productTitle={nameProduct}
                  placeholder="Provide a clear description covering key features, materials, package contents, or usage instructions..."
                />
              </div>
            </section>

            {/* ── 2. PRODUCT IMAGES ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>2. Product Images</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B0CB1F]/20 text-slate-800">
                      Cover + Gallery
                    </span>
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      📐 800 × 800 px (1:1)
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload product photos. The <strong>Primary Cover Image</strong> is displayed on catalog cards and search grids.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrlTarget("gallery");
                      setShowImageUrlModal(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Link2 size={12} />
                    <span>Add from URL</span>
                  </button>
                  {galleryImages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllMedia}
                      className="text-xs font-medium text-slate-400 hover:text-rose-600 px-2 py-1 transition-colors cursor-pointer"
                    >
                      Clear Photos
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Upload size={12} />
                    <span>Upload Photos</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                {/* Primary Cover Image Box */}
                <div className="sm:col-span-5 space-y-2">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Star size={13} className="text-[#849a15] fill-[#B0CB1F]" />
                    <span>Main Product Image *</span>
                  </span>

                  <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-200/90 overflow-hidden relative group flex items-center justify-center shadow-2xs">
                    {mainImage ? (
                      <>
                        <img
                          src={mainImage}
                          alt="Main product cover"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5 border border-white/10">
                          <span className="w-2 h-2 rounded-full bg-[#B0CB1F] animate-pulse" />
                          <span>★ Primary Cover</span>
                        </div>

                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                          <button
                            type="button"
                            onClick={() => primaryFileInputRef.current?.click()}
                            className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition-transform cursor-pointer"
                          >
                            <Upload size={13} /> Replace Cover
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrlTarget("primary");
                              setShowImageUrlModal(true);
                            }}
                            className="bg-slate-900/90 hover:bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Link2 size={13} /> Change via URL
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#B0CB1F]/15 flex items-center justify-center text-slate-700">
                          <ImageIcon size={24} className="text-slate-700" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">Set Main Product Photo</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Main image shown on storefront cards and catalog grids
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => primaryFileInputRef.current?.click()}
                            className="bg-slate-900 hover:bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrlTarget("primary");
                              setShowImageUrlModal(true);
                            }}
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Enter URL
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Images Gallery */}
                <div className="sm:col-span-7 space-y-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Additional Images ({galleryImages.length})
                  </span>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {galleryImages.map((img, i) => {
                      const isPrimary = i === 0;
                      return (
                        <div
                          key={i}
                          draggable
                          onDragStart={(e) => handleDragStart(e, i)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, i)}
                          className={`relative aspect-square rounded-xl bg-slate-50 overflow-hidden border transition-all cursor-grab active:cursor-grabbing group select-none ${
                            isPrimary
                              ? "border-slate-900 ring-2 ring-slate-900/20 shadow-xs"
                              : "border-slate-200 hover:border-slate-400"
                          } ${draggedImgIndex === i ? "opacity-40 scale-95 border-dashed border-emerald-500" : ""}`}
                          onClick={() => handleSetPrimaryImage(img, i)}
                        >
                          <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />

                          {isPrimary ? (
                            <div className="absolute top-1 left-1 bg-slate-900 text-[#B0CB1F] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-1">
                              <Star size={9} className="fill-[#B0CB1F]" />
                              <span>★ Cover</span>
                            </div>
                          ) : (
                            <div className="absolute top-1 left-1 bg-slate-900/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              #{i + 1}
                            </div>
                          )}

                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={(e) => handleSetPrimaryImage(img, i, e)}
                              className="absolute inset-x-1 bottom-1 bg-slate-900/90 hover:bg-black text-white text-[10px] font-semibold py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 shadow-md cursor-pointer"
                              title="Make this the Primary Cover"
                            >
                              <Star size={10} className="text-[#B0CB1F]" />
                              <span>Set Cover</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleRemoveGalleryImage(i, e)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-2xs"
                            title="Remove image"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex flex-col items-center justify-center transition-all cursor-pointer group"
                      title="Upload additional photos"
                    >
                      <Plus size={18} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
                      <span className="text-[10px] font-medium mt-1">Add Photos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setImageUrlTarget("gallery");
                        setShowImageUrlModal(true);
                      }}
                      className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 text-slate-500 hover:text-slate-800 flex flex-col items-center justify-center transition-all cursor-pointer group"
                      title="Add image by URL"
                    >
                      <Link2 size={16} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
                      <span className="text-[10px] font-medium mt-1">Add URL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={primaryFileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePrimaryUpload}
                className="hidden"
              />
              <input
                ref={galleryFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />
            </section>

            {/* ── 3. PRICE & INVENTORY ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    3. Price & Inventory
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Selling price, MRP compare rate and stock limits</p>
                </div>
                {discountPercentCalc > 0 && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Save {discountPercentCalc}% OFF
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Selling Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="299"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                    />
                  </div>
                </div>

                {/* Original / Compare Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Original MRP (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="399"
                      value={mrpPrice}
                      onChange={(e) => setMrpPrice(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-xs text-slate-500 line-through focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                    />
                  </div>
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={stockCount}
                    onChange={(e) => setStockCount(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>
              </div>

              {/* SKU and Low Stock Alert (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">SKU / Item Code</label>
                  <input
                    type="text"
                    placeholder="e.g. LCD-PEN-CASE-01"
                    value={skuCode}
                    onChange={(e) => setSkuCode(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Low Stock Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* ── 4. PRODUCT VARIANTS & ATTRIBUTES ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  4. Product Variants & Attributes
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure color variations, size options, and edition specifications.
                </p>
              </div>

              {/* Color Options */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Available Color Options</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomColor(!showAddCustomColor)}
                    className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    + Add Custom Color
                  </button>
                </div>

                {showAddCustomColor && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Space Gray, Coral Red)"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomColor()}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomColor(false)}
                      className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {[...availableColorVariants, ...customColorsList].map((c) => {
                    const isSelected = selectedColors.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggleColor(c.name)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                            : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200/80"
                        }`}
                      >
                        {c.hex && (
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                        )}
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Variant Matrix Table (when variants are selected) */}
              {variantItems.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      Variant Matrix & Stock ({variantItems.length})
                    </span>
                    <span className="text-[11px] text-slate-400">Custom pricing & SKU per variant</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <tr>
                          <th className="p-2.5">Variant</th>
                          <th className="p-2.5">SKU</th>
                          <th className="p-2.5">Stock</th>
                          <th className="p-2.5">Price (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {variantItems.map((vi, viIdx) => (
                          <tr key={vi.id || viIdx}>
                            <td className="p-2.5 font-medium text-slate-900">{vi.name}</td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={vi.sku}
                                onChange={(e) => updateVariantItem(viIdx, "sku", e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={vi.stock}
                                onChange={(e) => updateVariantItem(viIdx, "stock", e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={vi.price}
                                onChange={(e) => updateVariantItem(viIdx, "price", e.target.value)}
                                className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-semibold"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* ── 5. PRODUCT DETAILS & SPECIFICATIONS ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  5. Product Details & Specifications
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Key feature bullet points and technical specifications table
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Key Features</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomFeature(!showAddCustomFeature)}
                    className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    + Add Feature
                  </button>
                </div>

                {showAddCustomFeature && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
                    <input
                      type="text"
                      placeholder="e.g. Easy writing & drawing, One-key erase, Screen lock..."
                      value={customFeatureInput}
                      onChange={(e) => setCustomFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomFeature();
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomFeature()}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCustomFeature(false);
                        setCustomFeatureInput("");
                      }}
                      className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {quickFeatureTags.slice(0, 8).map((tag) => {
                    const isSelected = selectedFeatures.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleFeature(tag)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold"
                            : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200/80"
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}

                  {selectedFeatures
                    .filter((f) => !quickFeatureTags.slice(0, 8).includes(f))
                    .map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(f)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border bg-slate-900 text-white border-slate-900 shadow-2xs"
                      >
                        ✓ {f}
                      </button>
                    ))}
                </div>
              </div>

              {/* Specifications (Key-Value pairs) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block">Specifications</label>
                    <p className="text-[11px] text-slate-400">Attributes displayed in the Specs tab</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSpecificationRow("", "")}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Specification</span>
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {["Material", "Size", "Dimensions", "Weight", "Battery", "Warranty"].map((preset) => {
                    const alreadyAdded = specificationsList.some((s) => s.label.toLowerCase() === preset.toLowerCase());
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          if (!alreadyAdded) handleAddSpecificationRow(preset, "");
                        }}
                        disabled={alreadyAdded}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                          alreadyAdded
                            ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-default"
                            : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200/80"
                        }`}
                      >
                        + {preset}
                      </button>
                    );
                  })}
                </div>

                {/* Specifications Rows */}
                {specificationsList.length > 0 && (
                  <div className="space-y-2">
                    {specificationsList.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70"
                      >
                        <input
                          type="text"
                          placeholder="Material / Size / Battery"
                          value={spec.label}
                          onChange={(e) => handleUpdateSpecificationRow(sIdx, "label", e.target.value)}
                          className="w-1/3 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-slate-400"
                        />
                        <span className="text-slate-400 text-xs font-bold">→</span>
                        <input
                          type="text"
                          placeholder="ABS / 8.5 inch / CR2025"
                          value={spec.value}
                          onChange={(e) => handleUpdateSpecificationRow(sIdx, "value", e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecificationRow(sIdx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove specification"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── 6. SEARCH ENGINE OPTIMIZATION (SEO) ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    6. Search Engine Optimization (SEO)
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Live Google Search SERP preview and meta tags
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetSyncSEO}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  ↻ Auto-generate
                </button>
              </div>

              {/* Google SERP Preview Card */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Google Search Snippet Preview
                </span>
                <p className="text-sm font-medium text-[#1a0dab] hover:underline cursor-pointer truncate">
                  {metaTitle || (nameProduct ? generateCleanMetaTitle(nameProduct, brandName) : "Product Title | FaasBay")}
                </p>
                <p className="text-xs text-[#006621] font-mono truncate">
                  https://faasbay.com/product/{urlSlug || (nameProduct ? slugify(nameProduct) : "product-slug")}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {metaDescription || descriptionProduct?.slice(0, 150) || "Discover high-quality products on FaasBay with fast shipping, COD available, and genuine warranty."}
                </p>
              </div>

              <div className="space-y-4">
                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700">Meta Title</label>
                    <span className="text-[11px] text-slate-400">{metaTitle.length}/60 characters</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. LCD Drawing Pen Case – Reusable Writing Tablet | FaasBay"
                    value={metaTitle}
                    onChange={(e) => {
                      setMetaTitle(e.target.value);
                      setIsCustomMetaTitle(true);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700">Meta Description</label>
                    <span className="text-[11px] text-slate-400">{metaDescription.length}/160 characters</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Summary of product for search engine result snippets..."
                    value={metaDescription}
                    onChange={(e) => {
                      setMetaDescription(e.target.value);
                      setIsCustomMetaDesc(true);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 leading-relaxed"
                  />
                </div>
              </div>
            </section>

            {/* ── 7. CUSTOMER REVIEWS & SOCIAL PROOF ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    7. Customer Reviews & Social Proof
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Display customer testimonials and verified buyer ratings
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAddReview}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Review</span>
                  </button>
                </div>
              </div>

              {/* Rating Overview */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1 text-amber-500 font-bold text-base">
                  <Star size={18} className="fill-amber-400 text-amber-400" />
                  <span>{avgRating}</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-medium text-slate-700">
                  {reviewsList.length} Verified Customer Review{reviewsList.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Reviews Cards List */}
              {reviewsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reviewsList.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{rev.author}</p>
                          <div className="flex items-center gap-1 text-amber-400 text-[10px] mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={11}
                                className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                              />
                            ))}
                            <span className="text-slate-400 text-[10px] ml-1">{rev.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleOpenEditReview(rev)}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-3">
                        "{rev.comment}"
                      </p>

                      {rev.images && rev.images.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                          {rev.images.map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200/80 bg-white shrink-0"
                            >
                              <img
                                src={imgUrl}
                                alt={`Customer photo ${imgIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400">No reviews added yet.</p>
                </div>
              )}
            </section>

          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* RIGHT SIDEBAR COLUMN (lg:col-span-4)                               */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-6">

            {/* ── 1. STATUS & VISIBILITY ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Product Status
              </h3>

              <div className="space-y-2">
                <select
                  value={productStatus}
                  onChange={(e) => handleProductStatusChange(e.target.value as "Published" | "Draft" | "Archived")}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="Published">Active / Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${productStatus === "Published" ? "bg-emerald-500" : "bg-slate-300"}`}
                  />
                  <span>
                    {productStatus === "Published"
                      ? "Visible on Online Storefront & Search"
                      : productStatus === "Draft"
                        ? "Hidden — not visible to shoppers yet"
                        : "Archived — hidden from the storefront"}
                  </span>
                </div>
              </div>
            </section>

            {/* ── 2. ORGANIZATION & CATEGORY ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Organization
              </h3>

              {/* Category */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">Category</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    + Add New
                  </button>
                </div>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Brand / Vendor</label>
                <input
                  type="text"
                  placeholder="FaasBay Collection"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Homepage Visibility & Section Placements */}
              <div className="space-y-2 pt-2.5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 block">Homepage Visibility</label>
                  <button
                    type="button"
                    onClick={() => {
                      const allKeys = HOMEPAGE_COLLECTIONS.map((c) => c.id);
                      if (selectedCollections.length === allKeys.length) {
                        setSelectedCollections([]);
                      } else {
                        setSelectedCollections(allKeys);
                      }
                    }}
                    className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    {selectedCollections.length > 0 ? "Clear All" : "Select All"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Select which sections this product appears in on the storefront homepage:
                </p>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {HOMEPAGE_COLLECTIONS.map((col) => {
                    const active = selectedCollections.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => toggleCollection(col.id)}
                        className={`p-2 text-[11px] rounded-xl border text-center transition-all cursor-pointer ${
                          active
                            ? "bg-slate-900 text-white border-slate-900 font-bold shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 font-medium"
                        }`}
                      >
                        {active ? `✓ ${col.label}` : col.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── 3. PAYMENT & SHIPPING SETTINGS ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Payment & Delivery Charges
              </h3>

              {/* COD Toggle & Advance Delivery Charge */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-slate-400">Enable COD for this product</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={codAvailable}
                    onChange={(e) => setCodAvailable(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                  />
                </div>
                {codAvailable && (
                  <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">COD Advance Delivery Charge (₹)</span>
                      <span className="text-[10px] text-slate-400">Customer pays this delivery fee online upfront</span>
                    </div>
                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="100"
                        value={deliveryCharge || codCharge}
                        onChange={(e) => {
                          setDeliveryCharge(e.target.value);
                          setCodCharge(e.target.value);
                        }}
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-right"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Prepaid Delivery Info Banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <div>
                  <span className="text-xs font-semibold text-emerald-800 block">Prepaid Orders (UPI / Card / NetBanking)</span>
                  <span className="text-[10px] text-emerald-600">100% Free Delivery (Zero shipping fee)</span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ₹0 FREE
                </span>
              </div>
            </section>

            {/* ── 4. LIVE STOREFRONT CARD PREVIEW ── */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Eye size={13} className="text-slate-700" />
                  <span>Live Storefront Card</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  Real-time
                </span>
              </div>

              {/* Mini Storefront Card */}
              <div className="bg-[#fcfbf9] dark:bg-slate-900 rounded-xl p-3 border border-slate-200/80 space-y-2.5">
                <div className="aspect-square w-full rounded-lg bg-white overflow-hidden relative border border-slate-100 flex items-center justify-center">
                  {previewCoverImage ? (
                    <img
                      src={previewCoverImage}
                      alt="Store preview"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300 gap-2 p-6 text-center select-none">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                        <ImageIcon size={22} className="stroke-[1.5]" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">No Image Uploaded</span>
                    </div>
                  )}
                  {discountPercentCalc > 0 && (
                    <span className="absolute top-2 left-2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      {discountPercentCalc}% OFF
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {productCategory || "General"}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {nameProduct || "Product Title Preview"}
                  </h4>

                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-sm font-bold text-slate-900">
                      ₹{displaySellingPrice || 0}
                    </span>
                    {displayMrpPrice > displaySellingPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{displayMrpPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 text-[10px] pt-0.5">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-700">{avgRating}</span>
                    <span className="text-slate-400">({reviewsList.length})</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold tracking-wide cursor-default opacity-90"
                >
                  Add to Bag
                </button>
              </div>
            </section>

          </div>

        </div>

        {/* ── Bottom Action Footer ── */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={handleRequestCloseForm}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel & Return
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSavingProduct}
              onClick={() => handleSaveProduct("Draft")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all shadow-2xs active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProduct ? (
                <Loader2 size={13} className="animate-spin text-slate-500" />
              ) : (
                <Bookmark size={13} className="text-slate-400" />
              )}
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              disabled={isSavingProduct}
              onClick={() => handleSaveProduct("Published")}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingProduct ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : (
                <Check size={14} />
              )}
              <span>{isSavingProduct ? "Saving..." : isEditing ? "Update Product" : "Publish Product"}</span>
            </button>
          </div>
        </div>

        {/* ── Unsaved Changes Discard Confirmation Modal ── */}
        {showDiscardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Unsaved Product Changes</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    You have unsaved changes in this product. What would you like to do before leaving?
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardModal(false);
                    setPendingNavigation(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Continue Editing
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowDiscardModal(false);
                    const target = pendingNavigation;
                    setPendingNavigation(null);
                    const saved = await handleSaveProduct("Draft");
                    if (saved && target) {
                      window.dispatchEvent(new CustomEvent("faasbay_force_navigate", { detail: target }));
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = pendingNavigation;
                    setPendingNavigation(null);
                    handleForceCloseForm();
                    if (target) {
                      window.dispatchEvent(new CustomEvent("faasbay_force_navigate", { detail: target }));
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Add/Edit Review Modal ── */}
        {showAddReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {editingReviewId ? "Edit Customer Review" : "Add Customer Review"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Rating Stars</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          size={18}
                          className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Review Text</label>
                  <textarea
                    rows={3}
                    placeholder="Write honest customer feedback..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 leading-relaxed"
                  />
                </div>

                {/* Review Images Upload */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700">Customer Photos / Images</label>
                    <span className="text-[11px] text-slate-400">Optional</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="review-modal-file-input"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer shrink-0"
                    >
                      <Camera size={13} className="text-slate-500" />
                      <span>Upload Image</span>
                    </label>
                    <input
                      id="review-modal-file-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReviewFileUpload}
                      className="hidden"
                    />

                    <div className="flex-1 flex items-center gap-1.5">
                      <input
                        type="url"
                        placeholder="Or paste image URL..."
                        value={reviewImageInput}
                        onChange={(e) => setReviewImageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddReviewImage(reviewImageInput);
                          }
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddReviewImage(reviewImageInput)}
                        disabled={!reviewImageInput.trim()}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {reviewImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {reviewImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                        >
                          <img
                            src={img}
                            alt={`Review upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveReviewImage(idx)}
                            className="absolute top-1 right-1 w-4 h-4 bg-black/75 hover:bg-black text-white rounded-full flex items-center justify-center cursor-pointer shadow-xs transition-transform hover:scale-110"
                            title="Remove image"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomReview}
                  className="px-4 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-2xs cursor-pointer"
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Image URL Modal ── */}
        {showImageUrlModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 w-full max-w-sm space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Link2 size={14} className="text-slate-700" />
                  Add Image via Direct URL
                </h3>
                <button
                  type="button"
                  onClick={() => setShowImageUrlModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">
                    Apply To
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setImageUrlTarget("primary")}
                      className={`py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        imageUrlTarget === "primary"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      ★ Primary Cover
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrlTarget("gallery")}
                      className={`py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        imageUrlTarget === "gallery"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Gallery Item
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImageUrlModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={!imageUrlInput.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg cursor-pointer shadow-2xs disabled:opacity-40"
                >
                  Add Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Category Modal ── */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">Add Custom Category</h3>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X size={15} />
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. Health & Wellness, Toys"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                autoFocus
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-2xs cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW: Products Table / Grid List (Exact Salesai UI Style)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ── Top Controls Row (View Switcher, Search, Limit, Sort, Filter, Add Product) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white/75 backdrop-blur-xl p-3.5 rounded-2xl border border-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)]">
        {/* Left segment: View toggles & Search */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Segmented View Switcher */}
          <div className="flex items-center p-1 bg-white/60 backdrop-blur-md rounded-xl border border-white/80 shrink-0 shadow-2xs">
            <button
              onClick={() => setDisplayType("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                displayType === "list"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
            <button
              onClick={() => setDisplayType("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                displayType === "grid"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>

          {/* Show: Filter dropdown */}
          <div className="relative hidden sm:block">
            <select
              value={showProductLimit}
              onChange={(e) => setShowProductLimit(e.target.value)}
              className="bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-emerald-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="All Products">Show: All Products</option>
              <option value="In Stock">Show: In Stock</option>
              <option value="Low Stock">Show: Low Stock</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort By dropdown */}
          <div className="relative hidden md:block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-emerald-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="Default">Sort by: Default</option>
              <option value="Price: Low to High">Sort by: Price (Low to High)</option>
              <option value="Price: High to Low">Sort by: Price (High to Low)</option>
              <option value="Stock: High to Low">Sort by: Stock (High to Low)</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Right segment: Filter button & + Add new product */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showFilterDropdown
                ? "bg-slate-100 border-slate-300 text-slate-900 font-bold"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Filter size={14} className="text-slate-500" />
            <span>Filter</span>
          </button> */}

          <button
            onClick={openCreateProduct}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 text-xs font-bold shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} className="text-emerald-600" />
            <span>Add new product</span>
          </button>
        </div>
      </div>

      {/* ── Secondary Filter Row (Category, Price, Status, Store dropdowns) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/75 backdrop-blur-xl p-3.5 rounded-2xl border border-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)]">
        {/* 1. Category Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600">Category</label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white appearance-none pr-8 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* 2. Status Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600">Status</label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white appearance-none pr-8 cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="No Active">No Active</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* 4. Store / Brand Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600">Store</label>
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white appearance-none pr-8 cursor-pointer"
            >
              <option value="All Brands">All Collection</option>
              <option value="FaasBay Audio">FaasBay Audio</option>
              <option value="FaasBay Tech">FaasBay Tech</option>
              <option value="RoboToys">RoboToys</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* 5. Homepage Visibility Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600">Homepage</label>
          <div className="relative">
            <select
              value={selectedHomepageFilter}
              onChange={(e) => setSelectedHomepageFilter(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white appearance-none pr-8 cursor-pointer"
            >
              <option value="All Homepage">All Products</option>
              <option value="On Homepage">On Homepage (Any Row)</option>
              <option value="Not on Homepage">Not on Homepage</option>
              {HOMEPAGE_COLLECTIONS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Table View (Exact Salesai Matching Design) ── */}
      {displayType === "list" ? (
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl border border-white/90 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500">
                  <th className="py-3.5 pl-5 pr-2 w-10">
                    <button
                      onClick={toggleAllRows}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        selectedRows.size > 0 && selectedRows.size === filteredProducts.length
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-2xs"
                          : selectedRows.size > 0
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-700"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                      title={
                        selectedRows.size === filteredProducts.length
                          ? "Deselect all products"
                          : "Select all products"
                      }
                    >
                      {selectedRows.size === filteredProducts.length && (
                        <Check size={10} strokeWidth={3} />
                      )}
                      {selectedRows.size > 0 && selectedRows.size < filteredProducts.length && (
                        <Minus size={10} strokeWidth={3} />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-slate-500">
                    <div className="flex items-center gap-2 select-none">
                      <div
                        className="flex items-center gap-1 cursor-pointer hover:text-slate-800 transition-colors"
                        onClick={() => handleSort("title")}
                      >
                        <span>Product info</span>
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </div>

                      {selectedRows.size > 0 ? (
                        <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-xs">
                            <CheckCircle2 size={11} strokeWidth={2.5} />
                            {selectedRows.size} of {filteredProducts.length} selected
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              if (bulkHomepagePopoverAnchor) {
                                setBulkHomepagePopoverAnchor(null);
                                return;
                              }
                              const rect = e.currentTarget.getBoundingClientRect();
                              setBulkHomepagePopoverAnchor({ top: rect.bottom + 6, left: rect.left });
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
                            title="Set homepage visibility for selected products"
                          >
                            <Home size={10} />
                            <span>Homepage ({selectedRows.size})</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleBulkDelete}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                            title="Delete selected products"
                          >
                            <Trash2 size={10} />
                            <span>Delete ({selectedRows.size})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRows(new Set())}
                            className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer underline ml-0.5"
                          >
                            Clear
                          </button>

                          {bulkHomepagePopoverAnchor &&
                            typeof document !== "undefined" &&
                            createPortal(
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setBulkHomepagePopoverAnchor(null)}
                                />
                                <div
                                  className="fixed z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-2 space-y-1"
                                  style={{ top: bulkHomepagePopoverAnchor.top, left: bulkHomepagePopoverAnchor.left }}
                                >
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 pb-1">
                                    Set homepage rows for {selectedRows.size} selected:
                                  </div>
                                  {HOMEPAGE_COLLECTIONS.map((col) => {
                                    const selected = products.filter((p) => selectedRows.has(p.id));
                                    const allHaveIt = selected.every((p) => (p.collections || []).includes(col.id));
                                    const someHaveIt = selected.some((p) => (p.collections || []).includes(col.id));
                                    return (
                                      <button
                                        key={col.id}
                                        type="button"
                                        onClick={() => bulkUpdateHomepageCollection(col.id)}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                          allHaveIt
                                            ? "bg-slate-900 text-white"
                                            : someHaveIt
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                        title={allHaveIt ? `Remove ${col.label} from all selected` : `Add ${col.label} to all selected`}
                                      >
                                        <span>{col.label}</span>
                                        {allHaveIt ? (
                                          <Check size={12} strokeWidth={3} />
                                        ) : someHaveIt ? (
                                          <Minus size={12} strokeWidth={3} />
                                        ) : null}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>,
                              document.body
                            )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200/80">
                          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-slate-500">
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span>Price</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-slate-500">
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span>Stock</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-slate-500">
                    <span>Homepage</span>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-slate-500 text-right pr-6">
                    <span>Active</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-xs text-slate-400">
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = selectedRows.has(p.id);
                    const isActive = p.status === "Published";
                    const maxCap = 100;
                    const stockRatio = Math.min(100, Math.round((p.stock / maxCap) * 100));

                    // Colored progress bar matching screenshot
                    let barColor = "bg-emerald-500";
                    if (stockRatio < 30) barColor = "bg-rose-500";
                    else if (stockRatio < 70) barColor = "bg-amber-400";

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* 1. Selection Radio/Checkbox Circle */}
                        <td className="py-4 pl-5 pr-2">
                          <button
                            onClick={() => toggleRowSelect(p.id)}
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-2xs"
                                : "border-slate-300 group-hover:border-slate-400"
                            }`}
                          >
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </button>
                        </td>

                        {/* 2. Product Info (Thumb + Title + ID) */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/60 overflow-hidden shrink-0 flex items-center justify-center p-1">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <ImageIcon size={20} className="text-slate-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div
                                onClick={() => openEditProduct(p)}
                                className="text-xs font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer max-w-[280px] sm:max-w-sm"
                              >
                                {p.title}
                              </div>
                              <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                                {p.sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Price */}
                        <td className="py-4 px-4">
                          <div className="text-xs font-bold text-slate-900">
                            {formatCurrency(p.price)}
                          </div>
                        </td>

                        {/* 4. Stock & Visual Progress Bar */}
                        <td className="py-4 px-4 min-w-[160px]">
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {p.stock}
                            </div>
                            {/* Horizontal Progress Bar matching reference image */}
                            <div className="mt-1.5 w-32 max-w-full">
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                  style={{ width: `${stockRatio}%` }}
                                />
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5 text-right">
                                {p.stock}/{maxCap}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 4b. Fast Homepage Visibility Toggle */}
                        <td className="py-4 px-4 relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              if (homepagePopoverAnchor?.id === p.id) {
                                setHomepagePopoverAnchor(null);
                                return;
                              }
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHomepagePopoverAnchor({ id: p.id, top: rect.bottom + 6, left: rect.left });
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                              (p.collections || []).length > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                            }`}
                            title="Choose which homepage rows this product appears in"
                          >
                            <Home size={12} />
                            {(p.collections || []).length > 0 ? `${p.collections.length} row${p.collections.length > 1 ? "s" : ""}` : "Hidden"}
                          </button>

                          {homepagePopoverAnchor?.id === p.id &&
                            typeof document !== "undefined" &&
                            createPortal(
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setHomepagePopoverAnchor(null)}
                                />
                                <div
                                  className="fixed z-50 w-56 bg-white rounded-xl border border-slate-200 shadow-lg p-2 space-y-1"
                                  style={{ top: homepagePopoverAnchor.top, left: homepagePopoverAnchor.left }}
                                >
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 pb-1">
                                    Show on homepage in:
                                  </div>
                                  {HOMEPAGE_COLLECTIONS.map((col) => {
                                    const active = (p.collections || []).includes(col.id);
                                    return (
                                      <button
                                        key={col.id}
                                        type="button"
                                        onClick={() => toggleProductHomepageCollection(p.id, col.id)}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                          active
                                            ? "bg-slate-900 text-white"
                                            : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                      >
                                        <span>{col.label}</span>
                                        {active && <Check size={12} strokeWidth={3} />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>,
                              document.body
                            )}
                        </td>

                        {/* 5. Active Toggle Switch & Actions */}
                        <td className="py-4 px-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-3">
                            {/* Quick duplicate / edit / delete on hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mr-2">
                              <button
                                onClick={() => duplicateProduct(p)}
                                className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-800 transition-colors"
                                title="Duplicate Product"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                onClick={() => openEditProduct(p)}
                                className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-800 transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(p)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Smooth Active Switch */}
                            <button
                              type="button"
                              onClick={() => toggleProductActive(p.id)}
                              className="cursor-pointer"
                              title={isActive ? "Product is live on storefront" : "Product is hidden (Draft)"}
                            >
                              <div
                                className={`relative w-9 h-5 rounded-full transition-colors ${
                                  isActive ? "bg-[#22c55e]" : "bg-slate-200"
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                                    isActive ? "translate-x-[18px]" : "translate-x-0.5"
                                  }`}
                                />
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Grid View Mode ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const isActive = p.status === "Published";
            const maxCap = 100;
            const stockRatio = Math.min(100, Math.round((p.stock / maxCap) * 100));
            let barColor = "bg-emerald-500";
            if (stockRatio < 30) barColor = "bg-rose-500";
            else if (stockRatio < 70) barColor = "bg-amber-400";

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-3">
                    <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                    <button
                      onClick={() => toggleProductActive(p.id)}
                      className="absolute top-2.5 right-2.5 cursor-pointer"
                    >
                      <div
                        className={`relative w-8 h-4.5 rounded-full transition-colors shadow-xs ${
                          isActive ? "bg-[#22c55e]" : "bg-black/40"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                            isActive ? "translate-x-[16px]" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                  <h3
                    onClick={() => openEditProduct(p)}
                    className="text-xs font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                  >
                    {p.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">{p.sku}</div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{formatCurrency(p.price)}</span>
                    <span className="text-[11px] font-semibold text-slate-600">{p.stock} in stock</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${stockRatio}%` }} />
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => duplicateProduct(p)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                      title="Duplicate Product"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => openEditProduct(p)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}

// ── Master Catalog View with Sub-Navigation ────────────────────────────────

export default function CatalogMasterView({
  initialTab = "products",
  initialSubTab,
  onSubTabChange,
}: {
  initialTab?: string | undefined;
  initialSubTab?: string | undefined;
  onSubTabChange?: ((sub: string) => void) | undefined;
}) {
  const [tab, setTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subTab");
      if (sub) return sub;
    }
    return initialSubTab || initialTab || "products";
  });
  const [isEditingProduct, setIsEditingProduct] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const action = params.get("action");
      return action === "add" || action === "edit" || action === "form";
    }
    return false;
  });
  const [productCount, setProductCount] = useState(() => getCachedAdminProducts().length);

  React.useEffect(() => {
    const refresh = () => setProductCount(getCachedAdminProducts().length);
    void loadAdminProducts().then(refresh);
    window.addEventListener("faasbay_products_updated", refresh);

    const handleNav = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.tab === "catalog") {
        setTab(detail.subTab || "products");
        setIsEditingProduct(false);
      }
    };
    window.addEventListener("faasbay_admin_navigated", handleNav);

    return () => {
      window.removeEventListener("faasbay_products_updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("faasbay_admin_navigated", handleNav);
    };
  }, []);

  React.useEffect(() => {
    if (initialSubTab) {
      setTab(initialSubTab);
    }
  }, [initialSubTab]);

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
      {/* Hide surrounding sub-tabs when in Product Edit / Creation focus mode */}
      {!isEditingProduct && (
        <TabSwitcher
          tabs={[
            { key: "products", label: "All Products", count: productCount },
            { key: "categories", label: "Categories", count: 16 },
            { key: "collections", label: "Collections", count: 4 },
            { key: "inventory", label: "Inventory & Stock Levels" },
          ]}
          active={tab}
          onChange={handleTabChange}
        />
      )}

      {tab === "products" && (
        <ProductsList
          onViewModeChange={(mode) => setIsEditingProduct(mode === "form")}
        />
      )}
      {tab === "categories" && <Categories />}
      {tab === "collections" && <Collections />}
      {tab === "inventory" && <Inventory />}
    </div>
  );
}




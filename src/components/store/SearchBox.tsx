import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, X, Clock, ArrowUpRight, TrendingUp } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStoreProducts } from "@/components/store/data";
import { searchProducts } from "@/lib/product-search";
import { scrollToSection } from "@/lib/scroll-to-section";

const RECENT_KEY = "faasbay:recent-searches";
const MAX_RECENT = 5;
const MAX_SUGGESTIONS = 6;
const POPULAR_SEARCHES = ["Earbuds", "Smartwatch", "Kitchen", "Under 499", "Makeup", "Storage"];

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list)
      ? list.filter((s) => typeof s === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — recent searches are a convenience only */
  }
}

/** Wraps the parts of `text` matching any query word in <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 0);
  if (!words.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${words.join("|")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        words.includes(part.toLowerCase()) ? (
          <mark key={i} className="bg-transparent font-bold text-foreground">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

type SearchBoxProps = {
  variant: "desktop" | "mobile";
  placeholder: string;
};

type Option = { kind: "product"; id: string } | { kind: "query"; value: string };

export function SearchBox({ variant, placeholder }: SearchBoxProps) {
  const { searchQuery, setSearchQuery, setSelectedCategory, setQuickNavFilter } = useCart();
  const products = useStoreProducts();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [term, setTerm] = useState(searchQuery || "");
  const [debounced, setDebounced] = useState(term);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Keep the box in sync when the query is changed elsewhere (Clear Filter, quick nav…).
  useEffect(() => {
    setTerm(searchQuery || "");
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 120);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  // Close the dropdown on outside clicks.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const trimmed = debounced.trim();
  const suggestions = useMemo(
    () => (trimmed ? searchProducts(products, trimmed) : []),
    [products, trimmed],
  );
  const topSuggestions = suggestions.slice(0, MAX_SUGGESTIONS);

  // Flat list of keyboard-navigable options, in the order they render.
  const options: Option[] = trimmed
    ? [
        ...topSuggestions.map((p) => ({ kind: "product" as const, id: p.id })),
        { kind: "query" as const, value: trimmed },
      ]
    : [
        ...recent,
        ...POPULAR_SEARCHES.filter((s) => !recent.some((r) => r.toLowerCase() === s.toLowerCase())),
      ].map((value) => ({ kind: "query" as const, value }));

  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmed, open]);

  const rememberSearch = (value: string) => {
    const next = [value, ...recent.filter((r) => r.toLowerCase() !== value.toLowerCase())].slice(
      0,
      MAX_RECENT,
    );
    setRecent(next);
    writeRecent(next);
  };

  const commitSearch = async (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    setTerm(value);
    setOpen(false);
    inputRef.current?.blur();
    rememberSearch(value);

    // Search runs across the whole catalog, not inside a category/quick-nav filter.
    setSelectedCategory("all");
    setQuickNavFilter(null);
    setSearchQuery(value);

    // Results render in the home page's filtered catalog.
    if (pathname !== "/") await navigate({ to: "/" });
    scrollToSection(["catalog-section", "categories"]);
  };

  const openProduct = (productId: string) => {
    if (term.trim()) rememberSearch(term.trim());
    setOpen(false);
    inputRef.current?.blur();
    navigate({ to: "/product/$productId", params: { productId } });
  };

  const clearSearch = () => {
    setTerm("");
    setSearchQuery("");
    inputRef.current?.focus();
    setOpen(true);
  };

  const removeRecent = (value: string) => {
    const next = recent.filter((r) => r !== value);
    setRecent(next);
    writeRecent(next);
  };

  const selectOption = (option: Option) => {
    if (option.kind === "product") openProduct(option.id);
    else commitSearch(option.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (options.length ? (i + 1) % options.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (options.length ? (i <= 0 ? options.length - 1 : i - 1) : -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && open && activeIndex >= 0 && options[activeIndex]) {
      e.preventDefault();
      selectOption(options[activeIndex]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitSearch(term);
  };

  const showDropdown = open && options.length > 0;
  const optionId = (i: number) => `${listboxId}-opt-${i}`;
  const isDesktop = variant === "desktop";

  const inputProps = {
    ref: inputRef,
    type: "search" as const,
    value: term,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setTerm(e.target.value);
      setOpen(true);
      // Emptying the box (typing or the native ✕) resets the results.
      if (!e.target.value.trim() && searchQuery) setSearchQuery("");
    },
    onFocus: () => setOpen(true),
    onKeyDown: handleKeyDown,
    placeholder,
    "aria-label": "Search products",
    role: "combobox",
    "aria-expanded": showDropdown,
    "aria-controls": listboxId,
    "aria-autocomplete": "list" as const,
    "aria-activedescendant": activeIndex >= 0 ? optionId(activeIndex) : undefined,
    autoComplete: "off",
    enterKeyHint: "search" as const,
  };

  const clearButton = term ? (
    <button
      type="button"
      onClick={clearSearch}
      aria-label="Clear search"
      className={
        isDesktop
          ? "mr-1.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-90 transition-all cursor-pointer"
          : "mr-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground active:scale-90"
      }
    >
      <X className="h-3 w-3 stroke-[2.5]" />
    </button>
  ) : null;

  return (
    <div ref={wrapperRef} className={isDesktop ? "relative max-w-xl flex-1" : "relative"}>
      {isDesktop ? (
        <form
          onSubmit={handleSubmit}
          role="search"
          className="flex items-center rounded-full border border-input/80 bg-secondary/60 backdrop-blur-md pl-4 pr-1.5 py-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-neutral-400 focus-within:bg-surface focus-within:ring-2 focus-within:ring-neutral-400/10 transition-all"
        >
          <input
            {...inputProps}
            className="w-full bg-transparent text-xs sm:text-[13px] text-foreground outline-none placeholder:text-muted-foreground font-medium [&::-webkit-search-cancel-button]:hidden"
          />
          {clearButton}
          <button
            type="submit"
            aria-label="Search"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-900 text-white hover:bg-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-95 transition-all cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 stroke-[2.2]" />
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleSubmit}
          role="search"
          className="relative flex items-center rounded-xl border border-black/[0.08] dark:border-white/15 bg-neutral-100/90 dark:bg-neutral-800/70 px-3.5 py-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-neutral-900 dark:focus-within:border-white focus-within:bg-surface transition-all"
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0 stroke-[2.2]" />
          <input
            {...inputProps}
            className="min-w-0 flex-1 bg-transparent px-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground font-medium [&::-webkit-search-cancel-button]:hidden"
          />
          {clearButton}
        </form>
      )}

      {showDropdown && (
        <div
          className={`absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-in fade-in-0 slide-in-from-top-1 duration-150 ${
            isDesktop ? "rounded-2xl" : "rounded-xl"
          }`}
        >
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Search suggestions"
            className="max-h-[min(70vh,480px)] overflow-y-auto py-1.5"
          >
            {trimmed ? (
              <>
                {topSuggestions.length === 0 && (
                  <li
                    className="px-4 py-5 text-center text-xs text-muted-foreground"
                    role="presentation"
                  >
                    No products match "
                    <span className="font-semibold text-foreground">{trimmed}</span>"
                  </li>
                )}
                {topSuggestions.map((p, i) => (
                  <li
                    key={p.id}
                    id={optionId(i)}
                    role="option"
                    aria-selected={activeIndex === i}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => openProduct(p.id)}
                    className={`mx-1.5 flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${
                      activeIndex === i ? "bg-secondary" : ""
                    }`}
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {p.image && (
                        <img
                          src={p.image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-muted-foreground">
                        <Highlight text={p.title} query={trimmed} />
                      </p>
                      <p className="truncate text-[10.5px] uppercase tracking-wider text-muted-foreground/80">
                        {p.category}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-bold text-foreground">{p.price}</p>
                      {p.compareAt && (
                        <p className="text-[10.5px] text-muted-foreground line-through">
                          {p.compareAt}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
                <li
                  id={optionId(topSuggestions.length)}
                  role="option"
                  aria-selected={activeIndex === topSuggestions.length}
                  onMouseEnter={() => setActiveIndex(topSuggestions.length)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commitSearch(trimmed)}
                  className={`mx-1.5 mt-1 flex cursor-pointer items-center justify-between gap-3 rounded-xl border-t border-border/60 px-3 py-2.5 text-xs font-semibold transition-colors ${
                    activeIndex === topSuggestions.length ? "bg-secondary" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      See all results for "<span className="font-bold">{trimmed}</span>"
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-white dark:text-neutral-900">
                    {suggestions.length}
                  </span>
                </li>
              </>
            ) : (
              options.map((option, i) => {
                if (option.kind !== "query") return null;
                const isRecent = i < recent.length;
                return (
                  <React.Fragment key={`${isRecent ? "r" : "p"}-${option.value}`}>
                    {(i === 0 || i === recent.length) && (
                      <li
                        role="presentation"
                        className="px-4 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        {isRecent ? "Recent searches" : "Popular searches"}
                      </li>
                    )}
                    <li
                      id={optionId(i)}
                      role="option"
                      aria-selected={activeIndex === i}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commitSearch(option.value)}
                      className={`group mx-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-[13px] transition-colors ${
                        activeIndex === i ? "bg-secondary" : ""
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        {isRecent ? (
                          <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate font-medium text-foreground">{option.value}</span>
                      </span>
                      {isRecent ? (
                        <button
                          type="button"
                          aria-label={`Remove ${option.value} from recent searches`}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecent(option.value);
                          }}
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </li>
                  </React.Fragment>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

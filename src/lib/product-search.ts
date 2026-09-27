// ============================================================================
// FaasBay — Storefront product search
// ============================================================================
//
// Shared by the header search suggestions and the home page's filtered
// catalog, so the dropdown and the "Results for …" grid always agree.

import type { Product } from "@/components/store/data";

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9₹\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Parses a display price like "₹1,299" (or a number) into a number. */
export function parsePrice(price: string | number | undefined): number {
  if (typeof price === "number") return price;
  const num = parseInt(String(price || "0").replace(/[^\d]/g, ""), 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Detects price searches like "under 999", "below ₹1,999", "< 1000" and
 * returns the max price plus whatever text is left ("kettle under 999" →
 * { maxPrice: 999, text: "kettle" }).
 */
export function parsePriceQuery(query: string): { maxPrice: number | null; text: string } {
  const clean = String(query || "")
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/₹/g, "");
  const pattern = /(?:under|below|less than|within|upto|up to|<=|<)\s*(?:rs\.?|inr)?\s*(\d+)/i;
  const match = clean.match(pattern);
  if (!match) return { maxPrice: null, text: clean.trim() };
  return {
    maxPrice: parseInt(match[1] ?? "0", 10),
    text: clean.replace(match[0], " ").replace(/\s+/g, " ").trim(),
  };
}

/**
 * Relevance score of a product for the given search words (0 = no match).
 * Every word must appear somewhere; title hits outrank brand/category/tag
 * hits, which outrank description hits.
 */
function scoreProduct(p: Product, words: string[]): number {
  const title = normalize(p.title);
  const meta = normalize([p.shop, p.category, ...(p.tags || [])].join(" "));
  const description = normalize(p.description);

  let score = 0;
  for (const word of words) {
    if (title.startsWith(word)) score += 12;
    else if (new RegExp(`(^|\\s)${word}`).test(title)) score += 9;
    else if (title.includes(word)) score += 6;
    else if (meta.includes(word)) score += 4;
    else if (description.includes(word)) score += 1;
    else return 0;
  }
  return score;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Filters and ranks products for a free-text query. Supports price phrases
 * ("under 999") alone or combined with keywords.
 */
export function searchProducts(products: Product[], query: string, limit?: number): Product[] {
  const { maxPrice, text } = parsePriceQuery(query);
  const words = normalize(text).split(" ").filter(Boolean).map(escapeRegExp);

  if (maxPrice === null && words.length === 0) return limit ? products.slice(0, limit) : products;

  const ranked: { product: Product; score: number }[] = [];
  for (const product of products) {
    if (maxPrice !== null && parsePrice(product.price) > maxPrice) continue;
    const score = words.length ? scoreProduct(product, words) : 1;
    if (score > 0) ranked.push({ product, score });
  }

  // Stable sort keeps the catalog's own order (newest first) among equal scores.
  ranked.sort((a, b) => b.score - a.score);
  const result = ranked.map((r) => r.product);
  return limit ? result.slice(0, limit) : result;
}

// ============================================================================
// FaasBay Commerce OS — OpenAI & ChatGPT Intelligence Engine
// ============================================================================

export interface AIGeneratedProduct {
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  features: string[];
  focusKeyword: string;
  suggestedPrice?: number;
}

export function getOpenAIApiKey(): string {
  return typeof window !== "undefined"
    ? localStorage.getItem("faasbay_openai_api_key") || ""
    : "";
}

export function setOpenAIApiKey(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("faasbay_openai_api_key", key.trim());
  }
}

export function getOpenAIModel(): string {
  return typeof window !== "undefined"
    ? localStorage.getItem("faasbay_openai_model") || "gpt-4o-mini"
    : "gpt-4o-mini";
}

export function setOpenAIModel(model: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("faasbay_openai_model", model);
  }
}

// Test OpenAI API Key Connection
export async function testOpenAIConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.startsWith("sk-")) {
    return { success: false, message: "Invalid API key format. Key must start with 'sk-'." };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (res.ok) {
      return { success: true, message: "Connected successfully! ChatGPT API is active and ready." };
    } else {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        message: err.error?.message || `API error (${res.status}): Please verify your OpenAI key.`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Network error while connecting to OpenAI API.",
    };
  }
}

// Intelligent Fallback Generator when no key is set or offline
function fallbackSmartGenerator(keyword: string, brand: string, category: string): AIGeneratedProduct {
  const cleanKw = keyword.trim() || "Premium Lifestyle Product";
  const b = brand || "FaasBay Collection";
  
  const title = `${cleanKw.replace(/\b\w/g, (c) => c.toUpperCase())} — ${b}`;
  const slug = cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const withBrand = `${cleanKw} | ${b}`;
  const metaTitle = withBrand.length <= 60 ? withBrand : (cleanKw.length <= 60 ? cleanKw : `${cleanKw.slice(0, 57)}...`);
  const metaDesc = `Buy authentic ${cleanKw} online at best price with express shipping, easy returns and Cash on Delivery on FaasBay Store India.`.slice(0, 160);
  const description = `Elevate your lifestyle with the all-new ${cleanKw} from ${b}. Crafted with premium quality materials, thoughtful design, and durable performance for everyday excellence. Enjoy fast express delivery across India and hassle-free returns on FaasBay.`;
  
  return {
    title,
    description,
    metaTitle,
    metaDescription,
    slug,
    features: ["Premium Grade Materials", "100% Authentic Quality", "Fast Express Shipping", "Easy 7-Day Returns"],
    focusKeyword: cleanKw.toLowerCase(),
  };
}

// Generate Full Product & SEO Details via ChatGPT API
export async function generateProductWithAI(params: {
  keyword: string;
  brand?: string;
  category?: string;
  currentTitle?: string;
}): Promise<AIGeneratedProduct> {
  const apiKey = getOpenAIApiKey();
  const model = getOpenAIModel();
  const brand = params.brand || "FaasBay Tech";
  const category = params.category || "Smart Gadgets & Electronics";

  if (!apiKey) {
    // Return intelligent built-in generator
    return fallbackSmartGenerator(params.keyword || params.currentTitle || "Smart Gadget", brand, category);
  }

  try {
    const prompt = `You are a world-class eCommerce SEO Copywriter for FaasBay Store India.
Given the product keyword/topic: "${params.keyword || params.currentTitle}"
Brand: "${brand}"
Category: "${category}"

Generate high-converting eCommerce product copy and SEO metadata strictly in JSON format with the following keys:
{
  "title": "Compelling, punchy product title under 60 chars",
  "description": "Engaging, professional 2-3 paragraph product description highlighting key benefits, specs, warranty, and fast shipping",
  "metaTitle": "SEO Meta Title under 60 characters formatted for Google search with brand",
  "metaDescription": "SEO Meta Description between 120-155 characters with call to action",
  "slug": "url-friendly-lowercase-hyphenated-slug",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "focusKeyword": "main target search keyword"
}
Output only valid JSON without markdown wrapping.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional eCommerce product and SEO copywriter. Always output valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.warn("OpenAI API failed, falling back to smart template generator.");
      return fallbackSmartGenerator(params.keyword || params.currentTitle || "Smart Gadget", brand, category);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const cleanJsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJsonStr);

    return {
      title: parsed.title || `${params.keyword} — ${brand}`,
      description: parsed.description || "",
      metaTitle: (parsed.metaTitle || parsed.title).slice(0, 60),
      metaDescription: (parsed.metaDescription || parsed.description).slice(0, 160),
      slug: (parsed.slug || params.keyword).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      features: Array.isArray(parsed.features) ? parsed.features : ["High Performance", "Official Warranty"],
      focusKeyword: parsed.focusKeyword || params.keyword,
    };
  } catch (error) {
    console.warn("Error calling OpenAI, using smart fallback:", error);
    return fallbackSmartGenerator(params.keyword || params.currentTitle || "Smart Gadget", brand, category);
  }
}

// ── AI Customer Reviews Generator ──────────────────────────────────────────

export interface AIGeneratedReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  userPhoto?: string;
  images?: string[];
  helpfulCount?: number;
}

const fallbackCustomerProfiles = [
  {
    name: "Arjun Das",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    date: "2 days ago",
    comment: (title: string) =>
      `Hands down the best purchase I made this month! The quality of this ${title} exceeded my expectations. Unboxing experience was top tier and delivery reached Kochi in just 2 days.`,
    photo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Sneha Pillai",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    date: "Yesterday",
    comment: (title: string) =>
      `Super sleek finish and works like a charm! Build materials feel very premium and battery backup is easily 2x better than my previous device. Definitely worth every rupee!`,
    photo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Vikram Patel",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    date: "4 days ago",
    comment: (title: string) =>
      `10/10 recommendation for anyone looking for authentic quality. Connected seamlessly out of the box. Packaging was super secure with tamper-evident seal.`,
    photo: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Ananya Iyer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    date: "1 week ago",
    comment: (title: string) =>
      `Loved the aesthetic! Fits right into my desk setup and looks very minimal. Customer support also answered my warranty query within 10 minutes on WhatsApp.`,
    photo: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Rahul Sharma",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    date: "3 days ago",
    comment: (title: string) =>
      `Crisp performance and solid in-hand feel. Tested it rigorously over the weekend, zero heating or lag issues. Legit product on FaasBay!`,
    photo: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80",
  },
];

export async function generateReviewsWithAI(params: {
  productTitle: string;
  category?: string;
  count?: number;
  includePhotos?: boolean;
}): Promise<AIGeneratedReview[]> {
  const count = params.count || 3;
  const apiKey = getOpenAIApiKey();
  const model = getOpenAIModel();
  const title = params.productTitle || "Smart Gadget";

  // If OpenAI key is available, generate realistic, dynamic context-aware reviews
  if (apiKey) {
    try {
      const prompt = `You are generating ${count} authentic, positive, high-converting customer reviews for an Indian e-commerce store (FaasBay).
Product: "${title}"
Category: "${params.category || "Electronics"}"

Generate an array of JSON objects strictly matching this structure:
[
  {
    "author": "Indian Customer Full Name",
    "rating": 5,
    "date": "relative time like '2 days ago' or 'Yesterday'",
    "comment": "Realistic, natural 2-3 sentence review praising build quality, packaging, delivery speed, and real-world performance.",
    "verified": true,
    "helpfulCount": 12
  }
]
Output ONLY the raw JSON array.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [
            { role: "system", content: "You generate authentic customer reviews in JSON array format." },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed: any[] = JSON.parse(cleanJson);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => {
            const profile = fallbackCustomerProfiles[idx % fallbackCustomerProfiles.length];
            return {
              id: `rev-ai-${Date.now()}-${idx + 1}`,
              author: item.author || profile.name,
              rating: Number(item.rating) || 5,
              date: item.date || profile.date,
              comment: item.comment || profile.comment(title),
              verified: item.verified ?? true,
              userPhoto: profile.avatar,
              images: params.includePhotos ? [profile.photo] : [],
              helpfulCount: item.helpfulCount || Math.floor(Math.random() * 15) + 3,
            };
          });
        }
      }
    } catch (e) {
      console.warn("OpenAI review generation fallback:", e);
    }
  }

  // Smart curated fallback with authentic buyer personas & photos
  const selectedProfiles = [...fallbackCustomerProfiles]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);

  return selectedProfiles.map((p, idx) => ({
    id: `rev-gen-${Date.now()}-${idx + 1}`,
    author: p.name,
    rating: idx === 2 ? 4 : 5,
    date: p.date,
    comment: p.comment(title),
    verified: true,
    userPhoto: p.avatar,
    images: params.includePhotos ?? true ? [p.photo] : [],
    helpfulCount: Math.floor(Math.random() * 20) + 4,
  }));
}


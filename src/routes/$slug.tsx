import React from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useStorefrontCms } from "@/lib/storefront-cms";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { MobileTabBar } from "@/components/store/MobileTabBar";
import {
  ShieldCheck,
  FileText,
  HelpCircle,
  Clock,
  ChevronRight,
  ArrowLeft,
  Lock,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/$slug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} | FaasBay Official Store`,
      },
      {
        name: "description",
        content: `Read the official ${params.slug.replace(/-/g, " ")} for FaasBay Direct Store.`,
      },
    ],
  }),
  component: CustomPageComponent,
});

function CustomPageComponent() {
  const { slug } = useParams({ from: "/$slug" });
  const { pagesList } = useStorefrontCms();

  const normalizedSlug = (slug || "").toLowerCase().trim();

  // Find page by slug or common aliases
  const page = React.useMemo(() => {
    if (!pagesList || pagesList.length === 0) return null;

    // 1. Direct slug match
    const direct = pagesList.find(
      (p) => p.slug.toLowerCase() === normalizedSlug || p.id.toLowerCase() === normalizedSlug
    );
    if (direct) return direct;

    // 2. Alias mapping
    const aliasMap: Record<string, string> = {
      privacy: "privacy-policy",
      terms: "terms-of-service",
      refund: "refund-policy",
      returns: "refund-policy",
      shipping: "shipping-policy",
      delivery: "shipping-policy",
      about: "about-us",
      contact: "contact-us",
    };

    const targetSlug = aliasMap[normalizedSlug];
    if (targetSlug) {
      return pagesList.find((p) => p.slug.toLowerCase() === targetSlug || p.id.toLowerCase() === targetSlug);
    }

    return null;
  }, [pagesList, normalizedSlug]);

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            The requested page <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">/{slug}</span> does not exist or has not been published yet.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold transition-transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Store
            </Link>
          </div>
        </main>
        <Footer />
        <MobileTabBar />
      </div>
    );
  }

  const isLegal = page.type === "legal";
  const isFaq = page.type === "faq";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-neutral-900 selection:text-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="capitalize">{page.type || "Page"}</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-xs">
            {page.title}
          </span>
        </nav>

        {/* Page Hero Header */}
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-xs relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                isLegal
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                  : isFaq
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                  : "bg-neutral-500/10 text-neutral-700 dark:text-neutral-300 border border-neutral-500/20"
              }`}
            >
              {isLegal ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Official Legal Policy
                </>
              ) : isFaq ? (
                <>
                  <HelpCircle className="w-3.5 h-3.5" /> FAQ & Help
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" /> Storefront Page
                </>
              )}
            </span>

            {page.status === "Published" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active & Enforced
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-foreground">
            {page.title}
          </h1>

          {page.lastUpdated && (
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Last updated on {page.lastUpdated}</span>
              {page.updatedBy && <span>• Maintained by {page.updatedBy}</span>}
            </div>
          )}
        </div>

        {/* Page Content Body */}
        <div className="bg-surface rounded-3xl border border-border p-6 sm:p-10 shadow-xs space-y-6">
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line font-normal">
            {page.content}
          </div>

          {/* Guarantee / Security Trust Footer */}
          {isLegal && (
            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-surface border border-border text-foreground">
                  <Lock className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">FaasBay Consumer Protection</h4>
                  <p className="text-[11px] text-muted-foreground">
                    All policies comply with standard consumer rights & encrypted data governance.
                  </p>
                </div>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface hover:bg-muted text-xs font-semibold text-foreground transition-colors"
              >
                Back to Shopping <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileTabBar />
    </div>
  );
}

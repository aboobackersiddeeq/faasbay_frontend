import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "../hooks/use-cart";
import { CartDrawer } from "../components/store/CartDrawer";
import { CheckoutModal } from "../components/store/CheckoutModal";
import { ProductDetailModal } from "../components/store/ProductDetailModal";
import { ExitIntentReminder } from "../components/store/ExitIntentReminder";
import { AuthModal } from "../components/store/AuthModal";
import { Toaster } from "../components/ui/sonner";

// Absolute site origin for canonical/OG tags. Update VITE_SITE_URL once a
// custom domain replaces the Netlify subdomain — no other code change needed.
const SITE_URL: string =
  (import.meta.env["VITE_SITE_URL"] as string)?.replace(/\/$/, "") || "https://faasbay.netlify.app";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const isAdminRoute = router.state.location.pathname.startsWith("/llp") ||
    router.state.location.pathname.startsWith("/admin");
  const homeHref = isAdminRoute ? "/llp" : "/";
  const homeLabel = isAdminRoute ? "Go to Dashboard" : "Go home";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href={homeHref}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {homeLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FaasBay — to cart... to life..." },
      {
        name: "description",
        content:
          "Official FaasBay Direct Store — Premium wireless audio, mechanical keyboards, titanium wearables, and precision tech gear. Warehoused directly with fast shipping.",
      },
      { name: "theme-color", content: "#2b4053" },
      { name: "apple-mobile-web-app-title", content: "FaasBay" },
      { property: "og:title", content: "FaasBay — to cart... to life..." },
      {
        property: "og:description",
        content: "FaasBay — Official direct-to-consumer store for precision gadgets, studio acoustics, and smart lifestyle tech.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FaasBay" },
      { property: "og:image", content: `${SITE_URL}/og-image.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "FaasBay — to cart... to life..." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FaasBay — to cart... to life..." },
      {
        name: "twitter:description",
        content: "FaasBay — Official direct-to-consumer store for precision gadgets, studio acoustics, and smart lifestyle tech.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png` },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        
        {/* Global Interactive Overlays */}
        <Toaster position="top-right" richColors />
        <CartDrawer />
        <CheckoutModal />
        <ProductDetailModal />
        <ExitIntentReminder />
        <AuthModal />
      </CartProvider>
    </QueryClientProvider>
  );
}

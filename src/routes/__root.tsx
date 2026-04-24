import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchSettings } from "@/lib/queries";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <span className="micro-label">Error 404</span>
        <h1 className="mt-4 text-7xl font-display font-black uppercase tracking-editorial">
          Lost in the <span className="accent-font italic font-normal text-primary lowercase">frame</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Layout />
      <Toaster theme="dark" position="bottom-right" richColors />
    </QueryClientProvider>
  );
}

function Layout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSettings,
    staleTime: 60_000,
  });

  const dynamicStyles = (
    <style>
      {`
        :root {
          ${settings?.primary_color ? `--primary: ${settings.primary_color} !important;` : ""}
          ${settings?.accent_color ? `--accent: ${settings.accent_color} !important;` : ""}
          ${settings?.primary_color ? `--ring: ${settings.primary_color} !important;` : ""}
        }
      `}
    </style>
  );

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        {dynamicStyles}
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <div className="noise" aria-hidden />
      {dynamicStyles}
      <SiteNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter settings={settings ?? null} />
    </div>
  );
}

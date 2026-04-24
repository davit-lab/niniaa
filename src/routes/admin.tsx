import { createFileRoute, useNavigate, useLocation, Link, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut, LayoutDashboard, Image, Briefcase, Mail, Settings as SettingsIcon, Sparkles, MessageSquareQuote } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Nino Khikhidze" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginRoute = location.pathname === "/admin/login";

  useEffect(() => {
    if (loading) return;
    if (isLoginRoute) {
      // If already authenticated admin lands on login page, send to dashboard
      if (user && isAdmin) navigate({ to: "/admin" });
      return;
    }
    if (!user) navigate({ to: "/admin/login" });
    else if (!isAdmin) navigate({ to: "/admin/login" });
  }, [user, isAdmin, loading, isLoginRoute, navigate]);

  if (isLoginRoute) return <Outlet />;

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const links: { to: "/admin" | "/admin/projects" | "/admin/services" | "/admin/shots" | "/admin/reviews" | "/admin/bookings" | "/admin/settings"; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
    { to: "/admin", label: "მთავარი", icon: LayoutDashboard, exact: true },
    { to: "/admin/projects", label: "პროექტები", icon: Briefcase },
    { to: "/admin/services", label: "სერვისები", icon: Sparkles },
    { to: "/admin/shots", label: "კადრები", icon: Image },
    { to: "/admin/reviews", label: "მიმოხილვები", icon: MessageSquareQuote },
    { to: "/admin/bookings", label: "ჯავშნები", icon: Mail },
    { to: "/admin/settings", label: "პარამეტრები", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r border-border p-6 flex flex-col gap-1.5 sticky top-0 h-screen">
        <Link to="/" className="font-display font-bold uppercase tracking-tight mb-8 text-lg">
          Nino<span className="accent-font italic font-normal text-primary lowercase ml-1">admin</span>
        </Link>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeProps={{ className: "bg-secondary text-foreground" }}
            activeOptions={{ exact: l.exact }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <l.icon size={16} /> {l.label}
          </Link>
        ))}
        <button
          onClick={async () => { await signOut(auth); navigate({ to: "/admin/login" }); }}
          className="mt-auto flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut size={16} /> გასვლა
        </button>
      </aside>
      <main className="flex-1 p-10 overflow-auto"><Outlet /></main>
    </div>
  );
}

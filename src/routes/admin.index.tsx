import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { Briefcase, Sparkles, Image, MessageSquareQuote, Mail, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, s, sh, r, b, bn] = await Promise.all([
        getCountFromServer(collection(db, "projects")),
        getCountFromServer(collection(db, "services")),
        getCountFromServer(collection(db, "shots")),
        getCountFromServer(collection(db, "reviews")),
        getCountFromServer(collection(db, "bookings")),
        getCountFromServer(query(collection(db, "bookings"), where("status", "==", "new"))),
      ]);
      return {
        projects: p.data().count, 
        services: s.data().count, 
        shots: sh.data().count,
        reviews: r.data().count, 
        bookings: b.data().count, 
        newBookings: bn.data().count,
      };
    },
  });

  const cards: { to: "/admin/projects" | "/admin/services" | "/admin/shots" | "/admin/reviews" | "/admin/bookings"; label: string; v: number; icon: typeof Briefcase; badge?: string }[] = [
    { to: "/admin/projects", label: "პროექტები", v: stats?.projects ?? 0, icon: Briefcase },
    { to: "/admin/services", label: "სერვისები", v: stats?.services ?? 0, icon: Sparkles },
    { to: "/admin/shots", label: "კადრები", v: stats?.shots ?? 0, icon: Image },
    { to: "/admin/reviews", label: "მიმოხილვები", v: stats?.reviews ?? 0, icon: MessageSquareQuote },
    { to: "/admin/bookings", label: "ჯავშნები", v: stats?.bookings ?? 0, icon: Mail, badge: stats?.newBookings ? `${stats.newBookings} ახალი` : undefined },
  ];

  return (
    <div>
      <span className="micro-label">მიმოხილვა</span>
      <h1 className="mt-3 text-5xl font-display font-black uppercase tracking-editorial mb-12">დაფა</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Link
            key={c.to} to={c.to}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition relative"
          >
            <div className="flex items-start justify-between">
              <c.icon size={20} className="text-primary" />
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-primary transition" />
            </div>
            <div className="mt-6 text-4xl font-display font-black">{c.v}</div>
            <div className="mt-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">{c.label}</div>
            {c.badge && (
              <span className="absolute top-3 right-10 text-[10px] font-mono uppercase bg-primary/20 text-primary px-2 py-0.5 rounded-full">{c.badge}</span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-16 p-6 rounded-2xl bg-card border border-border max-w-2xl">
        <h3 className="font-display font-bold uppercase text-sm tracking-wider">სწრაფი მითითება</h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          ყველა კონტენტი (პროექტები, ფოტოები, სერვისები, რევიუები, საიტის ტექსტები) მართვადია მენიუდან. ფოტოების ასატვირთად უბრალოდ დააჭირეთ "ატვირთე ფოტო" ნებისმიერ ფორმაში.
        </p>
      </div>
    </div>
  );
}

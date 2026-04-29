import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fetchProjects } from "@/lib/queries";

export const Route = createFileRoute("/portfolio/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Nino Khikhadze" },
      { name: "description", content: "Selected photography projects by Nino Khikhadze." },
      { property: "og:title", content: "Portfolio — Nino Khikhadze" },
      { property: "og:description", content: "Selected photography projects." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  return (
    <div className="pt-32 md:pt-48 pb-32">
      <div className="max-w-[1800px] mx-auto px-5 md:px-10">
        <header className="mb-20 md:mb-32">
          <span className="micro-label">ყველა ნამუშევარი / 2024 — დღემდე</span>
          <h1 className="mt-6 text-6xl md:text-[12vw] font-display font-black uppercase leading-[0.8] tracking-editorial">
            პორტფო <span className="accent-font italic font-normal text-primary lowercase">ლიო</span>
          </h1>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 2) * 0.1, duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                className={i % 2 === 1 ? "md:mt-32" : ""}
              >
                <Link to="/portfolio/$slug" params={{ slug: p.slug }} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-card">
                    <img
                      src={p.cover_image}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110 grain-img"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <div className="absolute top-5 left-5 micro-label glass px-3 py-1.5 rounded-full">
                      {p.category}
                    </div>
                    <div className="absolute top-5 right-5 w-12 h-12 rounded-full glass flex items-center justify-center transition-transform group-hover:rotate-45">
                      <ArrowUpRight size={18} />
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-foreground">
                        {p.title}
                      </h3>
                      {p.date_label && (
                        <p className="mt-2 text-xs font-mono uppercase tracking-wider text-foreground/70">
                          {p.date_label}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            ჯერ არცერთი პროექტი არ დაგვიმატებია.
          </div>
        )}
      </div>
    </div>
  );
}

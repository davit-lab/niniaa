import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fetchServices } from "@/lib/queries";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "სერვისები — ნინო ხიხაძე" },
      { name: "description", content: "სერვისები და ფასები - ნინო ხიხაძეს ფოტოგრაფიული სტუდია." },
    ],
  }),
  component: ServicesListPage,
});

function ServicesListPage() {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  return (
    <div className="pt-32 md:pt-48 pb-32">
      <div className="max-w-[1800px] mx-auto px-5 md:px-10">
        <header className="mb-20 md:mb-32">
          <span className="micro-label">ჩემი მომსახურება / 2024</span>
          <h1 className="mt-6 text-6xl md:text-[12vw] font-display font-black uppercase leading-[0.8] tracking-editorial">
            სერვის <span className="accent-font italic font-normal text-primary lowercase">ები</span>
          </h1>
        </header>

        {isLoading ? (
          <div className="grid gap-4">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="h-32 rounded-3xl bg-card animate-pulse" />
             ))}
          </div>
        ) : (
          <div className="border-t border-border mt-12">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link
                  to="/services/$id"
                  params={{ id: s.id }}
                  className="group flex items-center gap-6 py-8 md:py-12 border-b border-border hover:bg-secondary/30 transition-colors px-2 md:px-10"
                >
                  <span className="font-mono text-xs text-primary font-bold w-12 shrink-0">[0{i + 1}]</span>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-10">
                    <h3 className="text-3xl md:text-6xl font-display font-bold uppercase tracking-tight transition-all group-hover:text-primary group-hover:italic group-hover:accent-font group-hover:font-normal">
                      {s.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] md:text-xs font-mono uppercase tracking-wider text-muted-foreground border border-border rounded-full px-3 py-1 bg-background"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-border flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-smooth">
                    <ArrowUpRight size={20} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

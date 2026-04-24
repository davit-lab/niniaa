import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchShots } from "@/lib/queries";

export const Route = createFileRoute("/shots")({
  head: () => ({
    meta: [
      { title: "Archive — Nino Khikhidze" },
      { name: "description", content: "Full photography archive — selected shots by Nino Khikhidze." },
      { property: "og:title", content: "Archive — Nino Khikhidze" },
      { property: "og:description", content: "Full photography archive." },
    ],
  }),
  component: ShotsPage,
});

function ShotsPage() {
  const { data: shots = [], isLoading } = useQuery({
    queryKey: ["shots"],
    queryFn: () => fetchShots(),
  });

  return (
    <div className="pt-32 md:pt-48 pb-32">
      <div className="max-w-[1800px] mx-auto px-5 md:px-10">
        <header className="mb-16 md:mb-24">
          <span className="micro-label">ვიზუალური დღიური</span>
          <h1 className="mt-6 text-6xl md:text-[12vw] font-display font-black uppercase leading-[0.8] tracking-editorial">
            არ <span className="accent-font italic font-normal text-primary lowercase">ქივი</span>
          </h1>
          <p className="mt-6 max-w-xl text-muted-foreground text-lg">
            ულიმიტო კადრების კოლექცია — დღევანდელი მომენტებიდან ექსპერიმენტულ ედიტორიალამდე.
          </p>
        </header>

        {isLoading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="mb-4 md:mb-6 aspect-[3/4] rounded-2xl bg-card animate-pulse break-inside-avoid" />
            ))}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 [&>*]:mb-4 md:[&>*]:mb-6">
            {shots.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 6) * 0.05, duration: 0.7 }}
                viewport={{ once: true, margin: "-50px" }}
                className="break-inside-avoid overflow-hidden rounded-2xl bg-card group cursor-pointer"
              >
                <img
                  src={s.url}
                  alt={s.caption ?? "Photography shot"}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-[1200ms] group-hover:scale-105 grain-img"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { fetchServiceById } from "@/lib/queries";

export const Route = createFileRoute("/services/$id")({
  loader: async ({ params, context: { queryClient } }) => {
    const service = await queryClient.ensureQueryData({
      queryKey: ["service", params.id],
      queryFn: () => fetchServiceById(params.id),
    });
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.service.title} — ნინო ხიხაძე` },
          { name: "description", content: loaderData.service.description ?? loaderData.service.title },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <span className="micro-label">404</span>
      <h1 className="mt-4 text-5xl font-display font-black uppercase">სერვისი ვერ მოიძებნა</h1>
      <Link to="/services" className="mt-8 text-primary underline">ყველა სერვისი</Link>
    </div>
  ),
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const params = Route.useParams();
  const { data: service } = useQuery({
    queryKey: ["service", params.id],
    queryFn: () => fetchServiceById(params.id),
  });
  if (!service) return null;

  return (
    <article className="pt-32 md:pt-40 pb-32">
      <div className="max-w-[1800px] mx-auto px-5 md:px-10">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft size={14} /> ყველა სერვისი
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7">
            <header className="mb-12">
              <div className="flex flex-wrap gap-2 mb-6">
                {service.tags.map((t) => (
                  <span key={t} className="micro-label bg-secondary/50 px-3 py-1.5 rounded-full">{t}</span>
                ))}
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl font-display font-black uppercase leading-[0.85] tracking-editorial"
              >
                {service.title}
              </motion.h1>
            </header>

            {service.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-[16/10] rounded-3xl overflow-hidden bg-card mb-12 shadow-2xl"
              >
                <img src={service.image} alt={service.title} className="w-full h-full object-cover grain-img" />
              </motion.div>
            )}

            {service.description && (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed font-light italic">
                  {service.description}
                </p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
            <div className="p-8 md:p-10 rounded-3xl bg-card border border-border border-t-primary/20 flex flex-col gap-8 shadow-xl">
              <div>
                <h3 className="text-2xl font-display font-bold uppercase mb-2 text-primary tracking-tight">დაინტერესდით?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  დაჯავშნეთ სერვისი ან მიიღეთ კონსულტაცია.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-background border border-border/50">
                  <div className="micro-label opacity-60 mb-1">სერვისი</div>
                  <div className="font-display font-bold text-lg uppercase">{service.title}</div>
                </div>
                
                <Link
                  to="/contact"
                  search={{ service: service.title }}
                  className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-primary text-primary-foreground px-8 py-5 text-base font-semibold uppercase tracking-wider hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
                >
                  დაჯავშნა
                  <Send size={18} />
                </Link>
              </div>

              <p className="text-[10px] uppercase font-mono tracking-widest text-center opacity-40">
                Independent Photography Studio / 2024
              </p>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

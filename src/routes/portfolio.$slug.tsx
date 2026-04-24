import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { fetchProjectBySlug } from "@/lib/queries";

export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ params, context: { queryClient } }) => {
    const project = await queryClient.ensureQueryData({
      queryKey: ["project", params.slug],
      queryFn: () => fetchProjectBySlug(params.slug),
    });
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.title} — Nino Khikhidze` },
          { name: "description", content: loaderData.project.description ?? loaderData.project.category },
          { property: "og:title", content: loaderData.project.title },
          { property: "og:description", content: loaderData.project.description ?? loaderData.project.category },
          { property: "og:image", content: loaderData.project.cover_image },
          { name: "twitter:image", content: loaderData.project.cover_image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <span className="micro-label">404</span>
      <h1 className="mt-4 text-5xl font-display font-black uppercase">პროექტი ვერ მოიძებნა</h1>
      <Link to="/portfolio" className="mt-8 text-primary underline">დაბრუნება პორტფოლიოში</Link>
    </div>
  ),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const params = Route.useParams();
  const { data } = useQuery({
    queryKey: ["project", params.slug],
    queryFn: () => fetchProjectBySlug(params.slug),
  });
  if (!data) return null;

  const gallery = data.gallery && data.gallery.length > 0 ? data.gallery : [data.cover_image];

  return (
    <article className="pt-32 md:pt-40 pb-32">
      <div className="max-w-[1800px] mx-auto px-5 md:px-10">
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft size={14} /> ყველა პროექტი
        </Link>

        <header className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-8">
            <span className="micro-label">{data.category}</span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-5xl md:text-8xl font-display font-black uppercase leading-[0.85] tracking-editorial"
            >
              {data.title}
            </motion.h1>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-4 lg:items-end lg:text-right">
            {data.date_label && (
              <div>
                <div className="micro-label opacity-60">თარიღი</div>
                <div className="mt-2 font-display font-bold uppercase">{data.date_label}</div>
              </div>
            )}
            <div>
              <div className="micro-label opacity-60">კატეგორია</div>
              <div className="mt-2 font-display font-bold uppercase">{data.category}</div>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-card mb-16"
        >
          <img src={data.cover_image} alt={data.title} className="w-full h-full object-cover grain-img" />
        </motion.div>

        {data.description && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20 max-w-[1400px]">
            <div className="lg:col-span-4">
              <span className="micro-label">პროექტის შესახებ</span>
            </div>
            <p className="lg:col-span-8 text-xl md:text-2xl text-foreground/85 leading-relaxed">
              {data.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {gallery.map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 2) * 0.1, duration: 0.8 }}
              viewport={{ once: true, margin: "-50px" }}
              className={`aspect-[4/5] overflow-hidden rounded-3xl bg-card ${i % 3 === 0 ? "md:col-span-2 md:aspect-[16/9]" : ""}`}
            >
              <img src={url} alt={`${data.title} ${i + 1}`} loading="lazy"
                   className="w-full h-full object-cover grain-img" />
            </motion.div>
          ))}
        </div>

        <div className="mt-24 flex justify-center">
          <Link
            to="/portfolio"
            className="group inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth"
          >
            სხვა პროექტები
            <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
          </Link>
        </div>
      </div>
    </article>
  );
}

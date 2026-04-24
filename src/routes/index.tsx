import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Camera, Image as ImgIcon, Layers, Zap, Star } from "lucide-react";
import {
  fetchProjects,
  fetchServices,
  fetchShots,
  fetchReviews,
  fetchSettings,
} from "@/lib/queries";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nino Khikhidze — Independent Photography Studio" },
      {
        name: "description",
        content:
          "Editorial, portrait, family, brand & event photography from Tbilisi. Cinematic visuals by Nino Khikhidze.",
      },
      { property: "og:title", content: "Nino Khikhidze — Independent Photography Studio" },
      {
        property: "og:description",
        content: "Cinematic editorial photography from Tbilisi.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const { data: settings } = useQuery({ queryKey: ["site-settings"], queryFn: fetchSettings });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const { data: shots = [] } = useQuery({ queryKey: ["shots", 24], queryFn: () => fetchShots(24) });
  const { data: reviews = [] } = useQuery({ queryKey: ["reviews"], queryFn: fetchReviews });

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* HERO */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] w-full overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <img
            src={(settings?.hero_image && settings.hero_image.startsWith('http')) ? settings.hero_image : heroImg}
            alt="Cinematic portrait by Nino Khikhidze"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
            onError={(e) => {
              (e.target as HTMLImageElement).src = heroImg;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/50" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 h-full max-w-[1800px] mx-auto px-5 md:px-10 flex flex-col justify-end pb-16 md:pb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="micro-label flex items-center gap-4"
          >
            <div className="w-12 h-px bg-primary" />
            <span>Independent Photography Studio / EST. 2024</span>
          </motion.div>

          <div className="flex flex-col mt-8">
            <motion.h1
              initial={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[18vw] lg:text-[14vw] font-display font-black leading-[0.78] tracking-[-0.06em] uppercase text-foreground"
            >
              {settings?.hero_title_part1 || "NINO"}
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, x: 60, filter: "blur(12px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.85, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[18vw] lg:text-[14vw] accent-font italic lowercase leading-[0.78] tracking-[-0.04em] text-primary md:-mt-10 self-end pr-[2vw]"
            >
              {settings?.hero_title_part2 || "Khikhidze"}
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="flex flex-col lg:flex-row items-end justify-between border-t border-foreground/10 pt-8 mt-12 gap-8"
          >
            <p className="max-w-md accent-font italic text-foreground/70 text-lg md:text-xl leading-snug">
              "{settings?.hero_quote ?? "ფოტოგრაფია ჩემთვის წამიერი ემოციაა, რომელიც სამუდამოდ რჩება."}"
            </p>
            <div className="flex gap-12 md:gap-20">
              <div>
                <div className="micro-label opacity-60">ლოკაცია</div>
                <div className="mt-2 font-display font-bold uppercase text-lg md:text-xl">
                  {settings?.contact_location || "თბილისი, საქართველო"}
                </div>
              </div>
              <div>
                <div className="micro-label opacity-60">დაარსდა</div>
                <div className="mt-2 font-display font-bold uppercase text-lg md:text-xl">2024</div>
              </div>
              <div className="hidden md:block">
                <div className="micro-label opacity-60">კადრი</div>
                <div className="mt-2 font-display font-bold uppercase text-lg md:text-xl">50K+</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* PHILOSOPHY */}
      <section className="px-5 md:px-10 py-32 md:py-48">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="lg:sticky lg:top-32 flex flex-col gap-8">
            <span className="micro-label">01 / ფილოსოფია</span>
            <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-editorial leading-[0.85]">
              ავთენტურობის <br />
              <span className="accent-font italic font-normal text-primary lowercase">ხელოვნება</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-snug max-w-lg">
              ვქმნი ვიზუალურ ისტორიებს, რომლებიც დროის გამოცდას უძლებენ — სუფთა ემოციები, კინემატოგრაფიული შუქი, ნამდვილი მომენტები.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: Camera, t: "Pure Optics", d: "უმაღლესი ხარისხის ტექნიკა — სუფთა, მკაფიო კადრი." },
              { icon: Zap, t: "Fast Delivery", d: "სწრაფი დამუშავება ავთენტურობის შენარჩუნებით." },
              { icon: Layers, t: "Creative Edit", d: "უნიკალური ფერის გრეიდინგი და ხედვა." },
              { icon: ImgIcon, t: "Large Archive", d: "50,000+ კადრი, 1000+ კმაყოფილი კლიენტი." },
            ].map((item, i) => (
              <motion.div
                key={item.t}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.7 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl border border-border bg-card flex flex-col gap-5 group hover:border-primary/40 hover:bg-secondary transition-smooth"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                  <item.icon size={20} />
                </div>
                <h4 className="text-xl font-display font-bold uppercase tracking-tight">{item.t}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="px-5 md:px-10 py-32 md:py-48 border-t border-border-subtle">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-20">
            <div>
              <span className="micro-label">02 / რჩეული ნამუშევარი</span>
              <h2 className="mt-6 text-5xl md:text-7xl font-display font-black uppercase tracking-editorial">
                რჩეული <br />
                <span className="accent-font italic font-normal text-primary lowercase">პროექტები</span>
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="group inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground hover:border-primary transition-smooth"
            >
              ყველას ნახვა
              <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {projects.slice(0, 4).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 2) * 0.1, duration: 0.9 }}
                viewport={{ once: true, margin: "-100px" }}
                className={i % 2 === 1 ? "md:mt-24" : ""}
              >
                <Link
                  to="/portfolio/$slug"
                  params={{ slug: p.slug }}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-card">
                    <img
                      src={p.cover_image}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110 grain-img"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-70" />
                    <div className="absolute top-5 left-5 micro-label bg-background/60 backdrop-blur px-3 py-1.5 rounded-full">
                      {p.category}
                    </div>
                    <div className="absolute top-5 right-5 w-12 h-12 rounded-full glass flex items-center justify-center transition-transform group-hover:rotate-45">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                  <div className="mt-6 flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                      {p.date_label && (
                        <p className="text-sm text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                          {p.date_label}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="px-5 md:px-10 py-32 md:py-48 border-t border-border-subtle">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <span className="micro-label">03 / გამოცდილება</span>
            <h2 className="mt-6 text-6xl md:text-[10vw] font-display font-black uppercase leading-[0.8] tracking-editorial">
              ჩემი <span className="accent-font italic font-normal text-primary lowercase">სერვისები</span>
            </h2>
          </div>

          <div className="border-t border-border">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="group flex items-center gap-6 py-8 border-b border-border hover:bg-secondary/30 transition-colors px-2 md:px-6"
              >
                <span className="font-mono text-xs text-primary font-bold w-10 shrink-0">[0{i + 1}]</span>
                <div className="flex-1 flex items-center justify-between gap-6">
                  <h3 className="text-2xl md:text-5xl font-display font-bold uppercase tracking-tight transition-all group-hover:text-primary group-hover:italic group-hover:accent-font group-hover:font-normal">
                    {s.title}
                  </h3>
                  <div className="hidden md:flex gap-2">
                    {s.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono uppercase tracking-wider text-muted-foreground border border-border rounded-full px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-border flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-smooth">
                  <ArrowUpRight size={18} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-card py-10 overflow-hidden border-y border-border-subtle">
        <div className="flex marquee-track gap-16 whitespace-nowrap items-center">
          {[...Array(2)].flatMap((_, k) =>
            [
              "Nino Khikhidze",
              "Editorial",
              "Portrait",
              "Brand",
              "Family",
              "Tbilisi",
              "Since 2024",
            ].map((w, i) => (
              <div key={`${k}-${i}`} className="flex items-center gap-16 shrink-0">
                <span className="text-4xl md:text-6xl font-display font-black uppercase">{w}</span>
                <span className="w-3 h-3 rounded-full bg-primary" />
              </div>
            )),
          )}
        </div>
      </section>

      {/* ARCHIVE / SHOTS PREVIEW */}
      <section className="px-5 md:px-10 py-32 md:py-48">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <span className="micro-label">04 / არქივი</span>
            <h2 className="mt-6 text-6xl md:text-[10vw] font-display font-black uppercase leading-[0.8] tracking-editorial">
              პორტფო <span className="accent-font italic font-normal text-primary lowercase">ლიო</span>
            </h2>
            <p className="mt-6 max-w-xl text-muted-foreground text-lg">
              შერჩეული ნამუშევრების კოლექცია, რომელიც ასახავს ხედვასა და ოსტატობას.
            </p>
          </div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 [&>*]:mb-4 md:[&>*]:mb-6">
            {shots.slice(0, 12).map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 4) * 0.08, duration: 0.8 }}
                viewport={{ once: true }}
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

          <div className="flex justify-center mt-16">
            <Link
              to="/shots"
              className="group inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              ყველა კადრი
              <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="px-5 md:px-10 py-32 md:py-48 bg-card border-y border-border-subtle">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <span className="micro-label">05 / მიმოხილვები</span>
              <h2 className="mt-6 text-5xl md:text-7xl font-display font-black uppercase tracking-editorial">
                კლიენტების <br />
                <span className="accent-font italic font-normal text-primary lowercase">ისტორიები</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-background border border-border flex flex-col gap-6"
              >
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, k) => (
                    <Star key={k} size={14} fill={k < Math.floor(r.rating) ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-foreground/85 leading-relaxed text-base">"{r.text}"</p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                  {r.image && (
                    <img src={r.image} alt={r.name} loading="lazy"
                         className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div>
                    <div className="text-sm font-display font-bold uppercase">{r.name}</div>
                    {r.role && <div className="text-xs text-muted-foreground">{r.role}</div>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

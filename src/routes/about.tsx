import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchSettings, fetchServices } from "@/lib/queries";
import aboutImg from "@/assets/about.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Nino Khikhidze" },
      { name: "description", content: "About Nino Khikhidze, independent photographer based in Tbilisi." },
      { property: "og:title", content: "About — Nino Khikhidze" },
      { property: "og:description", content: "About the photographer behind the lens." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: settings } = useQuery({ queryKey: ["site-settings"], queryFn: fetchSettings });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });

  return (
    <div className="pt-32 md:pt-48 pb-32">
      <div className="max-w-[1800px] mx-auto px-5 md:px-10">
        <header className="mb-20">
          <span className="micro-label">კადრს მიღმა</span>
          <h1 className="mt-6 text-6xl md:text-[12vw] font-display font-black uppercase leading-[0.8] tracking-editorial">
            ჩემს <span className="accent-font italic font-normal text-primary lowercase">შესახებ</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="lg:col-span-5 aspect-[4/5] rounded-3xl overflow-hidden bg-card"
          >
            <img
              src={aboutImg}
              alt="Nino Khikhidze"
              className="w-full h-full object-cover grain-img"
              width={1280}
              height={1600}
            />
          </motion.div>

          <div className="lg:col-span-7 lg:sticky lg:top-32 flex flex-col gap-12">
            <div>
              <span className="micro-label">ისტორია</span>
              <p className="mt-6 text-2xl md:text-3xl leading-snug text-foreground/90 accent-font italic">
                "{settings?.hero_quote ?? "ფოტოგრაფია ჩემთვის წამიერი ემოციაა, რომელიც სამუდამოდ რჩება."}"
              </p>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {settings?.about_text ??
                "ნინო ხიხიძე — დამოუკიდებელი ფოტოგრაფი თბილისიდან. 2024 წლიდან ვქმნი ვიზუალურ ისტორიებს, რომლებიც წამიერ ემოციას მარადიულ კადრად აქცევს."}
            </p>

            <div className="grid grid-cols-3 gap-6 border-t border-border pt-10">
              {[
                { n: "50K+", l: "კადრი" },
                { n: "1000+", l: "კლიენტი" },
                { n: "2024", l: "დაარსდა" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-4xl md:text-6xl font-display font-black tracking-editorial">{s.n}</div>
                  <div className="micro-label opacity-60 mt-1">{s.l}</div>
                </div>
              ))}
            </div>

            <div>
              <span className="micro-label">რას ვაკეთებ</span>
              <ul className="mt-6 space-y-2">
                {services.map((s, i) => (
                  <li key={s.id} className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight">
                    <span className="text-primary font-mono text-sm align-top mr-3">0{i + 1}</span>
                    {s.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

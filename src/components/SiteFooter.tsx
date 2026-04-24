import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, ArrowUpRight } from "lucide-react";
import type { SiteSettings } from "@/lib/firestore-queries";

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--ink)] border-t border-border-subtle px-5 md:px-10 pt-24 md:pt-40 pb-10">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7">
            <span className="micro-label">მოდი ერთად შევქმნათ</span>
            <h2 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-display font-black uppercase leading-[0.85] tracking-editorial">
              მოყევი შენი <br />
              <span className="accent-font italic font-normal text-primary lowercase">ისტორია</span> სინათლით.
            </h2>
            <Link
              to="/contact"
              className="group mt-12 inline-flex items-center gap-4 rounded-full bg-primary text-primary-foreground pl-7 pr-3 py-3 text-sm font-semibold uppercase tracking-wider"
            >
              პროექტის დაწყება
              <span className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center transition-transform group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </Link>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <span className="micro-label opacity-60">ნავიგაცია</span>
              <ul className="mt-6 space-y-3 text-sm font-medium">
                {[
                  { to: "/portfolio", l: "პორტფოლიო" },
                  { to: "/about", l: "ჩემ შესახებ" },
                  { to: "/shots", l: "არქივი" },
                  { to: "/contact", l: "კონტაქტი" },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-foreground/70 hover:text-primary transition-colors">
                      {l.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="micro-label opacity-60">კონტაქტი</span>
              <ul className="mt-6 space-y-3 text-sm font-medium text-foreground/70">
                {settings?.contact_email && <li>{settings.contact_email}</li>}
                {settings?.contact_phone && <li>{settings.contact_phone}</li>}
                <li>{settings?.contact_location ?? "თბილისი, საქართველო"}</li>
              </ul>
              <div className="flex gap-3 mt-6">
                {settings?.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noreferrer noopener"
                     className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Instagram size={16} />
                  </a>
                )}
                {settings?.facebook && (
                  <a href={settings.facebook} target="_blank" rel="noreferrer noopener"
                     className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Facebook size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-border-subtle text-xs text-foreground/40 font-mono uppercase tracking-wider">
          <span>© {year} Nino Khikhidze — ყველა უფლება დაცულია.</span>
          <span>დამოუკიდებელი ფოტო-სტუდია / EST. 2024</span>
        </div>
      </div>
    </footer>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { fetchSettings, fetchServices } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Nino Khikhidze" },
      { name: "description", content: "Book a session or get in touch with Nino Khikhidze." },
      { property: "og:title", content: "Contact — Nino Khikhidze" },
      { property: "og:description", content: "Book a session or get in touch." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useQuery({ queryKey: ["site-settings"], queryFn: fetchSettings });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });

  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("გთხოვთ შეავსოთ სახელი და ელფოსტა");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        service: form.service.trim() || null,
        message: form.message.trim() || null,
        status: 'new'
      });

      if (error) throw error;

      toast.success("მადლობა! მალე დაგიკავშირდებით.");
      setForm({ name: "", email: "", phone: "", service: "", message: "" });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("შეტყობინების გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pt-32 md:pt-48 pb-32">
      <div className="max-w-[1800px] mx-auto px-5 md:px-10">
        <header className="mb-20">
          <span className="micro-label">მოდით ვისაუბროთ</span>
          <h1 className="mt-6 text-6xl md:text-[12vw] font-display font-black uppercase leading-[0.8] tracking-editorial">
            დამიკავ <br />
            <span className="accent-font italic font-normal text-primary lowercase">შირდით</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col gap-10">
            <p className="text-xl md:text-2xl text-muted-foreground leading-snug">
              დაგვიკავშირდით ნებისმიერი პროექტისთვის — პორტრეტიდან ბრენდულ კამპანიამდე.
            </p>

            <div className="flex flex-col gap-5">
              {settings?.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="micro-label opacity-60">ელფოსტა</div>
                    <div className="mt-1 font-display font-bold">{settings.contact_email}</div>
                  </div>
                </a>
              )}
              {settings?.contact_phone && (
                <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="micro-label opacity-60">ტელეფონი</div>
                    <div className="mt-1 font-display font-bold">{settings.contact_phone}</div>
                  </div>
                </a>
              )}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-primary">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="micro-label opacity-60">მდებარეობა</div>
                  <div className="mt-1 font-display font-bold">{settings?.contact_location ?? "თბილისი, საქართველო"}</div>
                </div>
              </div>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={onSubmit}
            className="lg:col-span-7 p-8 md:p-12 rounded-3xl bg-card border border-border flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="სახელი *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
              <Field label="ელფოსტა *" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} required />
              <Field label="ტელეფონი" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
              <div className="flex flex-col gap-2">
                <label className="micro-label opacity-70">სერვისი</label>
                <select
                  value={form.service}
                  onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base focus:border-primary outline-none"
                >
                  <option value="">აირჩიეთ...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="micro-label opacity-70">შეტყობინება</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={6}
                className="bg-background border border-border rounded-xl px-4 py-3 text-base focus:border-primary outline-none resize-none"
                placeholder="მოგვიყევით თქვენი იდეის შესახებ..."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="self-start inline-flex items-center gap-3 rounded-full bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? "იგზავნება..." : "გაგზავნა"}
              <Send size={16} />
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="micro-label opacity-70">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background border border-border rounded-xl px-4 py-3 text-base focus:border-primary outline-none"
      />
    </div>
  );
}

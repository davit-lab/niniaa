import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Field, inputCls, textareaCls } from "@/components/admin/Field";
import { Save } from "lucide-react";
import { toast } from "sonner";

type Settings = {
  id: string;
  hero_title_part1: string;
  hero_title_part2: string;
  hero_image: string | null;
  hero_quote: string | null;
  contact_location: string;
  contact_email: string | null;
  contact_phone: string | null;
  instagram: string | null;
  facebook: string | null;
  about_text: string | null;
  about_image: string | null;
  primary_color: string;
  accent_color: string;
};

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as Settings | null;
    },
  });

  const [form, setForm] = useState<Partial<Settings>>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  async function saveSection(updates: Partial<Settings>) {
    try {
      const payload = {
        id: form.id || 'global',
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from("site_settings")
        .upsert(payload);

      if (error) throw error;

      toast.success("განახლდა");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="micro-label">საიტი</span>
          <h1 className="mt-3 text-5xl font-display font-black uppercase tracking-editorial">პარამეტრები</h1>
        </div>
      </div>

      <div className="space-y-16 max-w-3xl">
        {/* HERO SECTION */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-primary">მთავარი (Hero)</h2>
            <button 
              onClick={() => saveSection({
                hero_image: form.hero_image,
                hero_title_part1: form.hero_title_part1,
                hero_title_part2: form.hero_title_part2,
                hero_quote: form.hero_quote
              })}
              className="h-8 px-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 grayscale hover:grayscale-0 transition-all"
            >
              <Save size={10} /> შენახვა
            </button>
          </div>
          <div className="p-6 space-y-6">
            <Field label="Hero ფოტო">
              <ImageUpload value={form.hero_image} folder="hero" aspect="aspect-video"
                onChange={(url) => setForm({ ...form, hero_image: url })} />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="სათაური — ნაწილი 1">
                <input className={inputCls} value={form.hero_title_part1 || ""}
                  onChange={(e) => setForm({ ...form, hero_title_part1: e.target.value })} />
              </Field>
              <Field label="სათაური — ნაწილი 2 (დახრილი)">
                <input className={inputCls} value={form.hero_title_part2 || ""}
                  onChange={(e) => setForm({ ...form, hero_title_part2: e.target.value })} />
              </Field>
            </div>
            <Field label="ციტატა">
              <textarea className={textareaCls} value={form.hero_quote || ""}
                onChange={(e) => setForm({ ...form, hero_quote: e.target.value })} />
            </Field>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-primary">შესახებ (About)</h2>
            <button 
              onClick={() => saveSection({
                about_image: form.about_image,
                about_text: form.about_text
              })}
              className="h-8 px-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 grayscale hover:grayscale-0 transition-all"
            >
              <Save size={10} /> შენახვა
            </button>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-[200px,1fr] gap-6">
              <Field label="ფოტო">
                <ImageUpload value={form.about_image} folder="about" aspect="aspect-[3/4]"
                  onChange={(url) => setForm({ ...form, about_image: url })} />
              </Field>
              <Field label="ტექსტი">
                <textarea className={textareaCls + " min-h-[220px]"} value={form.about_text || ""}
                  onChange={(e) => setForm({ ...form, about_text: e.target.value })} />
              </Field>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-primary">კონტაქტი & სოციალური</h2>
            <button 
              onClick={() => saveSection({
                contact_location: form.contact_location,
                contact_email: form.contact_email,
                contact_phone: form.contact_phone,
                instagram: form.instagram,
                facebook: form.facebook
              })}
              className="h-8 px-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 grayscale hover:grayscale-0 transition-all"
            >
              <Save size={10} /> შენახვა
            </button>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-x-6 gap-y-4">
            <Field label="მდებარეობა">
              <input className={inputCls} value={form.contact_location || ""}
                onChange={(e) => setForm({ ...form, contact_location: e.target.value })} />
            </Field>
            <Field label="ელფოსტა">
              <input type="email" className={inputCls} value={form.contact_email || ""}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </Field>
            <Field label="ტელეფონი">
              <input className={inputCls} value={form.contact_phone || ""}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </Field>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Field label="Instagram URL">
                <input className={inputCls} value={form.instagram || ""}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
              </Field>
              <Field label="Facebook URL">
                <input className={inputCls} value={form.facebook || ""}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
              </Field>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

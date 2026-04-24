import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Field, inputCls, textareaCls } from "@/components/admin/Field";
import { Save } from "lucide-react";
import { toast } from "sonner";

type Settings = {
  id: string;
  hero_title_part1: string;
  hero_title_part2: string;
  hero_quote: string | null;
  contact_location: string;
  contact_email: string | null;
  contact_phone: string | null;
  instagram: string | null;
  facebook: string | null;
  about_text: string | null;
  about_image: string | null;
};

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const docRef = doc(db, "site_settings", "global");
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return docSnap.data() as Settings;
    },
  });

  const [form, setForm] = useState<Partial<Settings>>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  async function save() {
    try {
      const payload = {
        hero_title_part1: form.hero_title_part1 || "NINO",
        hero_title_part2: form.hero_title_part2 || "Khikhidze",
        hero_quote: form.hero_quote || null,
        contact_location: form.contact_location || "Tbilisi, Georgia",
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        instagram: form.instagram || null,
        facebook: form.facebook || null,
        about_text: form.about_text || null,
        about_image: form.about_image || null,
        updated_at: serverTimestamp()
      };
      await setDoc(doc(db, "site_settings", "global"), payload, { merge: true });
      toast.success("შენახულია");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="micro-label">საიტი</span>
          <h1 className="mt-3 text-5xl font-display font-black uppercase tracking-editorial">პარამეტრები</h1>
        </div>
        <button onClick={save} className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold uppercase flex items-center gap-2">
          <Save size={14} /> შენახვა
        </button>
      </div>

      <div className="space-y-10 max-w-3xl">
        <section>
          <h2 className="text-xs font-mono uppercase tracking-wider text-primary mb-4">მთავარი</h2>
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
          <div className="mt-4">
            <Field label="ციტატა">
              <textarea className={textareaCls} value={form.hero_quote || ""}
                onChange={(e) => setForm({ ...form, hero_quote: e.target.value })} />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-mono uppercase tracking-wider text-primary mb-4">შესახებ</h2>
          <div className="grid md:grid-cols-[200px,1fr] gap-4">
            <Field label="ფოტო">
              <ImageUpload value={form.about_image} folder="about" aspect="aspect-[3/4]"
                onChange={(url) => setForm({ ...form, about_image: url })} />
            </Field>
            <Field label="ტექსტი">
              <textarea className={textareaCls + " min-h-[200px]"} value={form.about_text || ""}
                onChange={(e) => setForm({ ...form, about_text: e.target.value })} />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-mono uppercase tracking-wider text-primary mb-4">კონტაქტი</h2>
          <div className="grid md:grid-cols-2 gap-4">
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
            <Field label="Instagram URL">
              <input className={inputCls} value={form.instagram || ""}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
            </Field>
            <Field label="Facebook URL">
              <input className={inputCls} value={form.facebook || ""}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
            </Field>
          </div>
        </section>

        <div className="pt-4 border-t border-border flex justify-end">
          <button onClick={save} className="rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
            <Save size={14} /> შენახვა
          </button>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { fetchSettings, type SiteSettings } from "@/lib/queries";
import { toast } from "sonner";
import { Palette, RotateCcw, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/appearance")({
  component: AppearanceComponent,
});

function AppearanceComponent() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();

  const [form, setForm] = useState({
    primary_color: "#E29E2E",
    accent_color: "#E29E2E",
    background_color: "#0A0A0A",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchSettings();
      if (data) {
        setSettings(data);
        setForm({
          primary_color: data.primary_color || "#E29E2E",
          accent_color: data.accent_color || "#E29E2E",
          background_color: data.background_color || "#0A0A0A",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // First check if a record exists
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("id", "global")
        .maybeSingle();

      const { error } = existing 
        ? await supabase
            .from("site_settings")
            .update({ 
               ...form,
               updated_at: new Date().toISOString() 
            })
            .eq("id", "global")
        : await supabase
            .from("site_settings")
            .insert({ 
               id: "global",
               ...form,
               updated_at: new Date().toISOString() 
            });

      if (error) throw error;
      toast.success("ვიზუალი განახლდა");
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (e) {
      toast.error("ვერ შეინახა: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setForm({
      primary_color: "#E29E2E",
      accent_color: "#E29E2E",
      background_color: "#0A0A0A",
    });
  }

  if (loading) return <div className="p-10 animate-pulse text-muted-foreground">იტვირთება...</div>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-serif mb-2">ვიზუალი & ფერები</h1>
        <p className="text-muted-foreground">მართეთ საიტის ფერების პალიტრა</p>
      </div>

      <div className="max-w-xl space-y-8">
        <div className="grid gap-6 p-6 border border-border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">ფერების პალიტრა</h2>
          </div>

          <div className="grid gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">ძირითადი ფერი (Primary)</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  className="w-16 h-16 rounded-md border border-border bg-transparent cursor-pointer overflow-hidden p-0"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                />
                <input 
                  type="text" 
                  className="flex-1 h-12 bg-background border border-border rounded-md px-4 font-mono text-sm"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">გამოიყენება ღილაკებისთვის, აქტიური ელემენტებისთვის და ტექსტის ხაზგასასმელად.</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">აქცენტის ფერი (Accent)</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  className="w-16 h-16 rounded-md border border-border bg-transparent cursor-pointer overflow-hidden p-0"
                  value={form.accent_color}
                  onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                />
                <input 
                  type="text" 
                  className="flex-1 h-12 bg-background border border-border rounded-md px-4 font-mono text-sm"
                  value={form.accent_color}
                  onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">გამოიყენება დამატებითი ვიზუალური ელემენტებისთვის.</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">უკანა ფონი (Background)</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  className="w-16 h-16 rounded-md border border-border bg-transparent cursor-pointer overflow-hidden p-0"
                  value={form.background_color}
                  onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                />
                <input 
                  type="text" 
                  className="flex-1 h-12 bg-background border border-border rounded-md px-4 font-mono text-sm"
                  value={form.background_color}
                  onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">საიტის ძირითადი უკანა ფონი.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 h-11 bg-primary text-primary-foreground rounded-md transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "ინახება..." : "შენახვა"}
            </button>
            <button
              onClick={reset}
              className="px-6 h-11 border border-border rounded-md hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              სტანდარტულზე დაბრუნება
            </button>
          </div>
        </div>

        <div className="p-6 border border-border rounded-lg bg-muted/30">
          <h3 className="text-sm font-semibold mb-3">როგორ მუშაობს?</h3>
          <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
            <li>ფერების შეცვლის შემდეგ საიტი ავტომატურად განახლდება ყველა გვერდზე.</li>
            <li>შეგიძლიათ გამოიყენოთ ფერების ამომრჩევი ან ჩაწეროთ HEX კოდი (მაგ: #E29E2E).</li>
            <li>ნაგულისხმევი ფერია ოქროსფერი (#E29E2E).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

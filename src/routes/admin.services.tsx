import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Field, inputCls, textareaCls } from "@/components/admin/Field";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";

type Service = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  image: string | null;
  sort_order: number;
};

const empty: Omit<Service, "id"> = { title: "", description: "", tags: [], image: null, sort_order: 0 };

export const Route = createFileRoute("/admin/services")({
  component: ServicesAdmin,
});

function ServicesAdmin() {
  const qc = useQueryClient();
  const { data: services = [] } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as Service[];
    },
  });

  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const isNew = editing && !editing.id;

  async function save() {
    if (!editing?.title) return toast.error("სათაური აუცილებელია");
    const payload = {
      title: editing.title,
      description: editing.description ?? null,
      tags: editing.tags ?? [],
      image: editing.image ?? null,
      sort_order: editing.sort_order ?? 0,
      updated_at: new Date().toISOString()
    };
    try {
      if (isNew) {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").update(payload).eq("id", editing.id!);
        if (error) throw error;
      }
      toast.success(isNew ? "დაემატა" : "განახლდა");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(id: string) {
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("წაიშალა");
    } catch (e) {
      console.error("Delete error:", e);
      toast.error("წაშლა ვერ მოხერხდა: " + (e as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="micro-label">მართვა</span>
          <h1 className="mt-3 text-5xl font-display font-black uppercase tracking-editorial">სერვისები</h1>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold uppercase flex items-center gap-2">
          <Plus size={16} /> ახალი
        </button>
      </div>

      <div className="grid gap-4">
        {services.map((s) => (
          <div key={s.id} className="p-5 rounded-2xl bg-card border border-border flex gap-5 items-start">
            {s.image && <img src={s.image} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" alt="" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-lg">{s.title}</h3>
              {s.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
              {s.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {s.tags.map((t) => <span key={t} className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-secondary">{t}</span>)}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(s)} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center"><Pencil size={14} /></button>
              <button onClick={() => remove(s.id)} className="w-9 h-9 rounded-full hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {services.length === 0 && <div className="text-muted-foreground">სერვისები ცარიელია.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="min-h-screen flex items-start justify-center p-5 md:p-10">
            <div className="w-full max-w-2xl bg-card rounded-3xl border border-border p-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold uppercase">{isNew ? "ახალი სერვისი" : "რედაქტირება"}</h2>
                <button onClick={() => setEditing(null)} className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"><X size={18} /></button>
              </div>
              <div className="grid md:grid-cols-[200px,1fr] gap-5">
                <Field label="ფოტო">
                  <ImageUpload value={editing.image} folder="services" aspect="aspect-square"
                    onChange={(url) => setEditing({ ...editing, image: url })} />
                </Field>
                <div className="space-y-4">
                  <Field label="სათაური *">
                    <input className={inputCls} value={editing.title || ""}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                  </Field>
                  <Field label="თეგები" hint="მძიმით გამოყოფილი">
                    <input className={inputCls} value={(editing.tags ?? []).join(", ")}
                      onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
                  </Field>
                  <Field label="პრიორიტეტი">
                    <input type="number" className={inputCls + " w-24"} value={editing.sort_order ?? 0}
                      onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
                  </Field>
                </div>
              </div>
              <div className="mt-4">
                <Field label="აღწერა">
                  <textarea className={textareaCls} value={editing.description || ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </Field>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 text-sm rounded-full hover:bg-secondary">გაუქმება</button>
                <button onClick={save} className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold uppercase flex items-center gap-2">
                  <Save size={14} /> შენახვა
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

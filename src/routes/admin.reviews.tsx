import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Field, inputCls, textareaCls } from "@/components/admin/Field";
import { Plus, Pencil, Trash2, X, Save, Star } from "lucide-react";
import { toast } from "sonner";

type Review = { id: string; name: string; role: string | null; text: string; image: string | null; rating: number; sort_order: number };
const empty: Omit<Review, "id"> = { name: "", role: "", text: "", image: null, rating: 5, sort_order: 0 };

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsAdmin,
});

function ReviewsAdmin() {
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as Review[];
    },
  });

  const [editing, setEditing] = useState<Partial<Review> | null>(null);
  const isNew = editing && !editing.id;

  async function save() {
    if (!editing?.name || !editing?.text) return toast.error("სახელი და ტექსტი აუცილებელია");
    const payload = {
      name: editing.name, role: editing.role || null, text: editing.text,
      image: editing.image ?? null, rating: editing.rating ?? 5, sort_order: editing.sort_order ?? 0,
      updated_at: new Date().toISOString()
    };
    try {
      if (isNew) {
        const { error } = await supabase.from("reviews").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reviews").update(payload).eq("id", editing.id!);
        if (error) throw error;
      }
      toast.success(isNew ? "დაემატა" : "განახლდა");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(id: string) {
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
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
          <h1 className="mt-3 text-5xl font-display font-black uppercase tracking-editorial">მიმოხილვები</h1>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold uppercase flex items-center gap-2">
          <Plus size={16} /> ახალი
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {reviews.map((r) => (
          <div key={r.id} className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-start gap-4">
              {r.image && <img src={r.image} className="w-14 h-14 rounded-full object-cover" alt="" />}
              <div className="flex-1">
                <div className="font-display font-bold">{r.name}</div>
                {r.role && <div className="text-xs text-muted-foreground">{r.role}</div>}
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? "fill-primary text-primary" : "text-muted-foreground"} />
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(r)} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center"><Pencil size={14} /></button>
                <button onClick={() => remove(r.id)} className="w-9 h-9 rounded-full hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/80 italic">"{r.text}"</p>
          </div>
        ))}
        {reviews.length === 0 && <div className="text-muted-foreground col-span-full">რევიუები ცარიელია.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="min-h-screen flex items-start justify-center p-5 md:p-10">
            <div className="w-full max-w-2xl bg-card rounded-3xl border border-border p-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold uppercase">{isNew ? "ახალი რევიუ" : "რედაქტირება"}</h2>
                <button onClick={() => setEditing(null)} className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"><X size={18} /></button>
              </div>
              <div className="grid md:grid-cols-[160px,1fr] gap-5">
                <Field label="ფოტო">
                  <ImageUpload value={editing.image} folder="reviews" aspect="aspect-square"
                    onChange={(url) => setEditing({ ...editing, image: url })} />
                </Field>
                <div className="space-y-4">
                  <Field label="სახელი *">
                    <input className={inputCls} value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  </Field>
                  <Field label="როლი">
                    <input className={inputCls} value={editing.role || ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
                  </Field>
                  <Field label="შეფასება (1-5)">
                    <input type="number" min={1} max={5} className={inputCls + " w-24"} value={editing.rating ?? 5}
                      onChange={(e) => setEditing({ ...editing, rating: parseInt(e.target.value) || 5 })} />
                  </Field>
                  <Field label="პრიორიტეტი">
                    <input type="number" className={inputCls + " w-24"} value={editing.sort_order ?? 0}
                      onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
                  </Field>
                </div>
              </div>
              <div className="mt-4">
                <Field label="ტექსტი *">
                  <textarea className={textareaCls} value={editing.text || ""} onChange={(e) => setEditing({ ...editing, text: e.target.value })} />
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

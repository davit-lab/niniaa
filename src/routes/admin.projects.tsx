import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { GalleryUpload } from "@/components/admin/GalleryUpload";
import { Field, inputCls, textareaCls } from "@/components/admin/Field";
import { Plus, Pencil, Trash2, Star, X, Save } from "lucide-react";
import { toast } from "sonner";

type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string | null;
  cover_image: string;
  gallery: string[];
  date_label: string | null;
  featured: boolean;
  sort_order: number;
};

const empty: Omit<Project, "id"> = {
  slug: "", title: "", category: "Editorial", description: "", cover_image: "",
  gallery: [], date_label: "", featured: false, sort_order: 0,
};

export const Route = createFileRoute("/admin/projects")({
  component: ProjectsAdmin,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\u10A0-\u10FF\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60);
}

function ProjectsAdmin() {
  const qc = useQueryClient();
  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const q = query(collection(db, "projects"), orderBy("sort_order"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Project[];
    },
  });

  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const isNew = editing && !editing.id;

  async function save() {
    if (!editing) return;
    const payload = {
      slug: editing.slug || slugify(editing.title || ""),
      title: editing.title || "",
      category: editing.category || "Editorial",
      description: editing.description ?? null,
      cover_image: editing.cover_image || "",
      gallery: editing.gallery ?? [],
      date_label: editing.date_label || null,
      featured: !!editing.featured,
      sort_order: editing.sort_order ?? 0,
      updated_at: serverTimestamp()
    };
    if (!payload.title || !payload.cover_image) {
      toast.error("სათაური და cover ფოტო აუცილებელია");
      return;
    }
    try {
      if (isNew) {
        await addDoc(collection(db, "projects"), {
          ...payload,
          created_at: serverTimestamp()
        });
        toast.success("შეიქმნა");
      } else {
        await updateDoc(doc(db, "projects", editing.id!), payload);
        toast.success("განახლდა");
      }
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm("წავშალო ეს პროექტი?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      toast.success("წაშლილია");
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-12">
        <div>
          <span className="micro-label">მართვა</span>
          <h1 className="mt-3 text-5xl font-display font-black uppercase tracking-editorial">პროექტები</h1>
        </div>
        <button onClick={() => setEditing({ ...empty })}
          className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold uppercase tracking-wider flex items-center gap-2 hover:opacity-90">
          <Plus size={16} /> ახალი
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p) => (
          <div key={p.id} className="rounded-2xl bg-card border border-border overflow-hidden group">
            <div className="aspect-[4/5] relative overflow-hidden bg-secondary">
              {p.cover_image && <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />}
              {p.featured && (
                <span className="absolute top-3 left-3 micro-label glass px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Star size={10} className="fill-primary text-primary" /> რჩეული
                </span>
              )}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button onClick={() => setEditing(p)} className="w-11 h-11 rounded-full bg-card hover:bg-primary hover:text-primary-foreground flex items-center justify-center"><Pencil size={16} /></button>
                <button onClick={() => remove(p.id)} className="w-11 h-11 rounded-full bg-card hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs text-primary font-mono uppercase">{p.category}</div>
              <h3 className="mt-1 font-display font-bold text-lg">{p.title}</h3>
              <div className="text-xs text-muted-foreground mt-1">{p.gallery.length} ფოტო · /{p.slug}</div>
            </div>
          </div>
        ))}
        {projects.length === 0 && <div className="text-muted-foreground col-span-full">ჯერ არცერთი პროექტი არ გაქვთ. დაიწყეთ ახლის დამატებით.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="min-h-screen flex items-start justify-center p-5 md:p-10">
            <div className="w-full max-w-3xl bg-card rounded-3xl border border-border p-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold uppercase">{isNew ? "ახალი პროექტი" : "რედაქტირება"}</h2>
                <button onClick={() => setEditing(null)} className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"><X size={18} /></button>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Cover ფოტო *">
                  <ImageUpload value={editing.cover_image} folder="projects/covers"
                    onChange={(url) => setEditing({ ...editing, cover_image: url || "" })} aspect="aspect-[4/5]" />
                </Field>
                <div className="space-y-4">
                  <Field label="სათაური *">
                    <input className={inputCls} value={editing.title || ""}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
                  </Field>
                  <Field label="მისამართი (URL)" hint="ავტომატური">
                    <input className={inputCls} value={editing.slug || ""}
                      onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
                  </Field>
                  <Field label="კატეგორია">
                    <input className={inputCls} value={editing.category || ""} placeholder="Editorial / Portrait / Brand"
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                  </Field>
                  <Field label="თარიღი" hint="არასავალდებულო">
                    <input className={inputCls} value={editing.date_label || ""} placeholder="2024"
                      onChange={(e) => setEditing({ ...editing, date_label: e.target.value })} />
                  </Field>
                  <div className="flex items-center gap-4">
                    <Field label="პრიორიტეტი">
                      <input type="number" className={inputCls + " w-24"} value={editing.sort_order ?? 0}
                        onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} />
                    </Field>
                    <label className="flex items-center gap-2 cursor-pointer mt-6">
                      <input type="checkbox" checked={!!editing.featured}
                        onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                      <span className="text-sm">რჩეული</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Field label="აღწერა">
                  <textarea className={textareaCls} value={editing.description || ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="გალერეა" hint="გადაათრიე რიგისთვის">
                  <GalleryUpload value={editing.gallery || []} folder={`projects/${editing.slug || "new"}`}
                    onChange={(urls) => setEditing({ ...editing, gallery: urls })} />
                </Field>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 text-sm rounded-full hover:bg-secondary">გაუქმება</button>
                <button onClick={save} className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold uppercase tracking-wider flex items-center gap-2 hover:opacity-90">
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

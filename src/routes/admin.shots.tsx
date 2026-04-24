import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

type Shot = { id: string; url: string; caption: string | null; sort_order: number };

export const Route = createFileRoute("/admin/shots")({
  component: ShotsAdmin,
});

function ShotsAdmin() {
  const qc = useQueryClient();
  const { data: shots = [] } = useQuery({
    queryKey: ["admin-shots"],
    queryFn: async () => {
      const q = query(collection(db, "shots"), orderBy("sort_order"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Shot[];
    },
  });

  const [draft, setDraft] = useState<{ url: string; caption: string }>({ url: "", caption: "" });

  async function add() {
    if (!draft.url) return toast.error("ჯერ ატვირთე ფოტო");
    try {
      await addDoc(collection(db, "shots"), {
        url: draft.url,
        caption: draft.caption || null,
        sort_order: shots.length,
        created_at: serverTimestamp()
      });
      setDraft({ url: "", caption: "" });
      qc.invalidateQueries({ queryKey: ["admin-shots"] });
      qc.invalidateQueries({ queryKey: ["shots"] });
      toast.success("დაემატა");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm("წავშალო?")) return;
    try {
      await deleteDoc(doc(db, "shots", id));
      qc.invalidateQueries({ queryKey: ["admin-shots"] });
      qc.invalidateQueries({ queryKey: ["shots"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function updateCaption(id: string, caption: string) {
    try {
      await updateDoc(doc(db, "shots", id), { caption, updated_at: serverTimestamp() });
      qc.invalidateQueries({ queryKey: ["admin-shots"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function moveSort(id: string, dir: -1 | 1) {
    const idx = shots.findIndex((s) => s.id === id);
    const ni = idx + dir;
    if (ni < 0 || ni >= shots.length) return;
    const a = shots[idx], b = shots[ni];
    try {
      await Promise.all([
        updateDoc(doc(db, "shots", a.id), { sort_order: b.sort_order }),
        updateDoc(doc(db, "shots", b.id), { sort_order: a.sort_order }),
      ]);
      qc.invalidateQueries({ queryKey: ["admin-shots"] });
      qc.invalidateQueries({ queryKey: ["shots"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div>
      <span className="micro-label">მართვა</span>
      <h1 className="mt-3 text-5xl font-display font-black uppercase tracking-editorial mb-10">კადრები</h1>

      {/* Add new */}
      <div className="mb-10 p-6 rounded-2xl bg-card border border-border">
        <div className="grid md:grid-cols-[200px,1fr,auto] gap-4 items-end">
          <ImageUpload value={draft.url} folder="shots" aspect="aspect-square"
            onChange={(url) => setDraft({ ...draft, url: url || "" })} />
          <input className="bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
            placeholder="აღწერა (არასავალდებულო)" value={draft.caption}
            onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
          <button onClick={add} className="rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold uppercase flex items-center gap-2">
            <Plus size={16} /> დამატება
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {shots.map((s, i) => (
          <div key={s.id} className="rounded-xl overflow-hidden bg-card border border-border group">
            <div className="aspect-square relative">
              <img src={s.url} alt={s.caption || ""} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                <button onClick={() => moveSort(s.id, -1)} disabled={i === 0} className="w-8 h-8 rounded-full bg-card text-xs disabled:opacity-30">←</button>
                <button onClick={() => remove(s.id)} className="w-9 h-9 rounded-full bg-card hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center"><Trash2 size={14} /></button>
                <button onClick={() => moveSort(s.id, 1)} disabled={i === shots.length - 1} className="w-8 h-8 rounded-full bg-card text-xs disabled:opacity-30">→</button>
              </div>
              <span className="absolute top-1 left-1 text-[10px] font-mono bg-background/80 px-1.5 rounded">{i + 1}</span>
            </div>
            <input
              defaultValue={s.caption || ""} placeholder="აღწერა"
              onBlur={(e) => e.target.value !== (s.caption || "") && updateCaption(s.id, e.target.value)}
              className="w-full bg-transparent border-t border-border px-3 py-2 text-xs outline-none focus:bg-secondary/40"
            />
          </div>
        ))}
        {shots.length === 0 && <div className="col-span-full text-muted-foreground">ჯერ ფოტო არ აგიტვირთავს.</div>}
      </div>
    </div>
  );
}

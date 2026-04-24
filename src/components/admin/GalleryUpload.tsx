import { useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Upload, X, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
};

export function GalleryUpload({ value, onChange, folder = "gallery" }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList) {
    setBusy(true);
    try {
      const uploads: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploads.push(url);
      }
      onChange([...value, ...uploads]);
      toast.success(`აიტვირთა ${uploads.length} ფოტო`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...value];
    const ni = idx + dir;
    if (ni < 0 || ni >= next.length) return;
    [next[idx], next[ni]] = [next[ni], next[idx]];
    onChange(next);
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {value.map((url, i) => (
          <div key={url + i} className="relative aspect-square rounded-xl overflow-hidden bg-secondary group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button type="button" onClick={() => move(i, -1)} className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:text-primary">
                <GripVertical size={14} className="rotate-90" />
              </button>
              <button type="button" onClick={() => remove(i)} className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:text-destructive">
                <X size={14} />
              </button>
              <button type="button" onClick={() => move(i, 1)} className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:text-primary">
                <GripVertical size={14} className="-rotate-90" />
              </button>
            </div>
            <span className="absolute top-1 left-1 text-[10px] font-mono bg-background/80 px-1.5 rounded">{i + 1}</span>
          </div>
        ))}
        <label className="aspect-square rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-secondary/40 transition">
          {busy ? <Loader2 className="animate-spin text-primary" size={20} /> : <Upload size={18} className="text-muted-foreground" />}
          <span className="text-[10px] text-muted-foreground">დამატე</span>
          <input type="file" accept="image/*" multiple className="hidden" disabled={busy}
            onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </label>
      </div>
    </div>
  );
}

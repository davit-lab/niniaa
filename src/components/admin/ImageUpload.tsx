import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  className?: string;
  aspect?: string; // tailwind aspect class, e.g. "aspect-[4/5]"
};

export function ImageUpload({ value, onChange, folder = "uploads", className = "", aspect = "aspect-[4/5]" }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("მხოლოდ ფოტო ფაილებია მისაღები");
      return;
    }

    setBusy(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${folder}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(path, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(path);

      onChange(publicUrl);
      toast.success("ფოტო აიტვირთა");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(`შეცდომა: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <div className={`relative ${aspect} rounded-2xl overflow-hidden bg-secondary/40 border border-border group`}>
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/60 transition">
            {busy ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-primary" size={28} />
                <span className="text-[10px] font-mono">იტვირთება...</span>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">ატვირთე ფოტო</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        )}
      </div>
      {value && (
        <label className="block mt-2">
          <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer">შეცვალე ფოტო</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      )}
    </div>
  );
}

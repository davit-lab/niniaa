import * as React from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition";

export const textareaCls = inputCls + " min-h-[100px] resize-y";

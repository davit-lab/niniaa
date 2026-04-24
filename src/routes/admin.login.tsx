import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";
import { LogIn, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Sign in — Admin" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("მოგესალმებით!");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error("ავტორიზაცია ვერ მოხერხდა. შეამოწმეთ მონაცემები.");
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5">
      <div className="w-full max-w-md p-10 rounded-3xl bg-card border border-border flex flex-col gap-8 text-center">
        <div>
          <span className="micro-label">Studio Admin</span>
          <h1 className="mt-3 text-4xl font-display font-black uppercase tracking-editorial">
            შესვლა
          </h1>
          <p className="mt-4 text-xs text-muted-foreground">
            მხოლოდ ავტორიზებული ადმინისტრატორებისთვის.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="ელფოსტა"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="პაროლი"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={busy} 
            className="mt-2 flex items-center justify-center gap-3 rounded-full bg-primary text-primary-foreground py-4 text-sm font-semibold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-50"
          >
            {busy ? (
              "..."
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                შესვლა
              </>
            )}
          </button>
        </form>
        
        <p className="text-[10px] text-muted-foreground px-4 uppercase tracking-widest">
          Secured by Firebase Auth
        </p>
      </div>
    </div>
  );
}

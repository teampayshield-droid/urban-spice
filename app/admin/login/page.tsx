"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@restaurant.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-charcoal-950 to-charcoal-900">
      <div className="w-full max-w-sm glass rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mb-3">
            <LayoutDashboard className="text-charcoal-950" size={22} />
          </div>
          <h1 className="text-xl font-display font-bold text-gold-gradient">Admin Login</h1>
          <p className="text-white/40 text-sm mt-1">Urban Spice Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/50">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-charcoal-800 rounded-xl px-4 py-2.5 text-sm border border-white/5"
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/50">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-charcoal-800 rounded-xl px-4 py-2.5 text-sm border border-white/5"
              type="password"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gold-gradient text-charcoal-950 font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"}
          </button>
        </form>
        <p className="text-white/30 text-xs text-center mt-5">Demo: admin@restaurant.com / admin123</p>
      </div>
    </div>
  );
}

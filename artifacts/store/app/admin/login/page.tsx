"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../_lib/auth-context";

export default function AdminLogin() {
  const { login, user } = useAdminAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) { router.push("/admin"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(username, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#18181b] border border-white/10 rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">STYLEZONE</h1>
            <p className="text-sm text-white/40 mt-1">Admin Dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50"
                placeholder="admin" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50"
                placeholder="••••••••" required />
            </div>
            {error && <p className="text-xs text-red-400 py-1">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors disabled:opacity-60 mt-2">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

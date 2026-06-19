"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "../_lib/auth-context";
import { Plus, Trash2 } from "lucide-react";

interface Coupon { id: number; code: string; discount_type: string; amount: string; usage_count: number; usage_limit: number | null; date_expires: string | null; }

export default function CouponsPage() {
  const { token } = useAdminAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(""); const [amount, setAmount] = useState(""); const [type, setType] = useState("percent"); const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch("/api/admin/coupons?per_page=50", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setCoupons(Array.isArray(data) ? data : []); setLoading(false);
  };
  useEffect(() => { load(); }, [token]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); if (!code.trim() || !amount) return;
    setAdding(true);
    await fetch("/api/admin/coupons", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ code: code.trim().toLowerCase(), discount_type: type, amount }) });
    setCode(""); setAmount(""); await load(); setAdding(false);
  };

  const del = async (id: number) => {
    if (!confirm("Delete coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setCoupons(cs => cs.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
      <form onSubmit={add} className="flex gap-2 flex-wrap">
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code" className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/30 focus:outline-none w-36" required />
        <select value={type} onChange={e => setType(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none">
          <option value="percent" className="bg-[#18181b]">Percent %</option>
          <option value="fixed_cart" className="bg-[#18181b]">Fixed $</option>
        </select>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/30 focus:outline-none w-24" required />
        <button type="submit" disabled={adding} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 disabled:opacity-60"><Plus className="h-4 w-4" /> Add</button>
      </form>
      <div className="bg-[#18181b] border border-white/5 rounded-lg overflow-hidden">
        {loading ? <div className="p-8 text-center text-white/30">Loading…</div> : (
          <table className="w-full text-sm"><thead className="border-b border-white/5"><tr className="text-left text-xs text-white/40 uppercase tracking-wider"><th className="px-4 py-3">Code</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-white/2">
                  <td className="px-4 py-3 font-mono text-orange-400 uppercase">{c.code}</td>
                  <td className="px-4 py-3 text-xs text-white/60 capitalize">{c.discount_type.replace("_"," ")}</td>
                  <td className="px-4 py-3 font-mono">{c.discount_type === "percent" ? `${c.amount}%` : `$${c.amount}`}</td>
                  <td className="px-4 py-3 text-white/60">{c.usage_count}{c.usage_limit ? `/${c.usage_limit}` : ""}</td>
                  <td className="px-4 py-3 text-xs text-white/40">{c.date_expires ? new Date(c.date_expires).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => del(c.id)} className="p-1.5 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

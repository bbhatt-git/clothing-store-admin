"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "../_lib/auth-context";
import Link from "next/link";
import { Search } from "lucide-react";

interface Order { id: number; number: string; status: string; currency_symbol: string; total: string; date_created: string; billing: { first_name: string; last_name: string; phone: string }; }

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  processing: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
  "on-hold": "bg-purple-500/10 text-purple-400",
};

export default function OrdersPage() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async (p = page, q = search, s = status) => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), per_page: "20" });
    if (q) params.set("search", q); if (s) params.set("status", s);
    const res = await fetch(`/api/admin/orders?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setOrders(data.orders || []); setTotal(data.total || 0); setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-white/40 mt-1">{total} total orders</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <form onSubmit={e => { e.preventDefault(); setPage(1); load(1); }} className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…"
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50" />
          </div>
          <button type="submit" className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white hover:bg-white/10">Search</button>
        </form>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); load(1, search, e.target.value); }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none">
          <option value="">All Statuses</option>
          {["pending","processing","on-hold","completed","cancelled","refunded","failed"].map(s => <option key={s} value={s} className="bg-[#18181b]">{s}</option>)}
        </select>
      </div>
      <div className="bg-[#18181b] border border-white/5 rounded-lg overflow-hidden">
        {loading ? <div className="p-12 text-center text-white/30">Loading…</div> : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/5">
              <tr className="text-left text-xs text-white/40 uppercase tracking-wider">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-white/2">
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-orange-400 hover:text-orange-300">#{o.number}</Link></td>
                  <td className="px-4 py-3">{o.billing?.first_name} {o.billing?.last_name}<span className="block text-xs text-white/30">{o.billing?.phone}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded capitalize ${STATUS_COLORS[o.status] || "bg-white/5 text-white/40"}`}>{o.status}</span></td>
                  <td className="px-4 py-3 font-mono">{o.currency_symbol}{o.total}</td>
                  <td className="px-4 py-3 text-xs text-white/40">{new Date(o.date_created).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {total > 20 && (
        <div className="flex gap-2 justify-center">
          <button onClick={() => { const p = page-1; setPage(p); load(p); }} disabled={page===1} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs disabled:opacity-30 hover:bg-white/10">Prev</button>
          <span className="px-3 py-1.5 text-xs text-white/40">Page {page}</span>
          <button onClick={() => { const p = page+1; setPage(p); load(p); }} disabled={page*20>=total} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs disabled:opacity-30 hover:bg-white/10">Next</button>
        </div>
      )}
    </div>
  );
}

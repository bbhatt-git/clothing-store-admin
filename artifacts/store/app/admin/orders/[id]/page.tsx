"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "../../_lib/auth-context";
import { ArrowLeft } from "lucide-react";

interface Order { id: number; number: string; status: string; currency_symbol: string; total: string; date_created: string; billing: Record<string, string>; shipping: Record<string, string>; payment_method_title: string; line_items: { id: number; name: string; quantity: number; total: string }[]; customer_note: string; }

const STATUSES = ["pending","processing","on-hold","completed","cancelled","refunded","failed"];

export default function OrderDetailPage() {
  const { token } = useAdminAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !params.id) return;
    fetch(`/api/admin/orders/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setOrder(d); setStatus(d.status || ""); setLoading(false); });
  }, [token, params.id]);

  const save = async () => {
    if (!token || !order) return;
    setSaving(true);
    await fetch(`/api/admin/orders/${order.id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setSaving(false);
    router.push("/admin/orders");
  };

  if (loading) return <div className="p-12 text-center text-white/30">Loading…</div>;
  if (!order) return <div className="p-12 text-center text-white/30">Order not found.</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/orders")} className="p-2 hover:bg-white/5 rounded"><ArrowLeft className="h-4 w-4" /></button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.number}</h1>
          <p className="text-white/40 text-sm mt-0.5">{new Date(order.date_created).toLocaleString()}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#18181b] border border-white/5 rounded-lg p-5">
          <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Billing</h2>
          {["first_name","last_name","phone","email","address_1","city","country"].map(k => order.billing[k] ? <p key={k} className="text-sm">{order.billing[k]}</p> : null)}
        </div>
        <div className="bg-[#18181b] border border-white/5 rounded-lg p-5">
          <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Order Info</h2>
          <p className="text-sm">Payment: <span className="text-white/60">{order.payment_method_title}</span></p>
          <p className="text-sm mt-1">Total: <span className="font-mono text-orange-400">{order.currency_symbol}{order.total}</span></p>
          {order.customer_note && <p className="text-sm mt-2 text-white/60">Note: {order.customer_note}</p>}
        </div>
      </div>
      <div className="bg-[#18181b] border border-white/5 rounded-lg p-5">
        <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Items</h2>
        {order.line_items.map(item => (
          <div key={item.id} className="flex justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-sm">{item.name} <span className="text-white/40">×{item.quantity}</span></span>
            <span className="text-sm font-mono">{order.currency_symbol}{item.total}</span>
          </div>
        ))}
      </div>
      <div className="bg-[#18181b] border border-white/5 rounded-lg p-5">
        <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Update Status</h2>
        <div className="flex gap-3">
          <select value={status} onChange={e => setStatus(e.target.value)} className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-orange-500/50">
            {STATUSES.map(s => <option key={s} value={s} className="bg-[#18181b]">{s}</option>)}
          </select>
          <button onClick={save} disabled={saving} className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

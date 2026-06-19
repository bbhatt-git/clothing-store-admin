"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminAuth } from "../../../_lib/auth-context";
import { ArrowLeft } from "lucide-react";

export default function EditProductPage() {
  const { token } = useAdminAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", regular_price: "", sale_price: "", description: "", short_description: "", status: "draft", manage_stock: false, stock_quantity: "", sku: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !params.id) return;
    fetch(`/api/admin/products/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => {
        setForm({ name: d.name || "", regular_price: d.regular_price || "", sale_price: d.sale_price || "", description: d.description || "", short_description: d.short_description || "", status: d.status || "draft", manage_stock: d.manage_stock || false, stock_quantity: String(d.stock_quantity || ""), sku: d.sku || "" });
        setLoading(false);
      });
  }, [token, params.id]);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    const body: Record<string, unknown> = { ...form };
    if (!form.manage_stock) delete body.stock_quantity;
    const res = await fetch(`/api/admin/products/${params.id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { router.push("/admin/products"); }
    else { const d = await res.json(); setError(d.error || "Error saving"); setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center text-white/30">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/products")} className="p-2 hover:bg-white/5 rounded"><ArrowLeft className="h-4 w-4" /></button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      </div>
      <form onSubmit={save} className="space-y-4">
        {[{k:"name",l:"Name",req:true},{k:"sku",l:"SKU"},{k:"regular_price",l:"Regular Price",t:"number"},{k:"sale_price",l:"Sale Price",t:"number"}].map(({k,l,req,t}) => (
          <div key={k}><label className="block text-xs text-white/40 mb-1">{l}</label>
          <input type={t||"text"} value={String(form[k as keyof typeof form])} onChange={e => set(k, e.target.value)} required={req}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-orange-500/50" /></div>
        ))}
        <div><label className="block text-xs text-white/40 mb-1">Short Description</label>
          <textarea value={form.short_description} onChange={e => set("short_description", e.target.value)} rows={2} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-orange-500/50" /></div>
        <div><label className="block text-xs text-white/40 mb-1">Description</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-orange-500/50" /></div>
        <div className="flex gap-4 items-center flex-wrap">
          <label className="block text-xs text-white/40">Status</label>
          <select value={form.status} onChange={e => set("status", e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none">
            <option value="draft" className="bg-[#18181b]">Draft</option>
            <option value="publish" className="bg-[#18181b]">Published</option>
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.manage_stock} onChange={e => set("manage_stock", e.target.checked)} className="accent-orange-500" /> Manage Stock
          </label>
          {form.manage_stock && <input type="number" value={form.stock_quantity} onChange={e => set("stock_quantity", e.target.value)} placeholder="Qty" className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none" />}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={saving} className="w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors disabled:opacity-60">{saving ? "Saving…" : "Save Changes"}</button>
      </form>
    </div>
  );
}

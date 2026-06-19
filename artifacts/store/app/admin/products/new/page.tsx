"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../_lib/auth-context";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", regular_price: "", sale_price: "", description: "", short_description: "", status: "draft", manage_stock: false, stock_quantity: "", sku: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    const body: Record<string, unknown> = { ...form };
    if (!form.manage_stock) delete body.stock_quantity;
    const res = await fetch("/api/admin/products", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { router.push("/admin/products"); }
    else { const d = await res.json(); setError(d.error || "Error creating product"); setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/products")} className="p-2 hover:bg-white/5 rounded"><ArrowLeft className="h-4 w-4" /></button>
        <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
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
        <div className="flex gap-4 items-center">
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
        <button type="submit" disabled={saving} className="w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors disabled:opacity-60">{saving ? "Creating…" : "Create Product"}</button>
      </form>
    </div>
  );
}

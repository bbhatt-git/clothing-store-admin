"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "../_lib/auth-context";
import { Plus, Trash2 } from "lucide-react";

interface Category { id: number; name: string; slug: string; count: number; parent: number; }

export default function CategoriesPage() {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!token) return;
    const res = await fetch("/api/admin/categories?per_page=100", { headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json(); setCategories(d.categories || []); setLoading(false);
  };
  useEffect(() => { load(); }, [token]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newName.trim()) return;
    setAdding(true);
    await fetch("/api/admin/categories", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
    setNewName(""); await load(); setAdding(false);
  };

  const del = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setCategories(cs => cs.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
      <form onSubmit={add} className="flex gap-2">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New category name…"
          className="flex-1 max-w-sm px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50" />
        <button type="submit" disabled={adding} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors disabled:opacity-60">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>
      <div className="bg-[#18181b] border border-white/5 rounded-lg overflow-hidden">
        {loading ? <div className="p-8 text-center text-white/30">Loading…</div> : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/5"><tr className="text-left text-xs text-white/40 uppercase tracking-wider"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Products</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-white/2">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-white/40 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-white/60">{c.count}</td>
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

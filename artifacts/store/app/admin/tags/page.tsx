"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "../_lib/auth-context";
import { Plus, Trash2 } from "lucide-react";

interface Tag { id: number; name: string; slug: string; count: number; }

export default function TagsPage() {
  const { token } = useAdminAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    if (!token) return;
    const res = await fetch("/api/admin/tags?per_page=50", { headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json(); setTags(d.tags || []); setLoading(false);
  };
  useEffect(() => { load(); }, [token]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newName.trim()) return;
    setAdding(true);
    await fetch("/api/admin/tags", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
    setNewName(""); await load(); setAdding(false);
  };

  const del = async (id: number) => {
    if (!confirm("Delete this tag?")) return;
    await fetch(`/api/admin/tags/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setTags(ts => ts.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
      <form onSubmit={add} className="flex gap-2">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New tag name…"
          className="flex-1 max-w-sm px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50" />
        <button type="submit" disabled={adding} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors disabled:opacity-60">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>
      <div className="bg-[#18181b] border border-white/5 rounded-lg overflow-hidden">
        {loading ? <div className="p-8 text-center text-white/30">Loading…</div> : (
          <table className="w-full text-sm"><thead className="border-b border-white/5"><tr className="text-left text-xs text-white/40 uppercase tracking-wider"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Products</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {tags.map(t => (
                <tr key={t.id} className="hover:bg-white/2">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-white/40 font-mono text-xs">{t.slug}</td>
                  <td className="px-4 py-3 text-white/60">{t.count}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => del(t.id)} className="p-1.5 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

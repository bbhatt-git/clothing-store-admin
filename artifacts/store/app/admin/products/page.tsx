"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "../_lib/auth-context";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Product { id: number; name: string; slug: string; price: string; stock_status: string; stock_quantity: number | null; status: string; images: {src: string}[]; }

export default function ProductsPage() {
  const { token } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async (p = page, q = search) => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), per_page: "20" });
    if (q) params.set("search", q);
    const res = await fetch(`/api/admin/products?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setProducts(data.products || []); setTotal(data.total || 0); setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(1, search); };
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setProducts(ps => ps.filter(p => p.id !== id)); setTotal(t => t - 1); setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-white/40 mt-1">{total} total products</p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-md hover:bg-orange-600 transition-colors">
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50" />
        </div>
        <button type="submit" className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white hover:bg-white/10 transition-colors">Search</button>
      </form>

      <div className="bg-[#18181b] border border-white/5 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/30">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/5">
              <tr className="text-left text-xs text-white/40 uppercase tracking-wider">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-white/2">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {p.images?.[0]?.src && <img src={p.images[0].src} alt="" className="w-9 h-9 rounded object-cover bg-white/5" />}
                    <span className="font-medium truncate max-w-[220px]">{p.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${p.status === "publish" ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/40"}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${p.stock_status === "instock" ? "text-green-400" : "text-orange-400"}`}>
                      {p.stock_status === "instock" ? `In Stock${p.stock_quantity !== null ? ` (${p.stock_quantity})` : ""}` : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{p.price ? `$${p.price}` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 text-white/40 hover:text-white rounded hover:bg-white/5 transition-colors"><Pencil className="h-4 w-4" /></Link>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-1.5 text-white/40 hover:text-red-400 rounded hover:bg-white/5 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > 20 && (
        <div className="flex gap-2 justify-center">
          <button onClick={() => { const p = page - 1; setPage(p); load(p); }} disabled={page === 1} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs disabled:opacity-30 hover:bg-white/10 transition-colors">Prev</button>
          <span className="px-3 py-1.5 text-xs text-white/40">Page {page}</span>
          <button onClick={() => { const p = page + 1; setPage(p); load(p); }} disabled={page * 20 >= total} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs disabled:opacity-30 hover:bg-white/10 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}

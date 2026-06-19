"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "../_lib/auth-context";
import { Trash2, Star } from "lucide-react";

interface Review { id: number; reviewer: string; reviewer_email: string; review: string; rating: number; status: string; product_id: number; date_created: string; }

export default function ReviewsPage() {
  const { token } = useAdminAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");

  const load = async (s = status) => {
    if (!token) return;
    setLoading(true);
    const res = await fetch(`/api/admin/reviews?status=${s}&per_page=50`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json(); setReviews(Array.isArray(data) ? data : []); setLoading(false);
  };
  useEffect(() => { load(); }, [token]);

  const del = async (id: number) => {
    if (!confirm("Delete review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setReviews(rs => rs.filter(r => r.id !== id));
  };
  const approve = async (r: Review) => {
    await fetch(`/api/admin/reviews/${r.id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ status: r.status === "approved" ? "hold" : "approved" }) });
    setReviews(rs => rs.map(x => x.id === r.id ? { ...x, status: r.status === "approved" ? "hold" : "approved" } : x));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <select value={status} onChange={e => { setStatus(e.target.value); load(e.target.value); }} className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none">
          {["all","approved","hold","spam","trash"].map(s => <option key={s} value={s} className="bg-[#18181b]">{s}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {loading ? <div className="p-8 text-center text-white/30">Loading…</div> : reviews.length === 0 ? <div className="bg-[#18181b] border border-white/5 rounded-lg p-8 text-center text-white/30">No reviews found.</div> : reviews.map(r => (
          <div key={r.id} className="bg-[#18181b] border border-white/5 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{r.reviewer}</span>
                  <span className="text-xs text-white/30">{r.reviewer_email}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${r.status === "approved" ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/40"}`}>{r.status}</span>
                  <div className="flex gap-0.5">{Array.from({length:r.rating}).map((_,i) => <Star key={i} className="h-3 w-3 fill-orange-400 text-orange-400" />)}</div>
                </div>
                <p className="text-sm text-white/70 mt-1">{r.review.replace(/<[^>]+>/g,"")}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => approve(r)} className="p-1.5 text-white/40 hover:text-green-400 transition-colors text-xs">{r.status === "approved" ? "Hold" : "Approve"}</button>
                <button onClick={() => del(r.id)} className="p-1.5 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

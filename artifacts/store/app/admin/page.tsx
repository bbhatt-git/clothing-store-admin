"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "./_lib/auth-context";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Stats { totalSales: string; ordersToday: number; activeProducts: number; lowStockCount: number; totalOrders: number; }
interface ChartPoint { date: string; sales: number; orders: number; }
interface Order { id: number; number: string; status: string; currency_symbol: string; total: string; }
interface Product { id: number; name: string; stock_quantity: number | null; }

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-[#18181b] border border-white/5 rounded-lg p-5">
      <p className="text-xs text-white/40 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-orange-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("/api/admin/dashboard/stats", { headers: h }).then(r => r.json()),
      fetch("/api/admin/dashboard/sales-chart?period=30days", { headers: h }).then(r => r.json()),
      fetch("/api/admin/dashboard/recent-orders", { headers: h }).then(r => r.json()),
      fetch("/api/admin/dashboard/low-stock", { headers: h }).then(r => r.json()),
    ]).then(([s, c, o, l]) => { setStats(s); setChart(Array.isArray(c) ? c : []); setOrders(Array.isArray(o) ? o.slice(0, 5) : []); setLowStock(Array.isArray(l) ? l.slice(0, 5) : []); });
  }, [token]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-white/40 mt-1">Store overview and performance metrics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sales (Month)" value={stats ? `$${stats.totalSales}` : "—"} />
        <StatCard label="Orders Today" value={stats?.ordersToday ?? "—"} />
        <StatCard label="Active Products" value={stats?.activeProducts ?? "—"} />
        <StatCard label="Low Stock" value={stats?.lowStockCount ?? "—"} accent />
      </div>

      {chart.length > 0 && (
        <div className="bg-[#18181b] border border-white/5 rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-4">Sales Overview (30 Days)</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={v => v?.slice(0, 10)?.slice(5)} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6 }}
                  itemStyle={{ color: "#f97316" }} labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <Area type="monotone" dataKey="sales" stroke="#f97316" fill="url(#grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#18181b] border border-white/5 rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-2">
            {orders.length === 0 ? <p className="text-xs text-white/30">No orders yet.</p> : orders.map(o => (
              <div key={o.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm font-mono">#{o.number}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/5 capitalize">{o.status}</span>
                <span className="text-sm font-medium">{o.currency_symbol}{o.total}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#18181b] border border-white/5 rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-4">Low Stock Alerts</h2>
          <div className="space-y-2">
            {lowStock.length === 0 ? <p className="text-xs text-white/30">All products in stock.</p> : lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm truncate max-w-[200px]">{p.name}</span>
                <span className="text-xs text-orange-400 font-medium">{p.stock_quantity ?? 0} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { wooFetch } from "../../_lib/woo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await verifyRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [salesRes, todayRes, productsRes, lowStockRes, allOrdersRes] = await Promise.all([
      wooFetch("reports/sales?period=month"),
      wooFetch(`orders?after=${today.toISOString()}&per_page=1`),
      wooFetch("products?status=publish&per_page=1"),
      wooFetch("products?stock_status=onbackorder&per_page=1"),
      wooFetch("orders?per_page=1"),
    ]);
    const salesData = salesRes.ok ? await salesRes.json() : [];
    const totalSales = salesData[0]?.total_sales ?? "0.00";
    const ordersToday = parseInt(todayRes.headers.get("X-WP-Total") || "0", 10);
    const activeProducts = parseInt(productsRes.headers.get("X-WP-Total") || "0", 10);
    const lowStockCount = parseInt(lowStockRes.headers.get("X-WP-Total") || "0", 10);
    const totalOrders = parseInt(allOrdersRes.headers.get("X-WP-Total") || "0", 10);
    return NextResponse.json({ totalSales: String(totalSales), ordersToday, activeProducts, lowStockCount, totalOrders });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

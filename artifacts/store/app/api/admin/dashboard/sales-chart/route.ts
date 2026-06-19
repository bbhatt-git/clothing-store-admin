import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { wooFetch } from "../../_lib/woo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await verifyRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const period = new URL(req.url).searchParams.get("period") || "7days";
  const map: Record<string, string> = { "7days": "week", "30days": "month", "90days": "quarter" };
  try {
    const res = await wooFetch(`reports/sales?period=${map[period] || "week"}&interval=day`);
    const data = res.ok ? await res.json() : [];
    const intervals = data[0]?.intervals ?? [];
    const chart = intervals.map((item: Record<string, unknown>) => ({
      date: item.date_start as string,
      sales: parseFloat((item.subtotals as Record<string, string>)?.gross_sales ?? "0"),
      orders: (item.subtotals as Record<string, number>)?.orders ?? 0,
    }));
    return NextResponse.json(chart);
  } catch {
    return NextResponse.json([]);
  }
}

import { Router, type IRouter } from "express";
import WooCommerce from "../lib/woo";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [salesRes, todayOrdersRes, productsRes, lowStockRes] = await Promise.all([
      WooCommerce.get("reports/sales", { period: "month" }),
      WooCommerce.get("orders", { after: todayISO, per_page: 1 }),
      WooCommerce.get("products", { status: "publish", per_page: 1 }),
      WooCommerce.get("products", { stock_status: "onbackorder", per_page: 1 }),
    ]);

    const salesData = salesRes.data;
    const totalSales = salesData[0]?.total_sales ?? "0.00";
    const ordersToday = parseInt(todayOrdersRes.headers?.["x-wp-total"] ?? "0", 10);
    const activeProducts = parseInt(productsRes.headers?.["x-wp-total"] ?? "0", 10);
    const lowStockCount = parseInt(lowStockRes.headers?.["x-wp-total"] ?? "0", 10);

    const allOrdersRes = await WooCommerce.get("orders", { per_page: 1 });
    const totalOrders = parseInt(allOrdersRes.headers?.["x-wp-total"] ?? "0", 10);

    const pendingRes = await WooCommerce.get("orders", { status: "pending", per_page: 1 });
    const pendingOrders = parseInt(pendingRes.headers?.["x-wp-total"] ?? "0", 10);

    res.json({
      totalSales: String(totalSales),
      ordersToday,
      activeProducts,
      lowStockCount,
      totalOrders,
      pendingOrders,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get("/dashboard/sales-chart", requireAuth, async (req, res) => {
  try {
    const period = (req.query.period as string) ?? "7days";
    const periodMap: Record<string, string> = {
      "7days": "week",
      "30days": "month",
      "90days": "quarter",
    };
    const wooPeriod = periodMap[period] ?? "week";

    const salesRes = await WooCommerce.get("reports/sales", {
      period: wooPeriod,
      interval: "day",
    });

    const data = salesRes.data;
    const intervals = data[0]?.intervals ?? [];

    const chartData = intervals.map((item: Record<string, unknown>) => ({
      date: item.date_start as string,
      sales: parseFloat((item.subtotals as Record<string, string>)?.gross_sales ?? "0"),
      orders: (item.subtotals as Record<string, number>)?.orders ?? 0,
    }));

    res.json(chartData);
  } catch (err) {
    req.log.error({ err }, "Failed to get sales chart");
    res.status(500).json({ error: "Failed to fetch sales chart data" });
  }
});

router.get("/dashboard/recent-orders", requireAuth, async (req, res) => {
  try {
    const ordersRes = await WooCommerce.get("orders", { per_page: 10, orderby: "date", order: "desc" });
    res.json(ordersRes.data);
  } catch (err) {
    req.log.error({ err }, "Failed to get recent orders");
    res.status(500).json({ error: "Failed to fetch recent orders" });
  }
});

router.get("/dashboard/low-stock", requireAuth, async (req, res) => {
  try {
    const lowStockRes = await WooCommerce.get("products", {
      stock_status: "onbackorder",
      per_page: 10,
      manage_stock: true,
    });
    res.json(lowStockRes.data);
  } catch (err) {
    req.log.error({ err }, "Failed to get low stock products");
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
});

export default router;

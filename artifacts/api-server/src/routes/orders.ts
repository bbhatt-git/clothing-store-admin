import { Router, type IRouter } from "express";
import WooCommerce from "../lib/woo";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/orders", async (req, res) => {
  try {
    const response = await WooCommerce.post("orders", req.body);
    res.status(201).json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Failed to place order" });
  }
});

router.get("/orders/:id/public", async (req, res) => {
  try {
    const response = await WooCommerce.get(`orders/${req.params.id}`);
    const order = response.data as Record<string, unknown>;
    res.json({
      id: order.id,
      number: order.number,
      status: order.status,
      date_created: order.date_created,
      total: order.total,
      line_items: order.line_items,
      billing: order.billing,
      shipping: order.shipping,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.get("/orders", requireAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 20, status, search, after, before } = req.query;
    const params: Record<string, unknown> = { page, per_page, orderby: "date", order: "desc" };
    if (status) params.status = status;
    if (search) params.search = search;
    if (after) params.after = after;
    if (before) params.before = before;

    const response = await WooCommerce.get("orders", params);
    const total = parseInt(response.headers?.["x-wp-total"] ?? "0", 10);
    const totalPages = parseInt(response.headers?.["x-wp-totalpages"] ?? "1", 10);

    res.json({ orders: response.data, total, totalPages });
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/orders/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.get(`orders/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.put("/orders/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.put(`orders/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to update order");
    res.status(500).json({ error: "Failed to update order" });
  }
});

router.delete("/orders/:id", requireAuth, async (req, res) => {
  try {
    await WooCommerce.delete(`orders/${req.params.id}`, { force: true });
    res.json({ message: "Order deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete order");
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import WooCommerce from "../lib/woo";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/coupons", requireAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 20, search } = req.query;
    const params: Record<string, unknown> = { page, per_page };
    if (search) params.search = search;

    const response = await WooCommerce.get("coupons", params);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to list coupons");
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

router.post("/coupons", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.post("coupons", req.body);
    res.status(201).json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to create coupon");
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

router.get("/coupons/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.get(`coupons/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to get coupon");
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
});

router.put("/coupons/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.put(`coupons/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to update coupon");
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

router.delete("/coupons/:id", requireAuth, async (req, res) => {
  try {
    await WooCommerce.delete(`coupons/${req.params.id}`, { force: true });
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete coupon");
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

export default router;

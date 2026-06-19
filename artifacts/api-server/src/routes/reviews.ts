import { Router, type IRouter } from "express";
import WooCommerce from "../lib/woo";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/reviews", requireAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 20, status, product } = req.query;
    const params: Record<string, unknown> = { page, per_page };
    if (status) params.status = status;
    if (product) params.product = product;

    const response = await WooCommerce.get("products/reviews", params);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to list reviews");
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.get("/reviews/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.get(`products/reviews/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to get review");
    res.status(500).json({ error: "Failed to fetch review" });
  }
});

router.put("/reviews/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.put(`products/reviews/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to update review");
    res.status(500).json({ error: "Failed to update review" });
  }
});

router.delete("/reviews/:id", requireAuth, async (req, res) => {
  try {
    await WooCommerce.delete(`products/reviews/${req.params.id}`, { force: true });
    res.json({ message: "Review deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete review");
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import WooCommerce from "../lib/woo";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/tags", requireAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 100, search } = req.query;
    const params: Record<string, unknown> = { page, per_page };
    if (search) params.search = search;

    const response = await WooCommerce.get("products/tags", params);
    const total = parseInt(response.headers?.["x-wp-total"] ?? "0", 10);
    const totalPages = parseInt(response.headers?.["x-wp-totalpages"] ?? "1", 10);

    res.json({ tags: response.data, total, totalPages });
  } catch (err) {
    req.log.error({ err }, "Failed to list tags");
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

router.post("/tags", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.post("products/tags", req.body);
    res.status(201).json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to create tag");
    res.status(500).json({ error: "Failed to create tag" });
  }
});

router.get("/tags/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.get(`products/tags/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to get tag");
    res.status(500).json({ error: "Failed to fetch tag" });
  }
});

router.put("/tags/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.put(`products/tags/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to update tag");
    res.status(500).json({ error: "Failed to update tag" });
  }
});

router.delete("/tags/:id", requireAuth, async (req, res) => {
  try {
    await WooCommerce.delete(`products/tags/${req.params.id}`, { force: true });
    res.json({ message: "Tag deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete tag");
    res.status(500).json({ error: "Failed to delete tag" });
  }
});

export default router;

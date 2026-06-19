import { Router, type IRouter } from "express";
import WooCommerce from "../lib/woo";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/categories", requireAuth, async (req, res) => {
  try {
    const { page = 1, per_page = 100, search } = req.query;
    const params: Record<string, unknown> = { page, per_page, orderby: "name" };
    if (search) params.search = search;

    const response = await WooCommerce.get("products/categories", params);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/categories", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.post("products/categories", req.body);
    res.status(201).json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.get("/categories/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.get(`products/categories/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to get category");
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

router.put("/categories/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.put(`products/categories/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to update category");
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/categories/:id", requireAuth, async (req, res) => {
  try {
    await WooCommerce.delete(`products/categories/${req.params.id}`, { force: true });
    res.json({ message: "Category deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete category");
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;

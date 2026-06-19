import { Router, type IRouter } from "express";
import WooCommerce from "../lib/woo";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  try {
    const { page = 1, per_page = 20, search, category, status, stock_status } = req.query;
    const params: Record<string, unknown> = { page, per_page, status: status ?? "publish" };
    if (search) params.search = search;
    if (category) params.category = category;
    if (stock_status) params.stock_status = stock_status;

    const response = await WooCommerce.get("products", params);
    const total = parseInt(response.headers?.["x-wp-total"] ?? "0", 10);
    const totalPages = parseInt(response.headers?.["x-wp-totalpages"] ?? "1", 10);

    res.json({ products: response.data, total, totalPages });
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/products", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.post("products", req.body);
    res.status(201).json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const response = await WooCommerce.get(`products/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.put("/products/:id", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.put(`products/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", requireAuth, async (req, res) => {
  try {
    await WooCommerce.delete(`products/${req.params.id}`, { force: true });
    res.json({ message: "Product deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.get("/products/:id/variations", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.get(`products/${req.params.id}/variations`, { per_page: 100 });
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to list variations");
    res.status(500).json({ error: "Failed to fetch variations" });
  }
});

router.post("/products/:id/variations", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.post(`products/${req.params.id}/variations`, req.body);
    res.status(201).json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to create variation");
    res.status(500).json({ error: "Failed to create variation" });
  }
});

router.put("/products/:id/variations/:variationId", requireAuth, async (req, res) => {
  try {
    const response = await WooCommerce.put(
      `products/${req.params.id}/variations/${req.params.variationId}`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    req.log.error({ err }, "Failed to update variation");
    res.status(500).json({ error: "Failed to update variation" });
  }
});

router.delete("/products/:id/variations/:variationId", requireAuth, async (req, res) => {
  try {
    await WooCommerce.delete(
      `products/${req.params.id}/variations/${req.params.variationId}`,
      { force: true }
    );
    res.json({ message: "Variation deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete variation");
    res.status(500).json({ error: "Failed to delete variation" });
  }
});

export default router;

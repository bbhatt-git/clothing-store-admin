import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

const WOO_URL = (process.env.WOOCOMMERCE_URL ?? "").replace(/\/$/, "");

router.post("/media/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const wpUser = process.env.WP_USERNAME ?? process.env.ADMIN_USERNAME ?? "admin";
    const wpPass = process.env.WP_APP_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "";
    const auth = Buffer.from(`${wpUser}:${wpPass}`).toString("base64");

    const formData = new FormData();
    const blob = new Blob([req.file.buffer as unknown as ArrayBuffer], { type: req.file.mimetype });
    formData.append("file", blob, req.file.originalname);

    const response = await fetch(`${WOO_URL}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      req.log.error({ status: response.status, body: errText }, "WP media upload failed");
      res.status(response.status).json({ error: "Media upload failed" });
      return;
    }

    const data = (await response.json()) as { id: number; source_url: string; title: { rendered: string } };
    res.json({ id: data.id, url: data.source_url, title: data.title?.rendered ?? "" });
  } catch (err) {
    req.log.error({ err }, "Failed to upload media");
    res.status(500).json({ error: "Failed to upload media" });
  }
});

export default router;

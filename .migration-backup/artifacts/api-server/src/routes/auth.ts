import { Router, type IRouter } from "express";
import { LoginBody } from "@workspace/api-zod";
import { validateCredentials, signToken, extractToken, verifyToken } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/login", (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { username, password } = parsed.data;
  if (!validateCredentials(username, password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const payload = { username, email: null };
  const token = signToken(payload);
  res.json({ token, user: payload });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

router.get("/auth/me", (req, res) => {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  res.json(payload);
});

export default router;

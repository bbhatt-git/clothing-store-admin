import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import productsRouter from "./products";
import ordersRouter from "./orders";
import categoriesRouter from "./categories";
import reviewsRouter from "./reviews";
import couponsRouter from "./coupons";
import mediaRouter from "./media";
import tagsRouter from "./tags";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(categoriesRouter);
router.use(reviewsRouter);
router.use(couponsRouter);
router.use(tagsRouter);
router.use(mediaRouter);

export default router;

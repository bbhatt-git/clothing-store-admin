import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import reviewsRouter from "./reviews";
import tagsRouter from "./tags";
import couponsRouter from "./coupons";
import mediaRouter from "./media";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(ordersRouter);
router.use(reviewsRouter);
router.use(tagsRouter);
router.use(couponsRouter);
router.use(mediaRouter);
router.use(dashboardRouter);

export default router;

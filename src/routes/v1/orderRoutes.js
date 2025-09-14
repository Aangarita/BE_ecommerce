import { Router } from "express";
import verifyToken from "../../middleware/verifyToken.js";
import orderController from "../../controllers/orderController.js";

const router = new Router;


router.use(verifyToken);

router
.post("/", orderController.createOrder)
.get("/", orderController.getOrders)
.get("/:orderId", orderController.getOrder)
.put("/:orderId", orderController.updateOrder)

export default router;
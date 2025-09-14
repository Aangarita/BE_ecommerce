import { Router } from "express";
import verifyToken from "../../middleware/verifyToken.js";
import cartController from "../../controllers/cartController.js";

const router = new Router;

router.use(verifyToken);

router
.get("/", cartController.getCart)
.post("/add", cartController.addCartItem)
.put("/item/:productId", cartController.updateCartItem)
.delete("/item/:productId", cartController.deleteCartItem)
.delete("/clear", cartController.clearCart)

export default router;
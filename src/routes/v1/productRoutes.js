import { Router } from "express";
import productController from "../../controllers/productController.js";
import verifyToken from "../../middleware/verifyToken.js";
import isAdmin from "../../middleware/isAdmin.js";
import upload from "../../middleware/upload.js";

const router = new Router;

router.use(verifyToken);

router
.get("/", productController.getProducts)
.post("/", isAdmin, upload.single("image"), productController.createProduct)
.put("/:id", isAdmin, upload.single("image"), productController.updateProduct)
.delete("/:id", isAdmin, productController.deleteProduct);


export default router;
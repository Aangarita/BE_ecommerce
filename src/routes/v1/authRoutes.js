import { Router } from "express";
import authController from "../../controllers/authController.js";
import verifyToken from "../../middleware/verifyToken.js";
import isAdmin from "../../middleware/isAdmin.js";

const router = new Router;

router
.post("/register", authController.register)
.post("/login", authController.login)
.get("/me", verifyToken, authController.getUser)
.put("/", verifyToken, authController.updateUser)
.put("/:id/role", verifyToken, isAdmin, authController.changeRole);

export default router;
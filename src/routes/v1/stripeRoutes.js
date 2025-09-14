import { Router } from "express";
import express from "express";
import stripeController from "../../controllers/stripeController.js";

const router = Router();

// Webhook de Stripe (sin verifyToken, Stripe no manda JWT)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeController.stripeWebhook
);

export default router;

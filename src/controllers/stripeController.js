import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // lo configuras en tu .env

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("⚠️  Error verificando webhook:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar los eventos importantes de Stripe
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        await prisma.order.update({
          where: { id: Number(orderId) },
          data: { status: "paid" },
        });

        console.log(`✅ Orden ${orderId} marcada como pagada`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        await prisma.order.update({
          where: { id: Number(orderId) },
          data: { status: "failed" },
        });

        console.log(`❌ Orden ${orderId} marcada como fallida`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error en webhook:", error);
    res.status(500).json({ message: "Error en webhook" });
  }
};

export default { stripeWebhook };

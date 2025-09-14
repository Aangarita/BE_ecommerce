import express, { json } from "express";
import cors from "cors";
import productRoutes from "./routes/v1/productRoutes.js";
import authRoutes from "./routes/v1/authRoutes.js";
import cartRoutes from "./routes/v1/cartRoutes.js";
import orderRoutes from "./routes/v1/orderRoutes.js";
import stripeRoutes from "./routes/v1/stripeRoutes.js";

const app = express();

// Rutas Stripe (antes de usar json())
app.use("/api/v1/stripe", stripeRoutes);

//Middlewares globales
app.use(json());
app.use(cors());

//Middleware de las Routes
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);

//Middleware para rutas no encontradas 
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada"});
});

export default app;
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createOrder = async (userId) => {
  //1. Buscar carrito
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("El carrito está vacío");
  };

  //2. Calcular total
  const total = cart.items.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0);

  //3. Crear orden en BD
  const order = await prisma.order.create({
    data: {
      userId,
      total,
      status: "pending",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: {
      items: { include: { product: true } },
    },
  });

  //4. Crear PaymentIntent en Stripe
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(total * 100), 
  currency: "usd",
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: "never", // solo acepta métodos que no requieran redirección
  },
  metadata: {
    orderId: order.id.toString(),
    userId: userId.toString(),
  },
});


  //5. Vaciar carrito despues de crear la orden
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  //6. Retornar orden y clientSecret
  return { order, clientSecret: paymentIntent.client_secret };
};

const getOrders = async (userId) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: {
      id: "desc", //Asi muestra la mas reciente primero
    },
  });
};

const getOrder = async (userId, orderId) => {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId, //Asi solo ve las ordenes de ese usuario
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
};

const updateOrder = async (userId, userRole, orderId, status) => {
  //1. Buscar la orden
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error("Orden no encontrada");

  //2. Logica segun el rol
  if (userRole !== "ADMIN") {
    if (order.userId !== userId) throw new Error("No puedes modificar esta orden");
    if (order.status !== "pending") throw new Error("Solo puedes cancelar ordenes pendientes");
    if (status !== "cancelled") throw new Error("Solo puedes cancelar tu orden");
  }

  //3. Actualizar orden
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: { include: { product: true } } },
  });

  return updatedOrder;
};



export default {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
}
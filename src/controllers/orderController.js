import orderService from "../services/orderService.js";


const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado "});
    }

    const { order, clientSecret } = await orderService.createOrder(userId);

    res.status(201).json({
      message: "Orden creada correctamente",
      order,
      clientSecret, // esto lo usa el frontend para Stripe
    });
  } catch (error) {
    console.error("Error en createOrder:", error);
    res.status(500).json({ message: error.message || "Error al crear la orden" });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado "});
    };

    const orders = await orderService.getOrders(userId);

    res.status(200).json({
      message: "Ordenes obtenidas correctamente",
      orders,
    })
  } catch (error) {
    console.error("Error en getOrders:", error);
    res.status(500).json({ message: error.message || "Error al obtener las órdenes" });
  }
};

const getOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = Number(req.params.orderId);

    if (!userId) {
      return res.status(401).json({ message: "Usuario no encontrado "});
    }

    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ message: "El ID de la orden debe ser valido "});
    }

    const order = await orderService.getOrder(userId, orderId);

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada "})
    }

    res.status(200).json({
      message: "Orden obtenida correctamente",
      order,
    });
  } catch (error) {
    console.error("Error en getOrder:", error);
    res.status(500).json({ message: error.message || "Error al obtener la orden" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const orderId = Number(req.params.orderId);
    const { status } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Id de la orden invalido" });
    }

    //Usuario normal solo podra cancelar si esta en pending
    if (userRole !== "ADMIN") {
      if (status !== "cancelled") {
        return res.status(403).json({ message: "No tienes permisos para cambiar este estado" });
      }
    }

    const order = await orderService.updateOrder(userId, userRole, orderId, status);

    res.status(200).json({
      message: "Orden actualizada correctamente",
      order,
    });
  } catch (error) {
    console.error("Error en updateOrder:", error);
    res.status(500).json({ message: error.message || "Error al actualizar la orden" });
  }
};



export default {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
}

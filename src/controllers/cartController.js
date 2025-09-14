import cartService from "../services/cartService.js";

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await cartService.getCart(userId);

    if (!data) {
      return res.json({ items: [] }); // si no tiene carrito aún
    }

    res.json(data); // carrito con sus productos
  } catch (error) {
    console.error("Error en getCart:", error);
    res.status(500).json({ message: "Error al obtener carrito" });
  }
};

const addCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    const data = await cartService.addCartItem(userId, productId, quantity);

    res.json({ message: "Producto agregado al carrito", cart: data });
  } catch (error) {
    console.error("Error en addCartItem:", error);
    res.status(500).json({ message: "Error al agregar producto al carrito" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user?.id; // usa opcional
    const productId = Number(req.params.productId);
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ message: "La cantidad debe ser un número entero mayor o igual a 0" });
    }

    const data = await cartService.updateCartItem(userId, productId, quantity);

    if (!data) {
      return res.status(404).json({ message: "Carrito o producto no encontrado" });
    }

    res.json({ message: "Cantidad actualizada", cart: data });
  } catch (error) {
    console.error("Error en updateCartItem:", error);
    res.status(500).json({ message: error.message || "Error al actualizar el item del carrito" });
  }

};

const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);

    // Validaciones
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "El productId debe existir y ser un número válido"
      });
    }
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const cart = await cartService.deleteCartItem(userId, productId);

    if (!cart) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito" });
    }

    res.status(200).json({
      message: "Item eliminado correctamente",
      cart
    });
  } catch (error) {
    console.error("Error en deleteCartItem:", error);
    res.status(500).json({
      message: error.message || "Error al eliminar el item del carrito"
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const data = await cartService.clearCart(userId);

    res.status(200).json({
      message: "Carrito vaciado correctamente",
      cart: data
    });

  }catch (error) {
    console.error("Error en clearCart:", error);
    res.status(500).json({ message: error.message || "Error al vaciar el carrito" });
  }
};









export default { 
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart,
}

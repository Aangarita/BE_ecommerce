import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getCart = async (userId) => {
  const data = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
  return data;
};

const addCartItem = async (userId, productId, quantity) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true }
  });

  if (!cart) {
    //Si no existe carrito, lo creamos vacio
    cart = await prisma.cart.create({
      data: {
        userId,
      },
      include: { items: true }
    });
  }

  //Verificar si el producto ya estaba en el carrito
  const existingItem = cart.items.find(item => item.productId === productId);

  if (existingItem) {
    //Si existe, actualizamos la cantidad
    await prisma.cartItem.update({
      where: {
        id: existingItem.id
      },
      data: {
        quantity: existingItem.quantity + quantity
      }
    });
  } else {
    //Si no existe, lo agregamos al carrito
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity
      }
    });
  }

  //Retornamos el carrito actualizado
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
};

const updateCartItem = async (userId, productId, quantity) => {

  // 1. Buscar carrito del usuario
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true }
  });


  if (!cart) {
    return null; // carrito no encontrado
  }

  // 2. Buscar el item dentro del carrito
  const cartItem = cart.items.find(item => item.productId === productId);

  if (!cartItem) {
    return null; // producto no está en el carrito
  }

  // 3. Si la cantidad es 0, eliminar el item
  if (quantity === 0) {
    await prisma.cartItem.delete({
      where: { id: cartItem.id }
    });
  } else {
    // 4. Validar stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return null; // producto no existe en la DB
    }

    if (quantity > product.stock) {
      // acá sí conviene lanzar error, porque es un caso inválido
      throw new Error("Cantidad solicitada mayor al stock disponible");
    }

    // 5. Actualizar cantidad
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity }
    });
  }

  // 6. Retornar carrito actualizado con productos
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: { include: { product: true } }
    }
  });
};

const deleteCartItem = async (userId, productId) => {
  //1. Buscar el carrito del usuario
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items:true
    }
  });

  if (!cart) {
    return null; // carrito no encontrado
  }

  //2. Buscar el item dentro del carrito
  const cartItem = cart.items.find(item => item.productId === productId);

  if (!cartItem) {
    return null; // producto no está en el carrito
  }

  //3. Borrar el item
  await prisma.cartItem.delete({
    where: { id: cartItem.id },
  })

  //4. Devolver el carrito actualizado
  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: { include: { product: true } }
    }
  });
};

const clearCart = async (userId) => {
  //1. Buscar el carrito del usuario
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items:true
    }
  });

  if (!cart) {
    return null; // carrito no encontrado
  }

  //2. Eliminar todos los items
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });

  //3. Retornar carrito vacio
  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: { include: { product: true } }
    }
  });
};




export default {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart,
};
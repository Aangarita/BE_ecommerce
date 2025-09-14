import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getProducts = async () => {
  const data = await prisma.product.findMany();
  return data;
};

const createProduct = async (body) => {
  const data = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      stock: body.stock,
      imageUrl: body.imageUrl, // importante usar el mismo nombre que en Prisma
    },
  });
  return data;
};

const updateProduct = async (body, id) => {
  const data = await prisma.product.update({
    where: {
      id: parseInt(id),
    },
    data: {
      ...body,
      price: body.price ? parseFloat(body.price) : undefined,
      stock: body.stock ? parseInt(body.stock) : undefined,
    },
  });
  return data;
};

const deleteProduct = async (id) => {
  const data = await prisma.product.delete({
    where: {
      id: parseInt(id),
    },
  });
  return data;
}

export default {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}
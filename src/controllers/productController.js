import productService from "../services/productService.js";
import cloudinary from "../utils/cloudinary.js";

const getProducts = async (req, res) => {
  const data = await productService.getProducts();
  res.send(data);
};

const createProduct = async (req, res) => {
  try {
    const body = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path; // URL de Cloudinary
    }

    const data = await productService.createProduct({
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),  // convertir a Float
      stock: parseInt(body.stock),    // convertir a Int
      imageUrl,
    });

    res.status(201).json(data);
  } catch (error) {
    console.error("Error en createProduct:", error);
    res.status(500).json({ message: "Error al crear producto" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    let imageUrl;

    // Si viene nueva imagen, súbela a Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      imageUrl = result.secure_url;
    }

    // Construimos el objeto para update
    const data = await productService.updateProduct(
      {
        ...body,
        ...(imageUrl && { imageUrl }), // solo agrega la imagen si existe
      },
      id
    );

    res.status(200).json(data);
  } catch (error) {
    console.error("Error en updateProduct:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;
  const data = await productService.deleteProduct(id);
  res.send(data);
}


export default {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}
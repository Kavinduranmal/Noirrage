import Product from '../models/product.js';

export const addProduct = async (req, res) => {
  try {
    const { name, price, description, category, sizes, colors } = req.body;

    // Check if required fields are provided
    if (!name || !price || !description || !category || !sizes || !colors) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Ensure price is a valid number
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: "Invalid price value." });
    }

    // Convert sizes and colors to arrays if needed
    const sizesArray = Array.isArray(sizes)
      ? sizes
      : sizes.split(",").map((s) => s.trim());
    const colorsArray = Array.isArray(colors)
      ? colors
      : colors.split(",").map((c) => c.trim());

    // Ensure sizes and colors are not empty
    if (sizesArray.length === 0 || colorsArray.length === 0) {
      return res
        .status(400)
        .json({ message: "Sizes and colors cannot be empty." });
    }

    // Handle multiple image uploads
    const imageUrls =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];

    // Check if at least one image is uploaded
    if (imageUrls.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required." });
    }

    // Create new product instance
    const newProduct = new Product({
      name,
      price: Number(price), // Ensure price is stored as a number
      description,
      category,
      sizes: sizesArray,
      colors: colorsArray,
      images: imageUrls,
    });

    // Save product to database
    await newProduct.save();

    return res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ Get all products (with sizes, colors, multiple images, and stock status)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().select(
      "name price description category images sizes colors inStock" // Added inStock
    );

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get single product (with sizes, colors, multiple images, and stock status)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select(
      "name price description category images sizes colors inStock" // Added inStock
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update a product (Admin only), including size and color updates
export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, colors, sizes } = req.body;

    // Convert sizes and colors to arrays
    const sizesArray = Array.isArray(sizes) ? sizes : sizes.split(",");
    const colorsArray = Array.isArray(colors) ? colors : colors.split(",");

    // Handle multiple images
    const imageUrls = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const updatedFields = {
      name,
      price,
      description,
      category,
      colors: colorsArray,
      sizes: sizesArray,
    };
    if (imageUrls.length) updatedFields.images = imageUrls;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete a product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// ✅ Mark product as Out of Stock
export const markProductOutOfStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!product.inStock) {
      return res.status(400).json({ message: "Product is already out of stock" });
    }
    product.inStock = false; // Mark as out of stock
    const updatedProduct = await product.save();
    res.json({ message: "Product marked as out of stock", product: updatedProduct });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product stock status",
      error: error.message,
    });
  }
};

// ✅ Mark product as restored
export const markProductRestored = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // If product is already in stock, then no need to restore.
    if (product.inStock) {
      return res.status(400).json({ message: "Product is already in stock" });
    }
    product.inStock = true; // Mark as in stock
    const updatedProduct = await product.save();
    res.json({ message: "Product marked as in stock", product: updatedProduct });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product stock status",
      error: error.message,
    });
  }
};



import Cart from "../models/cart.js";

// Add item to cart with quantity, size, and color
export const addToCart = async (req, res) => {
  try {
    const { productId, qty, size, color } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    // Add a new item to the cart
    cart.items.push({ product: productId, qty, size, color });

    await cart.save();
    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price sizes colors images" // Include product details for frontend
    );
    if (!cart) return res.json({ items: [] });

    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id; // From protect middleware
    const itemId = req.params.itemId;
    await Cart.updateOne(
      { user: userId },
      { $pull: { items: { _id: itemId } } }
    );
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Error removing item", error: error.message });
  }
};

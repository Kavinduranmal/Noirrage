// controllers/cartController.js
import Cart from '../models/cart.js';

// ✅ Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].qty += qty;
    } else {
      cart.items.push({ product: productId, qty });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};


export const removeFromCart = async (req, res) => {
  try {
    const userCart = await Cart.findOne({ user: req.user.id });
    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemExists = userCart.items.find((item) => item._id.toString() === req.params.itemId);

    if (!itemExists) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item
    userCart.items = userCart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await userCart.save();

    res.json({ message: "Item removed from cart", cart: userCart });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ Get User Cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart) return res.status(404).json({ message: "Cart is empty" });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

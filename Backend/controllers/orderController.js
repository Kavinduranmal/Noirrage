import Order from "../models/order.js";
import Product from "../models/product.js";
import Cart from "../models/cart.js"; // Added to clear cart after order
import mongoose from "mongoose";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noirrage.lk@gmail.com",
    pass: "Nisansala@123",
  },
});

const sendOrderConfirmationEmail = async (order) => {
  const { shippingDetails, products, totalPrice } = order;

  const productDetails = products
    .map(
      (item) =>
        `Product: ${item.product.name}\nSize: ${item.size}\nColor: ${item.color}\nQuantity: ${item.quantity}\n`
    )
    .join("\n");

  const mailOptions = {
    from: "noirrage.lk@gmail.com",
    to: shippingDetails.email,
    subject: "Order Confirmation - Your Order is Placed!",
    text: `Dear Customer,\n\nThank you for your order!\n\nOrder Details:\n${productDetails}\nTotal Price: Rs ${totalPrice}\n\nWe will update you once the order is shipped.\n\nBest regards,\nNoirRage Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


export const createOrder = async (req, res) => {
  try {
    const { shippingDetails, cartItemIds, products } = req.body;

    if (
      !shippingDetails ||
      !shippingDetails.email ||
      !shippingDetails.address ||
      !shippingDetails.contactNumber
    ) {
      return res.status(400).json({ message: "Shipping details are required" });
    }

    let orderProducts = [];
    let totalPrice = 0;
    let productDetails = []; // To store product details for email confirmation

    // Case 1: Order from cart items
    if (cartItemIds && cartItemIds.length > 0) {
      const cart = await Cart.findOne({ user: req.user._id }).populate(
        "items.product"
      );
      if (!cart || !cart.items.length) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Filter cart items based on selected IDs
      const selectedItems = cart.items.filter((item) =>
        cartItemIds.includes(item._id.toString())
      );

      if (selectedItems.length === 0) {
        return res.status(400).json({ message: "No valid cart items selected" });
      }

      for (let item of selectedItems) {
        const { product, qty, size, color } = item;

        if (!product.sizes.includes(size)) {
          return res
            .status(400)
            .json({ message: `Invalid size selected for ${product.name}` });
        }

        if (!product.colors.includes(color)) {
          return res
            .status(400)
            .json({ message: `Invalid color selected for ${product.name}` });
        }

        orderProducts.push({
          product: product._id,
          quantity: qty,
          size,
          color,
        });

        totalPrice += product.price * qty;
        productDetails.push(product); // Store product details for email
      }

      // Clear the selected items from the cart
      cart.items = cart.items.filter(
        (item) => !cartItemIds.includes(item._id.toString())
      );
      await cart.save();
    }
    // Case 2: Direct order from products array
    else if (products && products.length > 0) {
      const productIds = products.map((p) => p.product);
      const productDocs = await Product.find({ _id: { $in: productIds } });

      for (let item of products) {
        const product = productDocs.find((p) => p._id.equals(item.product));

        if (!product) {
          return res
            .status(400)
            .json({ message: `Product not found: ${item.product}` });
        }

        if (!product.sizes.includes(item.size)) {
          return res
            .status(400)
            .json({ message: `Invalid size selected for ${product.name}` });
        }

        if (!product.colors.includes(item.color)) {
          return res
            .status(400)
            .json({ message: `Invalid color selected for ${product.name}` });
        }

        orderProducts.push({
          product: product._id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        });

        totalPrice += product.price * item.quantity;
        productDetails.push(product); // Store product details for email
      }
    } else {
      return res.status(400).json({ message: "No cart items or products provided" });
    }

    const newOrder = new Order({
      user: req.user._id,
      products: orderProducts,
      totalPrice,
      shippingDetails,
      status: "Pending",
    });

    await newOrder.save();

    // Send email confirmation
    await sendOrderConfirmationEmail({
      ...newOrder.toObject(),
      products: orderProducts.map((item) => ({
        product: productDetails.find((p) => p._id.equals(item.product)),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
    });

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price sizes colors images");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const orders = await Order.find({ user: req.user._id }).populate(
      "products.product",
      "name price sizes colors images"
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const markOrderShipped = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "Shipped";
    order.shippedAt = new Date();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.findByIdAndDelete(orderId);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res
      .status(500)
      .json({ message: "Error deleting order", error: error.message });
  }
};

import Order from '../models/order.js';
import Product from '../models/product.js';
import mongoose from "mongoose";

// @desc   Create a new order
import nodemailer from "nodemailer";


// Configure Nodemailer transporter (Use a real email service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noirrage.lk@gmail.com", // Replace with your email
    pass: "Nisansala@123", // Use an App Password if using Gmail
  },
});

// Function to send order confirmation email
const sendOrderConfirmationEmail = async (order) => {
  const { shippingDetails, products, totalPrice } = order;

  // Format the product details
  const productDetails = products
    .map(
      (item) =>
        `Product: ${item.product.name}\nSize: ${item.size}\nColor: ${item.color}\nQuantity: ${item.quantity}\n`
    )
    .join("\n");

  // Email content
  const mailOptions = {
    from: "your-email@gmail.com",
    to: shippingDetails.email, // Send to user’s email
    subject: "Order Confirmation - Your Order is Placed!",
    text: `Dear Customer,\n\nThank you for your order!\n\nOrder Details:\n${productDetails}\nTotal Price: $${totalPrice}\n\nWe will update you once the order is shipped.\n\nBest regards,\nYour Store Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Modified createOrder function
export const createOrder = async (req, res) => {
  try {
    const { products, totalPrice, shippingDetails } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products selected" });
    }

    if (!shippingDetails || !shippingDetails.email || !shippingDetails.address || !shippingDetails.contactNumber) {
      return res.status(400).json({ message: "Shipping details are required" });
    }

    const orderProducts = [];
    for (let item of products) {
      const { product, size, color, quantity } = item;

      if (!size || !color) {
        return res.status(400).json({ message: "Size and color are required for each product" });
      }

      const foundProduct = await Product.findById(product);
      if (!foundProduct) {
        return res.status(400).json({ message: `Product not found for ID: ${product}` });
      }

      if (!foundProduct.sizes.includes(size)) {
        return res.status(400).json({ message: `Invalid size selected for ${foundProduct.name}` });
      }

      if (!foundProduct.colors.includes(color)) {
        return res.status(400).json({ message: `Invalid color selected for ${foundProduct.name}` });
      }

      orderProducts.push({
        product: foundProduct._id,
        quantity,
        size,
        color,
      });
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
    await sendOrderConfirmationEmail(newOrder);

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc   Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price sizes colors images"); // Include images in the response
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get user orders
export const getUserOrders = async (req, res) => {
  try {
    // Check if req.user is present
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const orders = await Order.find({ user: req.user._id }).populate(
      "products.product",
      "name price sizes colors images" // Include images in the response
    );

    // Check if no orders are found
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    // Log the error and return a more detailed message
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Mark order as Shipped
export const markOrderShipped = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status to "Shipped"
    order.status = "Shipped";
    order.shippedAt = new Date(); // Set shipped date

    const updatedOrder = await order.save();
    res.json(updatedOrder); // Respond with the updated order details
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId); // Use the ID to find the order
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.findByIdAndDelete(orderId); // Delete the order
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res
      .status(500)
      .json({ message: "Error deleting order", error: error.message });
  }
};

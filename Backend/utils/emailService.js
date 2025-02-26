import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services like SendGrid, Outlook, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // App password (NOT your actual email password)
  },
});

// Function to send order confirmation email
export const sendOrderConfirmation = async (userEmail, orderDetails) => {
  try {
    // Extract order details
    const { products, totalPrice, shippingDetails, status } = orderDetails;

    // Create a product list (excluding images)
    const productList = products
      .map(
        (item, index) =>
          `${index + 1}. ${item.product.name} - Size: ${item.size}, Color: ${item.color}, Quantity: ${item.quantity}`
      )
      .join("\n");

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Order Confirmation - Your Order Has Been Placed",
      text: `Hello,\n\nThank you for your order! Here are your order details:\n\n${productList}\n\nTotal Price: $${totalPrice}\n\nShipping Details:\nName: ${shippingDetails.name}\nAddress: ${shippingDetails.address}\nContact: ${shippingDetails.contactNumber}\n\nOrder Status: ${status}\n\nThank you for shopping with us!`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

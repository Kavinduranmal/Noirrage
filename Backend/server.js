import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import https from "https";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import payhereRoutes from "./routes/payhereRoutes.js";

// Setup environment and Express
dotenv.config();
const app = express();

// Fix for ES Module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL Certificate
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "certs/server.key")),
  cert: fs.readFileSync(path.join(__dirname, "certs/server.cert")),
};

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://16.170.141.231:3000",
      "http://13.49.246.175:3000",
      "https://13.49.246.175:3000",
      "https://noirrage.com",
      "https://api.noirrage.com", // ✅ Add this too
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// MongoDB
connectDB();

// Upload folder static access
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use("/uploads", express.static(uploadPath));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payhere", payhereRoutes);

// Start HTTPS Server
const PORT = process.env.PORT || 5000;
https.createServer(sslOptions, app).listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 HTTPS server running on https://api.noirrage.com:${PORT}`)
);

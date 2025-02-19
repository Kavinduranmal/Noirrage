import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" }, // Default should be "user"
  },
  {
    timestamps: true,
  }
);

// Ensure the model is only created once
const Admin = mongoose.models.User || mongoose.model("Admin", AdminSchema);

export default Admin;




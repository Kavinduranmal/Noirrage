import asyncHandler from "express-async-handler";
import Admin from '../models/admin.js';
import User from '../models/user.js';
import bcrypt from "bcryptjs";
import generateToken from '../utils/generateToken.js';

/**
 * @desc Register a new admin
 * @route POST /api/auth/admin/register
 * @access Public
 */
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if admin already exists
  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create admin
  const admin = await Admin.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: "admin",
  });

  if (admin) {
    res.status(201).json({
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid admin data");
  }
});

/**
 * @desc Login admin
 * @route POST /api/auth/admin/login
 * @access Public
 */
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    res.json({
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// ✅ User Signup
/**
 * @desc Register a new user
 * @route POST /api/auth/user/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (newUser) {
    res.status(201).json({
      _id: newUser.id,
      name: newUser.name, // Make sure this is returned
      email: newUser.email,
      token: generateToken(newUser._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// ✅ User Login
/**
 * @desc Login user
 * @route POST /api/auth/user/login
 * @access Public
 */

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  // Generate token
  const token = generateToken(user._id);

  res.json({
    _id: user.id,
    name: user.name,
    email: user.email,
    token,
  });
});

export { registerAdmin, loginAdmin, registerUser, loginUser };

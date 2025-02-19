import User from '../models/user.js';
import asyncHandler from "express-async-handler";


// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
    console.log(error);
  }
});


// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Fix: Define user here

    if (!user) {  // Fix here: Check req.user instead of 'user'
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
});



export { updateUserProfile, getUserProfile};

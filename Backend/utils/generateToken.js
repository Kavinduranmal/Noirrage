import jwt from "jsonwebtoken";

// Function to generate a JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin }, // Include isAdmin
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export default generateToken;

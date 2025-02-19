import User from '../models/user.js';
import jwt from "jsonwebtoken";


// ✅ Protect middleware: Checks if the user is authenticated
export const protect = async (req, res, next) => {
  let Admintoken;
  let Usertoken;

  // Check if authorization header is present and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from the header
      Admintoken = req.headers.authorization.split(" ")[1];
      Usertoken = req.headers.authorization.split(" ")[1];

      // Verify the JWT token
      const decodedforadmin = jwt.verify(Admintoken, process.env.JWT_SECRET);
      const decodedforuser = jwt.verify(Admintoken, process.env.JWT_SECRET);

      // Attach user info to the request object
      req.Admin = await User.findById(decodedforadmin.id).select("-password"); // Exclude password field
      req.user = await User.findById(decodedforuser.id).select("-password"); // Exclude password field

      // Add the isAdmin flag to the user object from the token
      if (decodedforadmin.isAdmin) {
        req.Admin.isAdmin = true; // Mark user as admin
      }
      if (decodedforuser.isUser) {
        req.user.isUser = true; // Mark user as admin
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

// ✅ Admin middleware: Checks if the user has admin privileges
export const admin = (req, res, next) => {
  next(); // Proceed to the next middleware or route handler
};



export const authenticateAdmin = async (req, res, next) => {
  try {
    const Admintoken = req.header("Authorization")?.replace("Bearer ", "");
    const Usertoken = req.header("Authorization")?.replace("Bearer ", "");

    if (!Admintoken) {
      return res.status(401).json({ message: "Authentication token required" });
    }

    if (!Usertoken) {
      return res.status(401).json({ message: "Authentication token required" });
    }

    const decodedforadmin = jwt.verify(Admintoken, process.env.JWT_SECRET);
    const Admin = await Admin.findById(decodedforadmin.userId);

    const decodedforuser = jwt.verify(Admintoken, process.env.JWT_SECRET);
    const User = await User.findById(decodedforuser.userId);

    if (!Admin) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!User) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.Admin = Admin; // Attach Admin to request
    req.Admin = User; // Attach user to request

    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};

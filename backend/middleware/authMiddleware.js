const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes via JWT token
exports.protect = async (req, res, next) => {
  try {
    // 1. Extract Token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "You are not logged in! Please log in to get access.",
      });
    }

    // 2. Validate Token (Session Timeout/Verification)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_super_secret_for_development"
    );

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        message: "The user belonging to this token no longer exists.",
      });
    }

    // 4. Check if user account is disabled using status flag
    if (currentUser.status === "disabled") {
      return res.status(403).json({
        message: "Your account has been disabled. Please contact an admin.",
      });
    }

    // Grant Access
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your session has expired! Please log in again.",
      });
    }
    return res.status(401).json({ message: "Invalid token or authorization error" });
  }
};

// Middleware to restrict access to specific roles
// Usage Example: router.get('/', protect, restrictTo('admin'), getAllUsers)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array like ['admin']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

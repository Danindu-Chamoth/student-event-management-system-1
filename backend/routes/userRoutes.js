const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ==========================
// PROTECTED ROUTES (all routes below require valid JWT)
// ==========================
router.use(protect); // Apply to all routes beneath this line

// Single Profile Operations
router.route("/profile")
  .get(userController.getProfile)
  .patch(upload.single("profileImage"), userController.updateProfile);

router.patch("/update-password", userController.updatePassword);
router.patch("/deactivate-profile", userController.deactivateProfile);

// ==========================
// ADMIN ONLY ROUTES
// ==========================
router.use(restrictTo("admin")); // Apply to all routes beneath this line

router.route("/")
  .get(userController.getAllUsers);

router.patch("/:id/status", userController.updateUserStatus);

module.exports = router;

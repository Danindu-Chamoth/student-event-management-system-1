const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ==========================
// PUBLIC ROUTES
// ==========================
router.get("/public/:id", userController.getPublicProfile);

// ==========================
// PROTECTED ROUTES (all routes below require valid JWT)
// ==========================
router.use(protect); // Apply to all routes beneath this line

// Single Profile Operations
router.route("/profile")
  .get(userController.getProfile)
  .patch(upload.single("profileImage"), userController.updateProfile);

router.post("/send-password-otp", userController.sendPasswordChangeOtp);
router.patch("/update-password", userController.updatePassword);
router.patch("/deactivate-profile", userController.deactivateProfile);

// ==========================
// ADMIN ONLY ROUTES
// ==========================
router.use(restrictTo("admin")); // Apply to all routes beneath this line

router.route("/")
  .get(userController.getAllUsers);

router.patch("/:id/status", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);

module.exports = router;

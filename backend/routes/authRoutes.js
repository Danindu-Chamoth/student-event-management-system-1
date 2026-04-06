const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const upload = require("../middleware/upload");

// ==========================
// PUBLIC ROUTES
// ==========================

// Register route supports image push via multer middleware
router.post("/register", upload.single("profileImage"), authController.register);

router.post("/login", authController.login);

router.post("/verify-otp", authController.verifyOtp);

router.post("/resend-verification", authController.resendVerification);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

module.exports = router;

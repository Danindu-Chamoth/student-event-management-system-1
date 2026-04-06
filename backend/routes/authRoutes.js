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

router.get("/verify-email/:token", authController.verifyEmail);

router.post("/forgot-password", authController.forgotPassword);

router.patch("/reset-password/:token", authController.resetPassword);

module.exports = router;

const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

// Helper to generate JWT Token
const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "default_super_secret_for_development",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d", // Session Timeout Configuration
    }
  );
};

// =============================
// REGISTER
// =============================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // 2. Create the user
    // Generate a 6-digit OTP
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || "student", // Defaults to student if not provided
      profileImage: req.file ? req.file.filename : "default-avatar.png",
      verificationToken,
      otpExpires,
    });

    const message = `Your email verification OTP is:\n\n${verificationToken}\n\nThis code will expire in 15 minutes. If you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: newUser.email,
        subject: "Verify Your Email - Evenza",
        message,
      });

      res.status(201).json({
        message: `Registration successful! OTP: ${verificationToken}`,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Registered successfully, but failed to send verification email. Please try resending." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
// VERIFY OTP
// =============================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.verificationToken !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Set verified state to true and clear the OTP payload
    user.isVerified = true;
    user.verificationToken = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Note: in a real application, you might redirect to a frontend success page
    res.status(200).json({
      message: "Email verified successfully! You may now log in.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// =============================
// RESEND VERIFICATION
// =============================
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with that email address" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    
    user.verificationToken = verificationToken;
    user.otpExpires = otpExpires;
    await user.save({ validateBeforeSave: false });

    const message = `You requested to resend your verification OTP. Your new OTP is:\n\n${verificationToken}\n\nThis code will expire in 15 minutes.`;

    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - Evenza",
      message,
    });

    res.status(200).json({ message: "Verification email sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// =============================
// LOGIN
// =============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // 2. Check if user exists & password is correct
    // Note: +password is required because we set select: false in the schema
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // 3. Verify Account Status
    if (!user.isVerified) {
      return res.status(403).json({ message: "Your email is not verified. Please verify your email first." });
    }
    if (user.status === "disabled") {
      return res.status(403).json({
        message: "This account has been disabled by an administrator.",
      });
    }



    // 5. Update last login timestamp
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // 6. Generate and send token
    const token = signToken(user._id);

    // Filter user object properties before returning it
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    };

    res.status(200).json({
      status: "success",
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
// FORGOT PASSWORD
// =============================
exports.forgotPassword = async (req, res) => {
  try {
    // 1. Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "There is no user with that email address." });
    }

    // 2. Generate the random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save token and set expiration for 1 hour
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hr timeout

    await user.save({ validateBeforeSave: false });

    // 3. Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password to:\n${resetURL}\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 1 hour)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res
        .status(500)
        .json({ message: "There was an error sending the email. Try again later!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================
// RESET PASSWORD
// =============================
exports.resetPassword = async (req, res) => {
  try {
    // 1. Get user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // 2. If token has not expired, and there is user, set the new password
    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 3. Log the user in, send JWT (or have them re-login)
    // We will just force them to log in again with new password
    res.status(200).json({
      status: "success",
      message: "Password reset correctly. Please log in with your new password.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

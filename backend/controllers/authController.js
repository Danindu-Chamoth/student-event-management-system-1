const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");
const { uploadToAzure } = require("../utils/azureBlobService");

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

// Helper to generate dynamic HTML for OTP Email
const generateOtpEmailTemplate = (otp, isResend = false) => {
  const introText = isResend 
    ? "You requested to resend your verification OTP. Please use the code below to verify your email."
    : "Thank you for joining Evenza! Please use the following One-Time Password (OTP) to complete your registration.";

  return `
    <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d0b14; color: #ffffff; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #161523; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <h2 style="color: #e555b7; font-size: 28px; margin-bottom: 10px; font-weight: 800; letter-spacing: 1px; margin-top: 0;">Evenza</h2>
        <h1 style="font-size: 22px; color: #ffffff; margin-bottom: 20px;">Verify Your Email</h1>
        
        <p style="color: #a0a0b0; font-size: 15px; margin-bottom: 30px; line-height: 1.6;">
          ${introText}
        </p>
        
        <div style="background: linear-gradient(135deg, rgba(164, 99, 242, 0.15) 0%, rgba(229, 85, 183, 0.15) 100%); border: 1px solid rgba(229, 85, 183, 0.3); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 42px; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 10px rgba(229, 85, 183, 0.5);">${otp}</h1>
        </div>
        
        <p style="color: #e0d0f5; font-size: 14px; margin-bottom: 10px; font-weight: 600;">
          This code will expire in 15 minutes.
        </p>
        
        <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 30px;">
          <p style="color: #6a6a7c; font-size: 12px; line-height: 1.5; margin: 0;">
            If you did not request this email, please ignore it.<br/>
            &copy; 2026 Evenza. The Digital Gala for University Life.
          </p>
        </div>
      </div>
    </div>
  `;
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

    // 2. Handle profile image upload to Azure
    let profileImageValue = "default-avatar.png";
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      profileImageValue = await uploadToAzure(req.file.buffer, fileName, req.file.mimetype);
    }

    // 3. Create the user
    // Generate a 6-digit OTP
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || "student", // Defaults to student if not provided
      profileImage: profileImageValue,
      verificationToken,
      otpExpires,
    });

    const message = `Your email verification OTP is:\n\n${verificationToken}\n\nThis code will expire in 15 minutes. If you did not request this, please ignore this email.`;
    const htmlMessage = generateOtpEmailTemplate(verificationToken, false);

    try {
      await sendEmail({
        email: newUser.email,
        subject: "Verify Your Email - Evenza",
        message,
        html: htmlMessage
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
    const htmlMessage = generateOtpEmailTemplate(verificationToken, true);

    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - Evenza",
      message,
      html: htmlMessage
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
      // Check if this is a legacy user from before the 6-digit OTP process
      if (!user.verificationToken || user.verificationToken.length > 6) {
        // Auto-verify legacy users transparently
        user.isVerified = true;
        // Optional cleanup
        user.verificationToken = undefined;
        user.otpExpires = undefined; 
        
        // Save the change asynchronously so we don't hold up their login
        user.save({ validateBeforeSave: false }).catch(err => console.error("Legacy user auto-verification failed:", err));
      } else {
        return res.status(403).json({ message: "Your email is not verified. Please verify your email first." });
      }
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
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide an email address." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "There is no user with that email address." });
    }

    // Generate a 6-digit OTP for Password Reset
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save token and set expiration for 15 minutes
    user.resetPasswordToken = resetOtp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const message = `You requested a password reset. Your OTP is:\n\n${resetOtp}\n\nThis code will expire in 15 minutes.`;
    const htmlMessage = generateOtpEmailTemplate(resetOtp, true).replace("Verify Your Email", "Reset Your Password");

    try {
      await sendEmail({
        email: user.email,
        subject: "Your Password Reset OTP (valid for 15 minutes)",
        message,
        html: htmlMessage
      });

      res.status(200).json({
        status: "success",
        message: "OTP sent to email!",
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
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Please provide email, OTP, and your new password." });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "OTP is invalid or has expired." });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset correctly. Please log in with your new password.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

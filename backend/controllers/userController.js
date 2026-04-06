const User = require("../models/User");
const { uploadToAzure, deleteFromAzure } = require("../utils/azureBlobService");

// ======================================
// PUBLIC PROFILE OPERATIONS
// ======================================

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name bio profileImage role status createdAt");
      
    if (!user) {
      return res.status(404).json({ message: "No user found with that ID." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================================
// SELF PROFILE MANAGEMENT OPERATIONS
// ======================================

exports.getProfile = async (req, res) => {
  try {
    // req.user is guaranteed by protect middleware
    const user = await User.findById(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // We filter out password and role updates via this generic route
    const { name, email, bio } = req.body;
    let updateData = { name, email, bio };

    // Handle profile image upload to Azure Blob Storage
    if (req.file) {
      // Delete old image from Azure if it exists
      const currentUser = await User.findById(req.user._id);
      if (currentUser.profileImage && currentUser.profileImage !== "default-avatar.png") {
        await deleteFromAzure(currentUser.profileImage);
      }

      // Upload new image to Azure
      const fileName = `${req.user._id}-${Date.now()}-${req.file.originalname}`;
      const imageUrl = await uploadToAzure(req.file.buffer, fileName, req.file.mimetype);
      updateData.profileImage = imageUrl;
    }

    // Clean undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true, // Validate email format, required inputs, etc.
    });

    res.status(200).json({
      status: "success",
      user: updatedUser,
    });
  } catch (error) {
    // If Mongo bulk duplicate constraint breaks email edit
    if (error.code === 11000) {
      return res.status(400).json({ message: "This email is already in use." });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.sendPasswordChangeOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in the resetPasswordToken fields (reuse for both flows)
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    // Send the OTP email
    const sendEmail = require("../utils/emailService");
    const message = `You requested to change your password. Your OTP is:\n\n${otp}\n\nThis code will expire in 15 minutes.`;
    const htmlMessage = `
      <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d0b14; color: #ffffff; padding: 40px 20px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #161523; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <h2 style="color: #e555b7; font-size: 28px; margin-bottom: 10px; font-weight: 800; letter-spacing: 1px; margin-top: 0;">Evenza</h2>
          <h1 style="font-size: 22px; color: #ffffff; margin-bottom: 20px;">Change Your Password</h1>
          <p style="color: #a0a0b0; font-size: 15px; margin-bottom: 30px; line-height: 1.6;">
            You requested to change your password. Please use the following OTP to confirm your identity.
          </p>
          <div style="background: linear-gradient(135deg, rgba(164, 99, 242, 0.15) 0%, rgba(229, 85, 183, 0.15) 100%); border: 1px solid rgba(229, 85, 183, 0.3); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 42px; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 10px rgba(229, 85, 183, 0.5);">${otp}</h1>
          </div>
          <p style="color: #e0d0f5; font-size: 14px; margin-bottom: 10px; font-weight: 600;">
            This code will expire in 15 minutes.
          </p>
          <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; margin-top: 30px;">
            <p style="color: #6a6a7c; font-size: 12px; line-height: 1.5; margin: 0;">
              If you did not request this, please ignore this email.<br/>
              &copy; 2026 Evenza. The Digital Gala for University Life.
            </p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Change OTP - Evenza",
      message,
      html: htmlMessage,
    });

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email address.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ message: "Please provide OTP and new password." });
    }

    // Get user with password change OTP
    const user = await User.findOne({
      _id: req.user._id,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Update password and clear OTP fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deactivateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.status = "disabled";
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Account deactivated successfully."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================================
// ADMIN ORIENTED OPERATIONS
// ======================================

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expecting "active" or "disabled"
    
    if (!status || !["active", "disabled"].includes(status)) {
      return res.status(400).json({ message: "Allowed status values are only 'active' or 'disabled'." })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "No user found with that ID." });
    }

    res.status(200).json({
      status: "success",
      message: `User Account correctly updated to ${status}.`,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "No user found with that ID." });
    }

    // Clean up Azure blob if user had a profile image
    if (user.profileImage && user.profileImage !== "default-avatar.png") {
      await deleteFromAzure(user.profileImage);
    }

    res.status(200).json({
      status: "success",
      message: "User successfully deleted"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

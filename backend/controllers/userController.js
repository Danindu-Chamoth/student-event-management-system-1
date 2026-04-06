const User = require("../models/User");

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

    if (req.file) {
      updateData.profileImage = req.file.filename;
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

exports.updatePassword = async (req, res) => {
  try {
    // 1. Get user from db (since password is removed by default, we request it back explicitly)
    const user = await User.findById(req.user._id).select("+password");

    // 2. Check if POSTed old password is correct
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({ message: "The current password you provided is incorrect." });
    }

    // 3. If so, update password
    user.password = req.body.newPassword;
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

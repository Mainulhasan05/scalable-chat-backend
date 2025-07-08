// src/controllers/admin/adminAuth.controller.js
const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin.model");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../../utils/response");

const generateAdminToken = (adminId) => {
  return jwt.sign(
    { adminId, userType: "admin" },
    process.env.JWT_ADMIN_SECRET,
    {
      expiresIn: process.env.JWT_ADMIN_EXPIRE || "1d",
    }
  );
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendErrorResponse(res, "Email and password are required", 400);
    }

    // Find admin
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin || !admin.isActive) {
      return sendErrorResponse(res, "Invalid credentials", 401);
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, "Invalid credentials", 401);
    }

    // Update last login
    admin.lastLogin = new Date();
    admin.loginHistory.push({
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    await admin.save();

    // Generate token
    const token = generateAdminToken(admin._id);

    sendSuccessResponse(res, "Admin login successful", {
      admin: admin.toJSON(),
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    sendErrorResponse(res, "Internal server error", 500);
  }
};

const adminLogout = async (req, res) => {
  try {
    sendSuccessResponse(res, "Admin logout successful");
  } catch (error) {
    sendErrorResponse(res, "Internal server error", 500);
  }
};

module.exports = { adminLogin, adminLogout };

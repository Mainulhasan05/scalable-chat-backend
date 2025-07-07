// src/middleware/adminAuth.middleware.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin.model");
const { sendErrorResponse } = require("../utils/response");

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return sendErrorResponse(res, "Access denied. No token provided.", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    const admin = await Admin.findById(decoded.adminId).select("-password");

    if (!admin || !admin.isActive) {
      return sendErrorResponse(res, "Invalid token or admin not found.", 401);
    }

    req.admin = admin;
    next();
  } catch (error) {
    return sendErrorResponse(res, "Invalid token.", 401);
  }
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (
      !req.admin.permissions.includes(permission) &&
      req.admin.role !== "super_admin"
    ) {
      return sendErrorResponse(res, "Insufficient permissions.", 403);
    }
    next();
  };
};

module.exports = { authenticateAdmin, checkPermission };

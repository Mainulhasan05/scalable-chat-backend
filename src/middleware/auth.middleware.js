// src/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { sendErrorResponse } = require("../utils/response");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return sendErrorResponse(res, "Access denied. No token provided.", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return sendErrorResponse(res, "Invalid token or user not found.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendErrorResponse(res, "Invalid token.", 401);
  }
};

module.exports = { authenticateUser };

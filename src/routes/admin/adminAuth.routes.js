// src/routes/admin/adminAuth.routes.js
const express = require("express");
const {
  adminLogin,
  adminLogout,
} = require("../../controllers/admin/adminAuth.controller");
const { authenticateAdmin } = require("../../middleware/adminAuth.middleware");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Rate limiting for admin auth
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // More restrictive for admin
  message: "Too many admin authentication attempts, please try again later.",
});

router.post("/login", adminAuthLimiter, adminLogin);
router.post("/logout", authenticateAdmin, adminLogout);

module.exports = router;

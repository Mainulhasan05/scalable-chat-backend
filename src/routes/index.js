// src/routes/index.js
const express = require("express");
const userRoutes = require("./user");
const adminRoutes = require("./admin");

const router = express.Router();

// User routes
router.use("/user", userRoutes);

// Admin routes
router.use("/admin", adminRoutes);

module.exports = router;

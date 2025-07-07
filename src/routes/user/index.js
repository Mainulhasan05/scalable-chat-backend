// src/routes/user/index.js
const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const chatRoutes = require("./chat.routes");
const messageRoutes = require("./message.routes");
const { authenticateUser } = require("../../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.use("/auth", authRoutes);

// Protected routes
router.use("/profile", authenticateUser, userRoutes);
router.use("/chats", authenticateUser, chatRoutes);
router.use("/messages", authenticateUser, messageRoutes);

module.exports = router;

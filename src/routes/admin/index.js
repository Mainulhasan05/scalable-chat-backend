// src/routes/admin/index.js
const express = require("express");
const adminAuthRoutes = require("./adminAuth.routes");
const adminUserRoutes = require("./adminUser.routes");
const adminChatRoutes = require("./adminChat.routes");
const { authenticateAdmin } = require("../../middleware/adminAuth.middleware");

const router = express.Router();

// Public admin routes
router.use("/auth", adminAuthRoutes);

// Protected admin routes
router.use("/users", authenticateAdmin, adminUserRoutes);
router.use("/chats", authenticateAdmin, adminChatRoutes);

module.exports = router;

// src/routes/admin/adminChat.routes.js
const express = require("express");
const {
  getAllChats,
  getChatById,
  deleteChat,
  getChatAnalytics,
} = require("../../controllers/admin/adminChat.controller");
const { checkPermission } = require("../../middleware/adminAuth.middleware");

const router = express.Router();

router.get("/", checkPermission("read_chats"), getAllChats);
router.get("/analytics", checkPermission("read_chats"), getChatAnalytics);
router.get("/:chatId", checkPermission("read_chats"), getChatById);
router.delete("/:chatId", checkPermission("moderate_chats"), deleteChat);

module.exports = router;

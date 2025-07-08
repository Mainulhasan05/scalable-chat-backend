// src/routes/user/message.routes.js
const express = require("express");
const {
  sendMessage,
  getChatMessages,
  markMessageAsRead,
} = require("../../controllers/user/message.controller");

const router = express.Router();

router.post("/", sendMessage);
router.get("/chat/:chatId", getChatMessages);
router.put("/:messageId/read", markMessageAsRead);

module.exports = router;

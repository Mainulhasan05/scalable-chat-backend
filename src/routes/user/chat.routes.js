// src/routes/user/chat.routes.js
const express = require("express");
const {
  createChat,
  getUserChats,
  getChatById,
  addParticipant,
} = require("../../controllers/user/chat.controller");

const router = express.Router();

router.post("/", createChat);
router.get("/", getUserChats);
router.get("/:chatId", getChatById);
router.post("/:chatId/participants", addParticipant);

module.exports = router;

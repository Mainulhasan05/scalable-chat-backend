// src/controllers/admin/adminChat.controller.js
const Chat = require("../../models/Chat.model");
const Message = require("../../models/Message.model");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../../utils/response");

const getAllChats = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    let filter = {};
    if (type) {
      filter.type = type;
    }

    const chats = await Chat.find(filter)
      .populate(
        "participants.user",
        "username profile.firstName profile.lastName"
      )
      .populate("lastMessage")
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Chat.countDocuments(filter);

    sendSuccessResponse(res, "Chats retrieved successfully", {
      chats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get chats error:", error);
    sendErrorResponse(res, "Internal server error", 500);
  }
};

const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate(
        "participants.user",
        "username profile.firstName profile.lastName profile.avatar"
      )
      .populate("lastMessage");

    if (!chat) {
      return sendErrorResponse(res, "Chat not found", 404);
    }

    // Get recent messages
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username profile.firstName profile.lastName")
      .sort({ createdAt: -1 })
      .limit(50);

    sendSuccessResponse(res, "Chat retrieved successfully", {
      chat,
      recentMessages: messages.reverse(),
    });
  } catch (error) {
    console.error("Get chat error:", error);
    sendErrorResponse(res, "Internal server error", 500);
  }
};

const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByIdAndDelete(chatId);

    if (!chat) {
      return sendErrorResponse(res, "Chat not found", 404);
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });

    sendSuccessResponse(res, "Chat deleted successfully");
  } catch (error) {
    console.error("Delete chat error:", error);
    sendErrorResponse(res, "Internal server error", 500);
  }
};

const getChatAnalytics = async (req, res) => {
  try {
    const totalChats = await Chat.countDocuments();
    const activeChats = await Chat.countDocuments({ isActive: true });

    const chatsByType = await Chat.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalMessages = await Message.countDocuments();
    const messagesLast24h = await Message.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    sendSuccessResponse(res, "Chat analytics retrieved successfully", {
      totalChats,
      activeChats,
      chatsByType,
      totalMessages,
      messagesLast24h,
    });
  } catch (error) {
    console.error("Get chat analytics error:", error);
    sendErrorResponse(res, "Internal server error", 500);
  }
};

module.exports = {
  getAllChats,
  getChatById,
  deleteChat,
  getChatAnalytics,
};

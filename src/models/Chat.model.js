// src/models/Chat.model.js
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["direct", "group", "channel"],
      required: true,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ["member", "admin", "owner"],
          default: "member",
        },
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      isPrivate: {
        type: Boolean,
        default: false,
      },
      allowFileSharing: {
        type: Boolean,
        default: true,
      },
      maxParticipants: {
        type: Number,
        default: 100,
      },
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ type: 1 });
chatSchema.index({ "participants.user": 1 });
chatSchema.index({ lastActivity: -1 });

module.exports = mongoose.model("Chat", chatSchema);

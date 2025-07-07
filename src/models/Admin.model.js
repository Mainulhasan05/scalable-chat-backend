// src/models/Admin.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "moderator"],
      default: "admin",
    },
    permissions: [
      {
        type: String,
        enum: [
          "read_users",
          "write_users",
          "delete_users",
          "read_chats",
          "moderate_chats",
          "system_settings",
        ],
      },
    ],
    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    loginHistory: [
      {
        ip: String,
        userAgent: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(
    parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
  );
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);

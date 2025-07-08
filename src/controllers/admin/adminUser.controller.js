// src/controllers/admin/adminUser.controller.js
const User = require("../../models/User.model");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../../utils/response");

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    let filter = {};

    if (status) {
      filter["profile.status"] = status;
    }

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    sendSuccessResponse(res, "Users retrieved successfully", {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    sendErrorResponse(res, "Internal server error", 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password")
      .populate("chats", "name type lastActivity");

    if (!user) {
      return sendErrorResponse(res, "User not found", 404);
    }

    sendSuccessResponse(res, "User retrieved successfully", user);
  } catch (error) {
    console.error("Get user error:", error);
    sendErrorResponse(res, "Internal server error", 500);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return sendErrorResponse(res, "User not found", 404);
    }

    sendSuccessResponse(res, "User status updated successfully", user);
  } catch (error) {
    console.error("Update user status error:", error);
    sendErrorResponse(res, "Internal server error", 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return sendErrorResponse(res, "User not found", 404);
    }

    sendSuccessResponse(res, "User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    sendErrorResponse(res, "Internal server error", 500);
  }
};

const getUserAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const onlineUsers = await User.countDocuments({
      "profile.status": "online",
    });

    const usersByStatus = await User.aggregate([
      {
        $group: {
          _id: "$profile.status",
          count: { $sum: 1 },
        },
      },
    ]);

    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    sendSuccessResponse(res, "User analytics retrieved successfully", {
      totalUsers,
      activeUsers,
      onlineUsers,
      usersByStatus,
      recentRegistrations,
    });
  } catch (error) {
    console.error("Get user analytics error:", error);
    sendErrorResponse(res, "Internal server error", 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserAnalytics,
};

// src/routes/admin/adminUser.routes.js
const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserAnalytics,
} = require("../../controllers/admin/adminUser.controller");
const { checkPermission } = require("../../middleware/adminAuth.middleware");

const router = express.Router();

router.get("/", checkPermission("read_users"), getAllUsers);
router.get("/analytics", checkPermission("read_users"), getUserAnalytics);
router.get("/:userId", checkPermission("read_users"), getUserById);
router.put("/:userId/status", checkPermission("write_users"), updateUserStatus);
router.delete("/:userId", checkPermission("delete_users"), deleteUser);

module.exports = router;

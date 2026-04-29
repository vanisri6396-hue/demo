const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// ✅ CORRECT PATH
router.get(
  "/dashboard",
  verifyToken,
  allowRoles("admin"),
  controller.getDashboard
);

module.exports = router;
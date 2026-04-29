const express = require("express");
const router = express.Router();

const controller = require("../controllers/qrController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

router.post(
  "/start",
  verifyToken,
  allowRoles("teacher"),
  controller.startQR
);

module.exports = router;
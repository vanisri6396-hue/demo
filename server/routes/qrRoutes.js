const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/qrController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// Start QR session (teacher only)
router.post("/start",   verifyToken, allowRoles("teacher","classIncharge"), ctrl.startQR);

// Stop QR session early (teacher only)
router.post("/stop",    verifyToken, allowRoles("teacher","classIncharge"), ctrl.stopQR);

// Session history (teacher)
router.get("/history",  verifyToken, allowRoles("teacher","classIncharge","admin","authority"), ctrl.getSessionHistory);

module.exports = router;
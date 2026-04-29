const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/authorityController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// HOD or Admin or Authority role
const authorityGuard = allowRoles("authority", "admin");

router.get("/pending", verifyToken, authorityGuard, ctrl.getPendingRequests);
router.post("/review", verifyToken, authorityGuard, ctrl.reviewRequest);
router.get("/monthly-report", verifyToken, authorityGuard, ctrl.getMonthlyReport);

module.exports = router;

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/authorityController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// HOD, Admin, or Class Incharge
const authorityGuard = allowRoles("authority", "admin", "classIncharge");

router.get("/pending", verifyToken, authorityGuard, ctrl.getPendingRequests);
router.post("/review", verifyToken, authorityGuard, ctrl.reviewRequest);
router.get("/monthly-report", verifyToken, authorityGuard, ctrl.getMonthlyReport);

module.exports = router;

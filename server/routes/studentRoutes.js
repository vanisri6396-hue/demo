const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/studentController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const studentGuard = allowRoles("student");

router.get("/profile",             verifyToken, studentGuard, ctrl.getProfile);
router.get("/attendance",          verifyToken, studentGuard, ctrl.getMyAttendance);
router.get("/attendance/summary",  verifyToken, studentGuard, ctrl.getMyAttendanceSummary);
router.get("/dashboard",           verifyToken, studentGuard, ctrl.getDashboardData);
router.get("/leaves",              verifyToken, studentGuard, ctrl.getMyLeaves);

module.exports = router;

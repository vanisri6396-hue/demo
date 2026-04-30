const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/attendanceController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// Student scans QR (no auth required to allow guest scan with studentId in body,
// but verifyToken is recommended — kept flexible)
router.post("/scan", verifyToken, allowRoles("student"), ctrl.scanQR);

// Student's own history
router.get("/my",    verifyToken, allowRoles("student"), ctrl.getMyAttendance);

// Attendance % for a subject (student)
router.get("/percent/:subjectId", verifyToken, allowRoles("student"), ctrl.getAttendancePercent);

// Absent list for a session (teacher/admin)
router.get("/absent/:sessionId",  verifyToken, allowRoles("teacher","classIncharge","admin","authority"), ctrl.getAbsentStudents);

module.exports = router;
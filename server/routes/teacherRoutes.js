const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/teacherController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const teacherGuard = allowRoles("teacher","classIncharge","admin","authority");

router.get("/classes",                              verifyToken, teacherGuard, ctrl.getMyClasses);
router.get("/classes/:classId/students",            verifyToken, teacherGuard, ctrl.getClassStudents);
router.get("/subjects",                             verifyToken, teacherGuard, ctrl.getMySubjects);
router.get("/subjects/:subjectId/attendance",       verifyToken, teacherGuard, ctrl.getAttendanceBySubject);
router.get("/students/:studentId/percent/:subjectId", verifyToken, teacherGuard, ctrl.getStudentAttendancePercent);
router.get("/sessions",                             verifyToken, teacherGuard, ctrl.getSessionHistory);

module.exports = router;

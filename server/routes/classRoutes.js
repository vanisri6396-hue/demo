const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/classController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const adminGuard   = allowRoles("admin");
const staffGuard   = allowRoles("admin","authority","classIncharge","teacher");

// ── Classes ──────────────────────────────────────────────────────────────
router.post("/",                     verifyToken, adminGuard,  ctrl.createClass);
router.get("/",                      verifyToken, staffGuard,  ctrl.getClasses);
router.get("/:id",                   verifyToken, staffGuard,  ctrl.getClassById);
router.put("/:id",                   verifyToken, adminGuard,  ctrl.updateClass);
router.delete("/:id",                verifyToken, adminGuard,  ctrl.deleteClass);
router.post("/:id/students/add",     verifyToken, adminGuard,  ctrl.addStudentToClass);
router.post("/:id/students/remove",  verifyToken, adminGuard,  ctrl.removeStudentFromClass);
router.get("/:id/attendance",        verifyToken, staffGuard,  ctrl.getClassAttendanceSummary);

// ── Subjects ─────────────────────────────────────────────────────────────
router.post("/subjects",             verifyToken, adminGuard,  ctrl.createSubject);
router.get("/subjects/list",         verifyToken, staffGuard,  ctrl.getSubjects);
router.patch("/subjects/:id/assign", verifyToken, adminGuard,  ctrl.assignTeacher);

module.exports = router;

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/adminController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const adminOrAuthority = allowRoles("admin","authority","superadmin");

router.get("/dashboard",              verifyToken, adminOrAuthority, ctrl.getDashboard);
router.get("/users",                  verifyToken, adminOrAuthority, ctrl.getAllUsers);
router.post("/users",                 verifyToken, allowRoles("admin"), ctrl.createUser);
router.delete("/users/:id",           verifyToken, allowRoles("admin"), ctrl.deleteUser);
router.patch("/users/:id/toggle",     verifyToken, allowRoles("admin"), ctrl.toggleUserActive);
router.get("/report",                 verifyToken, adminOrAuthority, ctrl.getAttendanceReport);
router.get("/attendance/school/:schoolId", verifyToken, adminOrAuthority, ctrl.getSchoolAttendance);
router.get("/attendance/department/:deptId", verifyToken, adminOrAuthority, ctrl.getDepartmentAttendance);
router.get("/attendance/class/:classId", verifyToken, adminOrAuthority, ctrl.getClassAttendance);
router.get("/hierarchy", verifyToken, adminOrAuthority, ctrl.getUniversityHierarchy);
router.post("/seed-university", verifyToken, allowRoles("admin"), ctrl.seedUniversityData);

module.exports = router;
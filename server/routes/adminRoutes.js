const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/adminController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const adminOrAuthority = allowRoles("admin","authority");

router.get("/dashboard",              verifyToken, adminOrAuthority, ctrl.getDashboard);
router.get("/users",                  verifyToken, adminOrAuthority, ctrl.getAllUsers);
router.post("/users",                 verifyToken, allowRoles("admin"), ctrl.createUser);
router.delete("/users/:id",           verifyToken, allowRoles("admin"), ctrl.deleteUser);
router.patch("/users/:id/toggle",     verifyToken, allowRoles("admin"), ctrl.toggleUserActive);
router.get("/report",                 verifyToken, adminOrAuthority, ctrl.getAttendanceReport);

module.exports = router;
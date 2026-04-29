const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/leaveController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// Student submits
router.post("/submit",         verifyToken, allowRoles("student"), ctrl.submitLeave);

// Student views own
router.get("/mine",            verifyToken, allowRoles("student"), ctrl.getMyLeaves);

// Teacher/admin reviews
router.patch("/:id/review",    verifyToken, allowRoles("teacher","classIncharge","admin"), ctrl.reviewLeave);

// Teacher/admin sees pending
router.get("/pending",         verifyToken, allowRoles("teacher","classIncharge","admin","authority"), ctrl.getPendingLeaves);

// Admin sees all
router.get("/all",             verifyToken, allowRoles("admin","authority"), ctrl.getAllLeaves);

module.exports = router;

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/eventController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// Students can only view
router.get("/", verifyToken, ctrl.getAllEvents);

// Admin/HOD can manage
router.post("/", verifyToken, allowRoles("admin", "authority"), ctrl.createEvent);
router.delete("/:id", verifyToken, allowRoles("admin", "authority"), ctrl.deleteEvent);

module.exports = router;

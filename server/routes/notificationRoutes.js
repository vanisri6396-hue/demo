const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/",              verifyToken, ctrl.getMyNotifications);
router.patch("/:id/read",    verifyToken, ctrl.markRead);
router.patch("/read-all",    verifyToken, ctrl.markAllRead);
router.delete("/:id",        verifyToken, ctrl.deleteNotification);

module.exports = router;

const Notification = require("../models/Notification");

/* ─── GET MY NOTIFICATIONS ───────────────────────────────────────────── */
exports.getMyNotifications = async (req, res) => {
  try {
    const { limit = 30, unreadOnly } = req.query;
    const filter = { userId: req.user.id };
    if (unreadOnly === "true") filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications ❌" });
  }
};

/* ─── MARK AS READ ───────────────────────────────────────────────────── */
exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true }
    );
    res.json({ message: "Marked as read ✅" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark read ❌" });
  }
};

/* ─── MARK ALL READ ──────────────────────────────────────────────────── */
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ message: "All marked as read ✅" });
  } catch (err) {
    res.status(500).json({ message: "Failed ❌" });
  }
};

/* ─── DELETE NOTIFICATION ────────────────────────────────────────────── */
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed ❌" });
  }
};

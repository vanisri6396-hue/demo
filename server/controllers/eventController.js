const Event = require("../models/Event");

/* ─── GET ALL EVENTS ─────────────────────────────────────────────────── */
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

/* ─── CREATE EVENT (Admin only) ───────────────────────────────────────── */
exports.createEvent = async (req, res) => {
  try {
    const { name, date, organizer, category, description } = req.body;
    const event = await Event.create({ name, date, organizer, category, description });
    res.status(201).json({ message: "Event created ✅", event });
  } catch (err) {
    res.status(500).json({ message: "Create event failed" });
  }
};

/* ─── DELETE EVENT (Admin only) ───────────────────────────────────────── */
exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

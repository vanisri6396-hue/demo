const Attendance = require("../models/Attendance");
const QRSession  = require("../models/QRSession");
const User       = require("../models/User");

/* ─── Haversine distance (metres) ────────────────────────────────────── */
function getDistance(lat1, lon1, lat2, lon2) {
  const R  = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a  =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const lastLocations = {};

/* ─── SCAN QR ─────────────────────────────────────────────────────── */
exports.scanQR = async (req, res) => {
  try {
    const qr        = req.body.qr || req.body.qrValue;
    const { lat, lng } = req.body;
    const studentId = req.body.studentId || req.user?.id;

    if (!qr)       return res.status(400).json({ message: "QR code required ❌" });
    if (!lat||!lng) return res.status(400).json({ message: "Location required ❌" });

    const session = await QRSession.findOne({ currentQR: qr, isActive: true });
    if (!session) return res.status(400).json({ message: "Invalid or expired QR ❌" });

    const distance = getDistance(lat, lng, session.teacherLat, session.teacherLng);

    if (distance > session.radius) {
      return res.status(403).json({
        message: `Too far ❌ (${Math.round(distance)}m — allowed: ${session.radius}m)`
      });
    }

    const now = Date.now();
    if (lastLocations[studentId]) {
      const prev  = lastLocations[studentId];
      const speed = getDistance(prev.lat, prev.lng, lat, lng) / ((now - prev.time) / 1000);
      if (speed > 50) return res.status(403).json({ message: "Fake GPS detected 🚫" });
    }
    lastLocations[studentId] = { lat, lng, time: now };

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found ❌" });

    const today = new Date().toISOString().split("T")[0];

    const alreadyMarked = await Attendance.findOne({ studentId: student._id, sessionId: session._id });
    if (alreadyMarked) {
      return res.status(409).json({ message: "Already marked ✅", distance: Math.round(distance) });
    }

    await Attendance.create({
      studentId: student._id,
      sessionId: session._id,
      subjectId: session.subjectId || null,
      classId:   session.classId   || null,
      name:      student.name,
      rollNo:    student.rollNo,
      className: student.section || "",
      date:      today,
      status:    "present",
      type:      session.type || "regular",
      distance:  Math.round(distance),
      timestamp: new Date()
    });

    await QRSession.findByIdAndUpdate(session._id, {
      $addToSet: { presentStudents: student._id }
    });

    const updatedSession = await QRSession.findById(session._id)
      .populate("presentStudents", "name rollNo section");

    const presentList = (updatedSession.presentStudents || []).map((s) => ({
      _id: s._id, name: s.name, rollNo: s.rollNo, distance: Math.round(distance)
    }));

    global.io.emit("attendance-update", { sessionId: session._id, present: presentList });

    res.json({ message: "Attendance marked ✅", distance: Math.round(distance) });

  } catch (err) {
    console.error("scanQR error:", err);
    res.status(500).json({ message: "Scan failed ❌" });
  }
};

/* ─── MY ATTENDANCE HISTORY (student) ───────────────────────────────── */
exports.getMyAttendance = async (req, res) => {
  try {
    const filter = { studentId: req.user.id };
    const { subjectId, startDate, endDate, limit = 50 } = req.query;
    if (subjectId) filter.subjectId = subjectId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate)   filter.date.$lte = endDate;
    }
    const records = await Attendance.find(filter)
      .sort({ date: -1 }).limit(Number(limit))
      .populate("subjectId", "name code")
      .populate("sessionId", "type createdAt");
    res.json({ records, total: records.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance ❌" });
  }
};

/* ─── ATTENDANCE % PER SUBJECT (student) ────────────────────────────── */
exports.getAttendancePercent = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const studentId = req.user.id;
    const total   = await Attendance.countDocuments({ studentId, subjectId });
    const present = await Attendance.countDocuments({ studentId, subjectId, status: "present" });
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    res.json({ subjectId, total, present, percent });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate ❌" });
  }
};

/* ─── ABSENT LIST FOR A SESSION (teacher) ───────────────────────────── */
exports.getAbsentStudents = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const records = await Attendance.find({ sessionId, status: "absent" })
      .populate("studentId", "name rollNo section");
    res.json({ absent: records });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch absent list ❌" });
  }
};
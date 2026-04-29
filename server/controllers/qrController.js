const mongoose = require("mongoose");
const crypto = require("crypto");
const QRSession = require("../models/QRSession");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Subject = require("../models/Subject");
const Class = require("../models/Class");

// Per-teacher interval map (prevents multiple timers)
const qrIntervals = {};

/* ─── Helpers ────────────────────────────────────────────────────────── */
function generateQR() {
  return crypto.randomBytes(12).toString("hex");
}

function randomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Schedule next QR rotation (3–4 seconds, random)
function scheduleNextRotation(teacherId, sessionId) {
  const delay = randomInterval(3000, 4000);

  qrIntervals[teacherId] = setTimeout(async () => {
    try {
      const session = await QRSession.findById(sessionId);
      if (!session || !session.isActive) return;

      const newQR = generateQR();
      session.currentQR = newQR;
      await session.save();

      global.io.emit("qr-update", { qr: newQR, sessionId });
      console.log(`🔄 QR rotated for teacher ${teacherId}: ${newQR}`);

      // Schedule next rotation
      scheduleNextRotation(teacherId, sessionId);
    } catch (err) {
      console.error("QR rotation error:", err);
    }
  }, delay);
}

/* ─── START QR SESSION ───────────────────────────────────────────────── */
exports.startQR = async (req, res) => {
  try {
    const { lat, lng, radius, classId, subjectId, type } = req.body;
    const teacherId = req.user.id;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Teacher location required ❌" });
    }

    // Validate ObjectIDs to prevent CastError
    const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
    const validClassId = isValidId(classId) ? classId : null;
    const validSubjectId = isValidId(subjectId) ? subjectId : null;

    // Clear any existing timer for this teacher
    if (qrIntervals[teacherId]) {
      clearTimeout(qrIntervals[teacherId]);
      delete qrIntervals[teacherId];
    }

    // Deactivate any previous active session for this teacher
    await QRSession.updateMany(
      { teacherId, isActive: true },
      { isActive: false }
    );

    const firstQR  = generateQR();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    const session = await QRSession.create({
      teacherId,
      classId:    validClassId,
      subjectId:  validSubjectId,
      currentQR:  firstQR,
      expiresAt,
      teacherLat: lat,
      teacherLng: lng,
      radius:     radius || 50,
      type:       type   || "regular",
      isActive:   true,
      presentStudents: []
    });

    // Store session info globally for fast access during scan
    global.activeSessions = global.activeSessions || {};
    global.activeSessions[session._id.toString()] = {
      teacherLat: lat,
      teacherLng: lng,
      radius: radius || 50,
      currentQR: firstQR
    };

    // Emit first QR
    global.io.emit("qr-update", { qr: firstQR, sessionId: session._id });
    console.log(`✅ QR session started. First QR: ${firstQR}`);

    // Increment subject totalClasses
    if (validSubjectId) {
      await Subject.findByIdAndUpdate(validSubjectId, { $inc: { totalClasses: 1 } });
    }

    // Start rotating QR
    scheduleNextRotation(teacherId, session._id);

    // ── Auto-absent timer (2 minutes) ──────────────────────────────────
    setTimeout(async () => {
      try {
        clearTimeout(qrIntervals[teacherId]);
        delete qrIntervals[teacherId];

        // Mark session inactive
        await QRSession.findByIdAndUpdate(session._id, { isActive: false });

        const freshSession = await QRSession.findById(session._id);

        // Find all class students
        let allStudents = [];
        if (validClassId) {
          const cls = await Class.findById(validClassId).populate("students");
          allStudents = cls ? cls.students : [];
        } else {
          allStudents = await User.find({ role: "student" });
        }

        const today = new Date().toISOString().split("T")[0];
        const presentIds = (freshSession.presentStudents || []).map((id) =>
          id.toString()
        );

        const absentStudents = allStudents.filter(
          (s) => !presentIds.includes(s._id.toString())
        );

        // Save absent records to DB
        const absentDocs = absentStudents.map((s) => ({
          studentId:  s._id,
          sessionId:  session._id,
          subjectId:  validSubjectId,
          classId:    validClassId,
          name:       s.name,
          rollNo:     s.rollNo,
          className:  s.section || "",
          date:       today,
          status:     "absent",
          type:       type || "regular"
        }));

        if (absentDocs.length > 0) {
          await Attendance.insertMany(absentDocs, { ordered: false }).catch(() => {});
        }

        // Emit final result
        global.io.emit("attendance-final", {
          sessionId:      session._id,
          present:        freshSession.presentStudents,
          absent:         absentStudents,
          presentCount:   presentIds.length,
          absentCount:    absentStudents.length
        });

        console.log(`⏱ Session ${session._id} ended. Absent: ${absentStudents.length}`);

        // Clean up global cache
        if (global.activeSessions) {
          delete global.activeSessions[session._id.toString()];
        }

      } catch (err) {
        console.error("Auto-absent timer error:", err);
      }
    }, 2 * 60 * 1000); // 2 minutes

    res.json({
      message:   "QR session started ✅",
      sessionId: session._id,
      expiresAt
    });

  } catch (err) {
    console.error("startQR error:", err);
    res.status(500).json({ message: "Failed to start QR session ❌" });
  }
};

/* ─── STOP QR SESSION (manual) ───────────────────────────────────────── */
exports.stopQR = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const teacherId = req.user.id;

    if (qrIntervals[teacherId]) {
      clearTimeout(qrIntervals[teacherId]);
      delete qrIntervals[teacherId];
    }

    await QRSession.findByIdAndUpdate(sessionId, { isActive: false });

    if (global.activeSessions && global.activeSessions[sessionId]) {
      delete global.activeSessions[sessionId];
    }

    global.io.emit("session-stopped", { sessionId });

    res.json({ message: "Session stopped ✅" });
  } catch (err) {
    console.error("stopQR error:", err);
    res.status(500).json({ message: "Failed to stop session ❌" });
  }
};

/* ─── GET SESSION HISTORY ─────────────────────────────────────────────── */
exports.getSessionHistory = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { limit = 20, page = 1 } = req.query;

    const sessions = await QRSession.find({ teacherId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("classId", "name section department")
      .populate("subjectId", "name code");

    const total = await QRSession.countDocuments({ teacherId });

    res.json({ sessions, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("getSessionHistory error:", err);
    res.status(500).json({ message: "Failed to fetch session history ❌" });
  }
};
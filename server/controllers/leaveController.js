const LeaveRequest   = require("../models/LeaveRequest");
const Attendance     = require("../models/Attendance");
const Notification   = require("../models/Notification");
const User           = require("../models/User");

/* ─── SUBMIT LEAVE REQUEST (student) ────────────────────────────────── */
exports.submitLeave = async (req, res) => {
  try {
    const { type, date, reason, proofUrl, subjectId, classId, sessionId } = req.body;
    const studentId = req.user.id;

    if (!type || !date || !reason) {
      return res.status(400).json({ message: "Type, date and reason are required ❌" });
    }
    if (!["onDuty","medical"].includes(type)) {
      return res.status(400).json({ message: "Type must be onDuty or medical ❌" });
    }

    // Prevent duplicate request
    const existing = await LeaveRequest.findOne({ studentId, date, type, subjectId });
    if (existing) {
      return res.status(409).json({ message: "Leave request already submitted ❌" });
    }

    const leave = await LeaveRequest.create({
      studentId, type, date, reason,
      proofUrl:  proofUrl  || "",
      subjectId: subjectId || null,
      classId:   classId   || null,
      sessionId: sessionId || null,
      status:    "pending"
    });

    // Notify teachers of this class
    if (classId) {
      const Class = require("../models/Class");
      // Find teachers for the class via Subject
      const Subject = require("../models/Subject");
      const subjects = await Subject.find({ classId }).distinct("teacher");
      await Notification.insertMany(subjects.map((tId) => ({
        userId:  tId,
        title:   `New ${type === "onDuty" ? "On-Duty" : "Medical"} Request`,
        message: `A student submitted a ${type} request for ${date}`,
        type:    "leave",
        meta:    { leaveId: leave._id }
      })));
    }

    res.status(201).json({ message: "Leave request submitted ✅", leave });
  } catch (err) {
    console.error("submitLeave error:", err);
    res.status(500).json({ message: "Failed to submit leave ❌" });
  }
};

/* ─── REVIEW LEAVE (teacher / classIncharge / admin) ────────────────── */
exports.reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;

    if (!["approved","rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected ❌" });
    }

    const leave = await LeaveRequest.findById(id).populate("studentId", "name rollNo");
    if (!leave) return res.status(404).json({ message: "Leave request not found ❌" });

    leave.status     = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    leave.reviewNote = reviewNote || "";
    await leave.save();

    // If approved → upsert attendance record
    if (status === "approved") {
      const attStatus = leave.type === "onDuty" ? "onDuty" : "medical";
      await Attendance.findOneAndUpdate(
        { studentId: leave.studentId._id, date: leave.date, sessionId: leave.sessionId || null },
        {
          studentId: leave.studentId._id,
          sessionId: leave.sessionId || null,
          subjectId: leave.subjectId || null,
          classId:   leave.classId   || null,
          name:      leave.studentId.name,
          rollNo:    leave.studentId.rollNo,
          date:      leave.date,
          status:    attStatus,
          type:      "regular",
          timestamp: new Date()
        },
        { upsert: true, new: true }
      );
    }

    // Notify student
    await Notification.create({
      userId:  leave.studentId._id,
      title:   `Leave ${status === "approved" ? "Approved ✅" : "Rejected ❌"}`,
      message: `Your ${leave.type} request for ${leave.date} was ${status}.${reviewNote ? " Note: " + reviewNote : ""}`,
      type:    "leave",
      meta:    { leaveId: leave._id }
    });

    // Emit socket notification
    if (global.io) {
      global.io.emit("leave-notification", {
        userId:  leave.studentId._id.toString(),
        leaveId: leave._id,
        status
      });
    }

    res.json({ message: `Leave ${status} ✅`, leave });
  } catch (err) {
    console.error("reviewLeave error:", err);
    res.status(500).json({ message: "Failed to review leave ❌" });
  }
};

/* ─── GET PENDING LEAVES (teacher / admin) ───────────────────────────── */
exports.getPendingLeaves = async (req, res) => {
  try {
    const { classId, subjectId, type, page = 1, limit = 20 } = req.query;
    const filter = { status: "pending" };
    if (classId)   filter.classId   = classId;
    if (subjectId) filter.subjectId = subjectId;
    if (type)      filter.type      = type;

    const leaves = await LeaveRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("studentId", "name rollNo section department")
      .populate("subjectId", "name code");

    const total = await LeaveRequest.countDocuments(filter);
    res.json({ leaves, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leaves ❌" });
  }
};

/* ─── GET ALL LEAVES (admin) ─────────────────────────────────────────── */
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type)   filter.type   = type;

    const leaves = await LeaveRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("studentId", "name rollNo section department")
      .populate("subjectId", "name code")
      .populate("reviewedBy", "name role");

    const total = await LeaveRequest.countDocuments(filter);
    res.json({ leaves, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leaves ❌" });
  }
};

/* ─── MY LEAVE REQUESTS (student) ───────────────────────────────────── */
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ studentId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("reviewedBy", "name role")
      .populate("subjectId", "name code");
    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your leaves ❌" });
  }
};

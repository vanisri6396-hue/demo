const User       = require("../models/User");
const Class      = require("../models/Class");
const Subject    = require("../models/Subject");
const Attendance = require("../models/Attendance");
const QRSession  = require("../models/QRSession");

/* ─── MY CLASSES ─────────────────────────────────────────────────────── */
exports.getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Classes assigned directly, or where they teach a subject
    const subjectClasses = await Subject.find({ teacher: teacherId }).distinct("classId");
    const assignedClasses = await User.findById(teacherId).select("assignedClasses");

    const classIds = [
      ...new Set([
        ...(assignedClasses?.assignedClasses || []).map((id) => id.toString()),
        ...subjectClasses.map((id) => id.toString())
      ])
    ];

    const classes = await Class.find({ _id: { $in: classIds } })
      .populate("classIncharge", "name email")
      .populate("students", "name rollNo section");

    res.json({ classes });
  } catch (err) {
    console.error("getMyClasses error:", err);
    res.status(500).json({ message: "Failed to fetch classes ❌" });
  }
};

/* ─── CLASS STUDENTS ─────────────────────────────────────────────────── */
exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const cls = await Class.findById(classId)
      .populate("students", "name rollNo section email phone department year semester");

    if (!cls) return res.status(404).json({ message: "Class not found ❌" });

    res.json({ students: cls.students, className: cls.name, section: cls.section });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students ❌" });
  }
};

/* ─── MY SUBJECTS ────────────────────────────────────────────────────── */
exports.getMySubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ teacher: req.user.id })
      .populate("classId", "name section department year semester");
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subjects ❌" });
  }
};

/* ─── ATTENDANCE BY SUBJECT ──────────────────────────────────────────── */
exports.getAttendanceBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { date, startDate, endDate } = req.query;

    const filter = { subjectId };
    if (date) filter.date = date;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate)   filter.date.$lte = endDate;
    }

    const records = await Attendance.find(filter)
      .populate("studentId", "name rollNo section")
      .sort({ date: -1, timestamp: -1 });

    // Compute % for each student
    const byStudent = {};
    records.forEach((r) => {
      const id = r.studentId?._id?.toString() || r.studentId?.toString();
      if (!byStudent[id]) {
        byStudent[id] = { student: r.studentId, total: 0, present: 0 };
      }
      byStudent[id].total++;
      if (r.status === "present" || r.status === "onDuty" || r.status === "medical") {
        byStudent[id].present++;
      }
    });

    const summary = Object.values(byStudent).map((s) => ({
      ...s,
      percent: Math.round((s.present / s.total) * 100)
    }));

    res.json({ records, summary });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance ❌" });
  }
};

/* ─── STUDENT ATTENDANCE % ───────────────────────────────────────────── */
exports.getStudentAttendancePercent = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;

    const filter = { studentId };
    if (subjectId !== "all") filter.subjectId = subjectId;

    const total   = await Attendance.countDocuments(filter);
    const present = await Attendance.countDocuments({ ...filter, status: { $in: ["present","onDuty","medical"] } });
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({ studentId, subjectId, total, present, percent });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate ❌" });
  }
};

/* ─── SESSION HISTORY ────────────────────────────────────────────────── */
exports.getSessionHistory = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const sessions = await QRSession.find({ teacherId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("classId", "name section department")
      .populate("subjectId", "name code");

    const total = await QRSession.countDocuments({ teacherId: req.user.id });
    res.json({ sessions, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history ❌" });
  }
};

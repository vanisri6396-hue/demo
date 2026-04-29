const Class      = require("../models/Class");
const Subject    = require("../models/Subject");
const User       = require("../models/User");
const Attendance = require("../models/Attendance");

/* ─── CREATE CLASS ───────────────────────────────────────────────────── */
exports.createClass = async (req, res) => {
  try {
    const { name, department, section, year, semester, classInchargeId } = req.body;
    if (!name || !department || !section || !year || !semester) {
      return res.status(400).json({ message: "All fields required ❌" });
    }
    const cls = await Class.create({
      name, department, section, year: Number(year), semester: Number(semester),
      classIncharge: classInchargeId || null
    });
    res.status(201).json({ message: "Class created ✅", class: cls });
  } catch (err) {
    res.status(500).json({ message: "Failed to create class ❌" });
  }
};

/* ─── GET ALL CLASSES ────────────────────────────────────────────────── */
exports.getClasses = async (req, res) => {
  try {
    const { department, year, semester } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (year)       filter.year       = Number(year);
    if (semester)   filter.semester   = Number(semester);

    const classes = await Class.find(filter)
      .populate("classIncharge", "name email employeeId")
      .sort({ department: 1, section: 1 });

    res.json({ classes, total: classes.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch classes ❌" });
  }
};

/* ─── GET CLASS BY ID ────────────────────────────────────────────────── */
exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate("classIncharge", "name email")
      .populate("students", "name rollNo section email phone");
    if (!cls) return res.status(404).json({ message: "Class not found ❌" });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch class ❌" });
  }
};

/* ─── UPDATE CLASS ───────────────────────────────────────────────────── */
exports.updateClass = async (req, res) => {
  try {
    const updated = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Updated ✅", class: updated });
  } catch (err) {
    res.status(500).json({ message: "Update failed ❌" });
  }
};

/* ─── DELETE CLASS ───────────────────────────────────────────────────── */
exports.deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: "Class deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed ❌" });
  }
};

/* ─── ADD STUDENT TO CLASS ───────────────────────────────────────────── */
exports.addStudentToClass = async (req, res) => {
  try {
    const { studentId } = req.body;
    await Class.findByIdAndUpdate(req.params.id, { $addToSet: { students: studentId } });
    res.json({ message: "Student added ✅" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add student ❌" });
  }
};

/* ─── REMOVE STUDENT FROM CLASS ──────────────────────────────────────── */
exports.removeStudentFromClass = async (req, res) => {
  try {
    const { studentId } = req.body;
    await Class.findByIdAndUpdate(req.params.id, { $pull: { students: studentId } });
    res.json({ message: "Student removed ✅" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove student ❌" });
  }
};

/* ─── CLASS ATTENDANCE SUMMARY ───────────────────────────────────────── */
exports.getClassAttendanceSummary = async (req, res) => {
  try {
    const { id: classId } = req.params;
    const { date } = req.query;
    const today = date || new Date().toISOString().split("T")[0];

    const cls = await Class.findById(classId).populate("students", "name rollNo");
    if (!cls) return res.status(404).json({ message: "Class not found ❌" });

    const records = await Attendance.find({ classId, date: today });
    const presentIds = records.filter(r => r.status === "present").map(r => r.studentId.toString());

    const summary = cls.students.map((s) => ({
      ...s._doc,
      status: presentIds.includes(s._id.toString()) ? "present" : "absent"
    }));

    const presentCount = presentIds.length;
    const absentCount  = summary.length - presentCount;
    const percent      = summary.length > 0 ? Math.round((presentCount / summary.length) * 100) : 0;

    res.json({ className: cls.name, date: today, summary, presentCount, absentCount, percent });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch summary ❌" });
  }
};

/* ─── CREATE SUBJECT ─────────────────────────────────────────────────── */
exports.createSubject = async (req, res) => {
  try {
    const { name, code, classId, teacherId } = req.body;
    if (!name || !code || !classId || !teacherId) {
      return res.status(400).json({ message: "All fields required ❌" });
    }
    const subject = await Subject.create({ name, code, classId, teacher: teacherId });

    // Assign class to teacher
    await User.findByIdAndUpdate(teacherId, { $addToSet: { assignedClasses: classId } });

    res.status(201).json({ message: "Subject created ✅", subject });
  } catch (err) {
    res.status(500).json({ message: "Failed to create subject ❌" });
  }
};

/* ─── GET SUBJECTS ───────────────────────────────────────────────────── */
exports.getSubjects = async (req, res) => {
  try {
    const { classId, teacherId } = req.query;
    const filter = {};
    if (classId)   filter.classId = classId;
    if (teacherId) filter.teacher = teacherId;

    const subjects = await Subject.find(filter)
      .populate("classId", "name section department")
      .populate("teacher", "name email employeeId");

    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subjects ❌" });
  }
};

/* ─── ASSIGN TEACHER TO SUBJECT ──────────────────────────────────────── */
exports.assignTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id, { teacher: teacherId }, { new: true }
    );
    await User.findByIdAndUpdate(teacherId, { $addToSet: { assignedClasses: subject.classId } });
    res.json({ message: "Teacher assigned ✅", subject });
  } catch (err) {
    res.status(500).json({ message: "Assign failed ❌" });
  }
};

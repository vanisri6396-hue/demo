const User       = require("../models/User");
const Class      = require("../models/Class");
const Subject    = require("../models/Subject");
const Attendance = require("../models/Attendance");

/* ─── DASHBOARD ──────────────────────────────────────────────────────── */
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const totalStudents  = await User.countDocuments({ role: "student" });
    const totalTeachers  = await User.countDocuments({ role: "teacher" });
    const totalClasses   = await Class.countDocuments();
    const totalSubjects  = await Subject.countDocuments();

    const presentToday   = await Attendance.countDocuments({ date: today, status: "present" });
    const absentToday    = await Attendance.countDocuments({ date: today, status: "absent" });
    const onDutyToday    = await Attendance.countDocuments({ date: today, status: "onDuty" });
    const medicalToday   = await Attendance.countDocuments({ date: today, status: "medical" });

    const totalRecordsToday = presentToday + absentToday + onDutyToday + medicalToday;
    const attendancePercent = totalRecordsToday > 0
      ? Math.round(((presentToday + onDutyToday + medicalToday) / totalRecordsToday) * 100)
      : 0;

    // Present students list
    const presentRecords = await Attendance.find({ date: today, status: "present" })
      .populate("studentId", "name rollNo section department")
      .populate("subjectId", "name code")
      .sort({ timestamp: -1 })
      .limit(100);

    const absentRecords = await Attendance.find({ date: today, status: "absent" })
      .populate("studentId", "name rollNo section department")
      .populate("subjectId", "name code")
      .sort({ timestamp: -1 })
      .limit(100);

    // Department-wise stats
    const deptStats = await Attendance.aggregate([
      { $match: { date: today } },
      { $group: { _id: "$className", total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status","present"] }, 1, 0] } }
      }},
      { $project: { dept: "$_id", total: 1, present: 1,
          percent: { $cond: [{ $eq: ["$total",0] }, 0,
            { $multiply: [{ $divide: ["$present","$total"] }, 100] }
          ]}
      }}
    ]);

    res.json({
      totalStudents, totalTeachers, totalClasses, totalSubjects,
      today: { presentToday, absentToday, onDutyToday, medicalToday, attendancePercent },
      presentRecords, absentRecords, deptStats
    });

  } catch (err) {
    console.error("getDashboard error:", err);
    res.status(500).json({ message: "Dashboard error ❌" });
  }
};

/* ─── ALL USERS ──────────────────────────────────────────────────────── */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, department, section, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role)       filter.role = role;
    if (department) filter.department = department;
    if (section)    filter.section = section;

    const users = await User.find(filter)
      .select("-password")
      .sort({ name: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users ❌" });
  }
};

/* ─── CREATE USER (by admin) ─────────────────────────────────────────── */
exports.createUser = async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const { name, email, password, role, rollNo, employeeId,
            department, section, year, semester, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password required ❌" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already exists ❌" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email: email.toLowerCase(), password: hashed,
      role: role || "student",
      rollNo: rollNo || "", employeeId: employeeId || "",
      department: department || "", section: section || "",
      year: year || 1, semester: semester || 1, phone: phone || ""
    });

    res.status(201).json({ message: "User created ✅", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Create user failed ❌" });
  }
};

/* ─── DELETE USER ────────────────────────────────────────────────────── */
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed ❌" });
  }
};

/* ─── TOGGLE USER ACTIVE ─────────────────────────────────────────────── */
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found ❌" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"} ✅`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: "Toggle failed ❌" });
  }
};

/* ─── ATTENDANCE REPORT ──────────────────────────────────────────────── */
exports.getAttendanceReport = async (req, res) => {
  try {
    const { classId, subjectId, date, startDate, endDate } = req.query;
    const filter = {};
    if (classId)   filter.classId   = classId;
    if (subjectId) filter.subjectId = subjectId;
    if (date)      filter.date      = date;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate)   filter.date.$lte = endDate;
    }

    const records = await Attendance.find(filter)
      .populate("studentId", "name rollNo section department")
      .populate("subjectId", "name code")
      .sort({ date: -1 });

    res.json({ records, total: records.length });
  } catch (err) {
    res.status(500).json({ message: "Report failed ❌" });
  }
};
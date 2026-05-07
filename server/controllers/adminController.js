const User       = require("../models/User");
const Class      = require("../models/Class");
const Subject    = require("../models/Subject");
const Attendance = require("../models/Attendance");
const School     = require("../models/School");
const Department = require("../models/Department");
const { validatePassword } = require("../utils/validators");

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
            department, section, year, semester, phone,
            schoolId, departmentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password required ❌" });
    }

    // Password Strength Check
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already exists ❌" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email: email.toLowerCase(), password: hashed,
      role: role || "student",
      rollNo: rollNo || "", employeeId: employeeId || "",
      department: department || "", section: section || "",
      year: year || 1, semester: semester || 1, phone: phone || "",
      schoolId: schoolId || null,
      departmentId: departmentId || null
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

/* ─── UNIVERSITY HIERARCHY ───────────────────────────────────────────── */
exports.getUniversityHierarchy = async (req, res) => {
  try {
    const schools = await School.find().populate("departments");
    res.json(schools);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hierarchy ❌" });
  }
};

/* ─── SCHOOL ATTENDANCE ─────────────────────────────────────────────── */
exports.getSchoolAttendance = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { date } = req.query; // Expected YYYY-MM-DD
    const targetDate = date || new Date().toISOString().split("T")[0];

    // Find all classes in this school
    const classes = await Class.find({ schoolId });
    const classIds = classes.map(c => c._id);

    // Aggregate attendance for these classes
    const stats = await Attendance.aggregate([
      { $match: { classId: { $in: classIds }, date: targetDate } },
      { $group: {
          _id: "$status",
          count: { $sum: 1 }
      }}
    ]);

    // Department contribution
    const deptContribution = await Attendance.aggregate([
      { $match: { classId: { $in: classIds }, date: targetDate } },
      { $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "classInfo"
      }},
      { $unwind: "$classInfo" },
      { $group: {
          _id: "$classInfo.department",
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          total: { $sum: 1 }
      }},
      { $project: {
          department: "$_id",
          present: 1,
          total: 1,
          percentage: { $cond: [{ $eq: ["$total", 0] }, 0, { $multiply: [{ $divide: ["$present", "$total"] }, 100] }] }
      }}
    ]);

    res.json({ stats, deptContribution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch school attendance ❌" });
  }
};

/* ─── DEPARTMENT ATTENDANCE ─────────────────────────────────────────── */
exports.getDepartmentAttendance = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split("T")[0];

    const classes = await Class.find({ departmentId: deptId });
    const classIds = classes.map(c => c._id);

    const sectionStats = await Attendance.aggregate([
      { $match: { classId: { $in: classIds }, date: targetDate } },
      { $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "classInfo"
      }},
      { $unwind: "$classInfo" },
      { $group: {
          _id: "$classInfo.name",
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          total: { $sum: 1 }
      }},
      { $project: {
          section: "$_id",
          present: 1,
          total: 1,
          percentage: { $cond: [{ $eq: ["$total", 0] }, 0, { $multiply: [{ $divide: ["$present", "$total"] }, 100] }] }
      }}
    ]);

    res.json(sectionStats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch department attendance ❌" });
  }
};

/* ─── CLASS ATTENDANCE ─────────────────────────────────────────────── */
exports.getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split("T")[0];

    const records = await Attendance.find({ classId, date: targetDate })
      .populate("studentId", "name rollNo")
      .sort({ timestamp: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch class attendance ❌" });
  }
};

/* ─── SEED UNIVERSITY DATA ─────────────────────────────────────────── */
exports.seedUniversityData = async (req, res) => {
  try {
    const universityData = [
      {
        name: "School of Computational Engineering",
        code: "SCE",
        departments: [
          { name: "Computer Science and Engineering", code: "CSE", programs: ["B.Tech Computer Science and Engineering", "B.Tech CSE (AI & ML)", "M.Tech CSE (AI)", "Ph.D Computer Science & Engineering"] },
          { name: "Artificial Intelligence & Data Science", code: "AIDS_SCE", programs: ["B.Tech Artificial Intelligence and Data Science", "M.Tech CSE (Big Data)"] },
          { name: "Information Technology", code: "IT", programs: ["B.Tech Information Technology", "M.Tech CSE (IoT & Cloud Computing)"] },
          { name: "Cyber Security", code: "CS", programs: ["B.Tech CSE (Cyber Security)"] },
          { name: "Applied AI", code: "AAI", programs: ["B.Tech CSE (Applied AI)"] }
        ]
      },
      {
        name: "School of Core Engineering",
        code: "SCORE",
        departments: [
          { name: "Electronics and Communication Engineering", code: "ECE", programs: ["B.Tech Electronics and Communication Engineering", "M.Tech Communication Systems", "Ph.D Electronics and Communication Engineering"] }
        ]
      },
      {
        name: "School of Basic Sciences",
        code: "SBS",
        departments: [
          { name: "Chemistry", code: "CHEM", programs: ["B.Sc Chemistry", "M.Sc Chemistry"] },
          { name: "Mathematics", code: "MATH", programs: ["M.Sc Mathematics"] },
          { name: "Physics", code: "PHYS", programs: ["M.Sc Physics"] }
        ]
      },
      {
        name: "School of Humanities",
        code: "SOH",
        departments: [
          { name: "Tamil", code: "TAM", programs: ["B.A Tamil"] },
          { name: "English", code: "ENG", programs: ["M.A English"] }
        ]
      },
      {
        name: "School of Agricultural Sciences",
        code: "SAS",
        departments: [
          { name: "Agriculture", code: "AGRI", programs: ["B.Sc (Hons) Agriculture"] }
        ]
      },
      {
        name: "School of Allied Health Sciences",
        code: "SAHS",
        departments: [
          { name: "Cardiac Technology", code: "CT", programs: ["B.Sc Cardiac Technology"] },
          { name: "Medical Laboratory Technology", code: "MLT", programs: ["B.Sc Medical Laboratory Technology"] },
          { name: "Optometry", code: "OPT", programs: ["B.Sc Optometry"] },
          { name: "Operation Theatre & Anesthesia Technology", code: "OTAT", programs: ["B.Sc Operation Theatre and Anesthesia Technology"] },
          { name: "Physician Assistant", code: "PA", programs: ["B.Sc Physician Assistant"] },
          { name: "Radio Imaging Technology", code: "RIT", programs: ["B.Sc Radio Imaging Technology"] },
          { name: "Cardiac Perfusion Technology", code: "CPT", programs: ["B.Sc Cardiac Perfusion Technology"] }
        ]
      },
      {
        name: "School of Commerce",
        code: "SOC",
        departments: [
          { name: "Commerce", code: "COMM", programs: ["B.Com General", "M.Com"] },
          { name: "Accounting & Finance", code: "AF", programs: ["B.Com Accounting and Finance"] }
        ]
      },
      {
        name: "School of Computer Science",
        code: "SCS",
        departments: [
          { name: "Computer Science", code: "CS_SCS", programs: ["MCA (Master of Computer Applications)"] },
          { name: "Artificial Intelligence & Data Science", code: "AIDS_SCS", programs: ["B.Sc Computer Science (AI & DS)"] }
        ]
      },
      {
        name: "School of Management Studies",
        code: "SMS",
        departments: [
          { name: "Business Administration", code: "BA", programs: ["MBA (Master of Business Administration)", "Ph.D Management"] },
          { name: "FinTech", code: "FT", programs: ["BBA (FinTech)"] }
        ]
      },
      {
        name: "School of Social Studies",
        code: "SSS",
        departments: [
          { name: "Defense & Strategic Studies", code: "DSS", programs: ["B.A Defense and Strategic Studies"] },
          { name: "International Relations & Public Policy", code: "IRPP", programs: ["B.A International Relations and Public Policy"] },
          { name: "Social Work", code: "SW", programs: ["Master of Social Work"] }
        ]
      },
      {
        name: "School of Nursing",
        code: "SON",
        departments: [
          { name: "Nursing", code: "NUR", programs: ["B.Sc Nursing"] }
        ]
      },
      {
        name: "School of Pharmacy",
        code: "SOP",
        departments: [
          { name: "Pharmacy", code: "PHARM", programs: ["Bachelor of Pharmacy (B.Pharm)"] }
        ]
      },
      {
        name: "School of Physiotherapy",
        code: "SPT",
        departments: [
          { name: "Physiotherapy", code: "PHYSIO", programs: ["Bachelor of Physiotherapy (BPT)"] }
        ]
      }
    ];

    // Clear existing
    await School.deleteMany({});
    await Department.deleteMany({});

    for (const schoolData of universityData) {
      const school = new School({ name: schoolData.name, code: schoolData.code });
      await school.save();

      const deptIds = [];
      for (const deptData of schoolData.departments) {
        const dept = new Department({
          name: deptData.name,
          code: deptData.code,
          schoolId: school._id,
          programs: deptData.programs
        });
        await dept.save();
        deptIds.push(dept._id);
      }
      school.departments = deptIds;
      await school.save();
    }

    res.json({ message: "University hierarchy seeded successfully! 🎉" });
  } catch (err) {
    res.status(500).json({ message: "Seeding failed ❌", error: err.message });
  }
};
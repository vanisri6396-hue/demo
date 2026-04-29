const User       = require("../models/User");
const Attendance = require("../models/Attendance");
const Subject    = require("../models/Subject");
const LeaveRequest = require("../models/LeaveRequest");

/* ─── MY PROFILE ─────────────────────────────────────────────────────── */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("assignedClasses", "name section department");
    if (!user) return res.status(404).json({ message: "User not found ❌" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile ❌" });
  }
};

/* ─── MY ATTENDANCE HISTORY ──────────────────────────────────────────── */
exports.getMyAttendance = async (req, res) => {
  try {
    const { subjectId, startDate, endDate, limit = 50 } = req.query;
    const filter = { studentId: req.user.id };
    if (subjectId) filter.subjectId = subjectId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate)   filter.date.$lte = endDate;
    }

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .limit(Number(limit))
      .populate("subjectId", "name code")
      .populate("sessionId", "type createdAt");

    res.json({ records, total: records.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance ❌" });
  }
};

/* ─── MY ATTENDANCE % (all subjects) ────────────────────────────────── */
exports.getMyAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.id;

    const records = await Attendance.find({ studentId })
      .populate("subjectId", "name code totalClasses");

    const bySubject = {};
    records.forEach((r) => {
      const sid = r.subjectId?._id?.toString() || "unknown";
      if (!bySubject[sid]) {
        bySubject[sid] = {
          subjectId: r.subjectId?._id,
          name: r.subjectId?.name || "Unknown",
          code: r.subjectId?.code || "",
          totalClasses: r.subjectId?.totalClasses || 0,
          attended: 0, total: 0
        };
      }
      bySubject[sid].total++;
      if (["present","onDuty","medical"].includes(r.status)) {
        bySubject[sid].attended++;
      }
    });

    const summary = Object.values(bySubject).map((s) => ({
      ...s,
      percent: s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0
    }));

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate summary ❌" });
  }
};

/* ─── STUDENT DASHBOARD DATA ────────────────────────────────────────── */
const Timetable = require("../models/Timetable");

exports.getDashboardData = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 1. Attendance Summary
    const records = await Attendance.find({ studentId }).populate("subjectId");
    const bySubject = {};
    records.forEach((r) => {
      const sid = r.subjectId?._id?.toString() || "unknown";
      if (!bySubject[sid]) {
        bySubject[sid] = { name: r.subjectId?.name, attended: 0, total: 0 };
      }
      bySubject[sid].total++;
      if (["present","onDuty","medical"].includes(r.status)) bySubject[sid].attended++;
    });

    const lowAttendanceAlerts = Object.values(bySubject)
      .filter(s => (s.attended / s.total) < 0.75)
      .map(s => ({
        type: 'low_attendance',
        title: `${s.name} Attendance Low`,
        message: `Current: ${Math.round((s.attended/s.total)*100)}%. Needs attention!`,
        severity: 'high'
      }));

    // 2. Upcoming Classes
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const timetable = await Timetable.findOne({ day: today, section: student.section || 'A' });
    
    // Filter for future classes (approx based on hour for now)
    const currentHour = new Date().getHours();
    const upcoming = (timetable?.slots || [])
      .filter(slot => {
        const startHour = parseInt(slot.timeSlot?.split(':')[0]);
        return startHour >= currentHour;
      })
      .slice(0, 3);

    // 3. Recent Leave Updates
    const recentLeaves = await LeaveRequest.find({ studentId })
      .sort({ updatedAt: -1 })
      .limit(3)
      .populate("subjectId");

    const leaveAlerts = recentLeaves.map(l => ({
      type: 'leave_update',
      title: `Leave ${l.status}`,
      message: `Your request for ${l.subjectId?.name || 'General'} was ${l.status}.`,
      severity: l.status === 'approved' ? 'success' : 'info'
    }));

    res.json({
      alerts: [...lowAttendanceAlerts, ...leaveAlerts],
      upcomingClasses: upcoming,
      stats: {
        overall: Object.values(bySubject).length > 0 
          ? Math.round(Object.values(bySubject).reduce((acc, s) => acc + (s.attended/s.total), 0) / Object.values(bySubject).length * 100)
          : 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard sync failed" });
  }
};

/* ─── MY LEAVE REQUESTS ──────────────────────────────────────────────── */
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ studentId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("reviewedBy", "name role")
      .populate("subjectId", "name code");
    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leaves ❌" });
  }
};

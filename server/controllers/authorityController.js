const LeaveRequest = require("../models/LeaveRequest");
const Attendance   = require("../models/Attendance");
const User         = require("../models/User");

/* ─── GET PENDING REQUESTS ─────────────────────────────────────────── */
exports.getPendingRequests = async (req, res) => {
  try {
    const { step } = req.query; // 'classIncharge' or 'hod'
    const filter = {};

    if (step === 'classIncharge') {
      filter['approvals.classIncharge.status'] = 'pending';
    } else if (step === 'hod') {
      filter['approvals.classIncharge.status'] = 'approved';
      filter['approvals.hod.status'] = 'pending';
    }

    const requests = await LeaveRequest.find(filter)
      .populate("studentId", "name rollNo section department")
      .populate("subjectId", "name code")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

/* ─── REVIEW REQUEST ─────────────────────────────────────────────────── */
exports.reviewRequest = async (req, res) => {
  try {
    const { requestId, status, note, step } = req.body;
    const reviewerId = req.user.id;

    const leave = await LeaveRequest.findById(requestId);
    if (!leave) return res.status(404).json({ message: "Request not found" });

    if (step === 'classIncharge') {
      leave.approvals.classIncharge = { status, reviewedBy: reviewerId, reviewedAt: new Date() };
      if (status === 'rejected') leave.status = 'rejected';
    } else if (step === 'hod') {
      if (leave.approvals.classIncharge.status !== 'approved' && status === 'approved') {
        return res.status(400).json({ message: "Class Incharge approval required first" });
      }
      leave.approvals.hod = { status, reviewedBy: reviewerId, reviewedAt: new Date() };
      leave.status = status;

      // If approved by HOD, automatically mark attendance as On-Duty for that day
      if (status === 'approved') {
        // We update all attendance records for that student on that date to "onDuty"
        // If a record doesn't exist (student was absent/not marked), we might want to create it, 
        // but typically teachers create the records. 
        // Here we'll update existing ones and the teacher's "scanQR" already prevents overwriting.
        
        await Attendance.updateMany(
          { studentId: leave.studentId, date: leave.date },
          { status: leave.type === 'onDuty' ? 'onDuty' : 'medical' }
        );
      }
    }

    await leave.save();
    res.json({ message: `Request ${status} successfully ✅`, finalStatus: leave.status });
  } catch (err) {
    console.error("reviewRequest error:", err);
    res.status(500).json({ message: "Review submission failed" });
  }
};

/* ─── MONTHLY ATTENDANCE REPORT ───────────────────────────────────────── */
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year, section } = req.query; // month: 0-11
    if (!month || !year || !section) {
      return res.status(400).json({ message: "Month, Year and Section required" });
    }

    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate   = new Date(year, parseInt(month) + 1, 0).toISOString().split('T')[0];

    // Get all students in that section
    const students = await User.find({ role: "student", section: section }).select("name rollNo department");
    
    // Get all attendance for these students in that range
    const studentIds = students.map(s => s._id);
    const records = await Attendance.find({
      studentId: { $in: studentIds },
      date: { $gte: startDate, $lte: endDate }
    }).populate("subjectId", "name code");

    // Process stats
    const report = students.map(student => {
      const studentRecords = records.filter(r => r.studentId.toString() === student._id.toString());
      const total = studentRecords.length;
      const present = studentRecords.filter(r => ["present", "onDuty", "medical"].includes(r.status)).length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        _id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        totalClasses: total,
        attended: present,
        percentage
      };
    });

    res.json({ report, startDate, endDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

const Student = require("../models/Student");

exports.getDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    const present = global.presentStudents || [];
    const absent = [];

    const allStudents = await Student.find();

    allStudents.forEach((s) => {
      const found = present.find(p => p._id.toString() === s._id.toString());
      if (!found) absent.push(s);
    });

    res.json({
      totalStudents,
      presentCount: present.length,
      absentCount: absent.length,
      present,
      absent
    });

  } catch (err) {
    res.status(500).json({ message: "Dashboard error ❌" });
  }
};
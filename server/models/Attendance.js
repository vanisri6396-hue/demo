const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: mongoose.Schema.Types.ObjectId,
  name: String,
  rollNo: String,
  className: String,
  date: String,
  status: String,
  distance: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
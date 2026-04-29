const mongoose = require("mongoose");

const qrSessionSchema = new mongoose.Schema({
  teacherId: String,
  classId: String,
  subjectId: String,
  currentQR: String,
  expiresAt: Date,

  // NEW FIELDS 🔥
  teacherLat: Number,
  teacherLng: Number,
  radius: Number
}, { timestamps: true });

module.exports = mongoose.model("QRSession", qrSessionSchema);
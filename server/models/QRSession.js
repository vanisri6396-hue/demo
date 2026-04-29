const mongoose = require("mongoose");

const qrSessionSchema = new mongoose.Schema(
  {
    teacherId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classId:    { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    subjectId:  { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },

    // QR token (rotates every 3-4 seconds)
    currentQR:  { type: String },
    expiresAt:  { type: Date },           // session end time (startTime + 2 min)

    // Teacher GPS + radius
    teacherLat: { type: Number, required: true },
    teacherLng: { type: Number, required: true },
    radius:     { type: Number, default: 50 },    // metres

    // Session type
    type:       { type: String, enum: ["regular", "exam"], default: "regular" },

    // State
    isActive:   { type: Boolean, default: true },

    // Snapshot arrays (also persisted to Attendance docs)
    presentStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("QRSession", qrSessionSchema);
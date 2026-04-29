const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId:  { type: mongoose.Schema.Types.ObjectId, ref: "QRSession" },
    subjectId:  { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    classId:    { type: mongoose.Schema.Types.ObjectId, ref: "Class" },

    // Denormalised for quick reads
    name:       { type: String },
    rollNo:     { type: String },
    className:  { type: String },
    subject:    { type: String },

    date:       { type: String, required: true },    // "YYYY-MM-DD"
    status:     {
      type: String,
      enum: ["present", "absent", "onDuty", "medical"],
      default: "absent"
    },
    type:       { type: String, enum: ["regular", "exam"], default: "regular" },
    distance:   { type: Number },                    // metres at scan time
    timestamp:  { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Prevent duplicate record per student per session
attendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
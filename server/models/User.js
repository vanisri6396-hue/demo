const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ── Core ─────────────────────────────────────────
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, required: true },
    phone:      { type: String, default: "" },
    profilePic: { type: String, default: "" },

    // ── Role ─────────────────────────────────────────
    // student | teacher | classIncharge | authority | admin
    role: {
      type: String,
      enum: ["student", "teacher", "classIncharge", "authority", "admin"],
      default: "student"
    },

    // ── Student-specific ─────────────────────────────
    rollNo:     { type: String, default: "" },
    department: { type: String, default: "" },
    section:    { type: String, default: "" },
    year:       { type: Number, default: 1 },
    semester:   { type: Number, default: 1 },

    // ── Teacher-specific ─────────────────────────────
    employeeId: { type: String, default: "" },

    // ── Classes assigned (teachers/incharges) ────────
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],

    // ── Status ───────────────────────────────────────
    isActive:   { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    notificationSettings: {
      attendanceConfirmation: { type: Boolean, default: true },
      leaveAlerts:           { type: Boolean, default: true },
      weeklySummary:         { type: Boolean, default: true },
      securityAlerts:        { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
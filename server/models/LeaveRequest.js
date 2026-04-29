const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    studentId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId:   { type: mongoose.Schema.Types.ObjectId, ref: "QRSession" },
    subjectId:   { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    classId:     { type: mongoose.Schema.Types.ObjectId, ref: "Class" },

    // "onDuty" = official duty/event | "medical" = hospitalisation/illness
    type: {
      type: String,
      enum: ["onDuty", "medical"],
      required: true
    },

    date:        { type: String, required: true },  // "YYYY-MM-DD"
    reason:      { type: String, required: true },
    proofUrl:    { type: String, default: "" },     // uploaded certificate URL

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    // Multi-level approval flow
    approvals: {
      classIncharge: {
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewedAt: { type: Date }
      },
      hod: {
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewedAt: { type: Date }
      }
    },

    reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt:  { type: Date },
    reviewNote:  { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);

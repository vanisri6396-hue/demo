const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true }, // e.g. "Data Structures"
    code:         { type: String, required: true, trim: true }, // e.g. "CS301"
    classId:      { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    teacher:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalClasses: { type: Number, default: 0 }                 // increments each session
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);

const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true }, // e.g. "CSE-C"
    department:   { type: String, required: true },             // e.g. "CSE"
    section:      { type: String, required: true },             // e.g. "C"
    year:         { type: Number, required: true },             // 1-4
    semester:     { type: Number, required: true },             // 1-8
    classIncharge:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
    students:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);

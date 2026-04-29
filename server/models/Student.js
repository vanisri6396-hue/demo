const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  rollNo: String,
  className: String
});

module.exports = mongoose.model("Student", studentSchema);
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  // optional list of programs for future use
  programs: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);

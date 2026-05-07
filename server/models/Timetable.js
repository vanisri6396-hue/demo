const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  
  school: { type: String },
  program: { type: String },
  batch: { type: String },
  semester: { type: String },
  section: { type: String, required: true },
  
  day: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true 
  },
  
  slots: [{
    hour: { type: Number, required: true }, // 1 to 8
    timeSlot: { type: String }, // e.g. "09:30 - 10:20"
    subjectCode: { type: String },
    subjectName: { type: String },
    teacherName: { type: String },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);

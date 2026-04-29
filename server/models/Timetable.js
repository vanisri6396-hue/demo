const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  school: { type: String, default: 'Computational Engineering' },
  program: { type: String, default: 'B.Tech CSE (AIML-A)' },
  batch: { type: String, default: '2024-2028' },
  semester: { type: String, default: 'IV' },
  section: { type: String, default: 'A' },
  
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

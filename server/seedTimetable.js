const mongoose = require('mongoose');
require('dotenv').config();
const Timetable = require('./models/Timetable');

const MONGO_URI = process.env.MONGO_URI;

const timetableData = [
  {
    day: 'Monday',
    section: 'CSE-A',
    slots: [
      { hour: 1, subjectCode: 'OS', teacherName: 'Mr. Bharathi', timeSlot: '09:30 - 10:20' },
      { hour: 2, subjectCode: 'DAA', teacherName: 'Mr. B. Rajmohan', timeSlot: '10:20 - 11:10' },
      { hour: 3, subjectCode: 'DBMS', teacherName: 'Dr. R. Sathya Janaki', timeSlot: '11:20 - 12:10' },
      { hour: 4, subjectCode: 'PE', teacherName: 'Mrs. S. Dhivya Lakshmi', timeSlot: '12:10 - 01:00' },
      { hour: 5, subjectCode: 'DMGT', teacherName: 'Mrs. K. Kanchana', timeSlot: '01:50 - 02:30' },
      { hour: 6, subjectCode: 'PE', teacherName: 'Mrs. S. Dhivya Lakshmi', timeSlot: '02:30 - 03:10' },
      { hour: 7, subjectCode: 'T-64', teacherName: 'Coordinator', timeSlot: '03:20 - 04:00' }
    ]
  },
  {
    day: 'Tuesday',
    section: 'CSE-A',
    slots: [
      { hour: 1, subjectCode: 'DAA', teacherName: 'Mr. B. Rajmohan', timeSlot: '09:30 - 10:20' },
      { hour: 2, subjectCode: 'DBMS', teacherName: 'Dr. R. Sathya Janaki', timeSlot: '10:20 - 11:10' },
      { hour: 3, subjectCode: 'OS LAB', teacherName: 'Mr. Bharathi', timeSlot: '11:20 - 12:10' },
      { hour: 4, subjectCode: 'OS LAB', teacherName: 'Mr. Bharathi', timeSlot: '12:10 - 01:00' },
      { hour: 5, subjectCode: 'PE', teacherName: 'Mrs. S. Dhivya Lakshmi', timeSlot: '01:50 - 02:30' },
      { hour: 6, subjectCode: 'DMGT', teacherName: 'Mrs. K. Kanchana', timeSlot: '02:30 - 03:10' },
      { hour: 7, subjectCode: 'ULNL', teacherName: 'Industry Mentor', timeSlot: '03:20 - 04:00' }
    ]
  },
  {
    day: 'Wednesday',
    section: 'CSE-A',
    slots: [
      { hour: 1, subjectCode: 'ULNL', teacherName: 'Industry Mentor', timeSlot: '09:30 - 10:20' },
      { hour: 2, subjectCode: 'ULNL', teacherName: 'Industry Mentor', timeSlot: '10:20 - 11:10' },
      { hour: 3, subjectCode: 'GK', teacherName: 'Mr. K. Sargurunathan', timeSlot: '11:20 - 12:10' },
      { hour: 4, subjectCode: 'OS', teacherName: 'Mr. Bharathi', timeSlot: '12:10 - 01:00' },
      { hour: 5, subjectCode: 'DMGT', teacherName: 'Mrs. K. Kanchana', timeSlot: '01:50 - 02:30' },
      { hour: 6, subjectCode: 'DAA', teacherName: 'Mr. B. Rajmohan', timeSlot: '02:30 - 03:10' },
      { hour: 7, subjectCode: 'OS', teacherName: 'Mr. Bharathi', timeSlot: '03:20 - 04:00' },
      { hour: 8, subjectCode: 'PE', teacherName: 'Mrs. S. Dhivya Lakshmi', timeSlot: '04:00 - 04:40' }
    ]
  },
  {
    day: 'Thursday',
    section: 'CSE-A',
    slots: [
      { hour: 1, subjectCode: 'DMGT', teacherName: 'Mrs. K. Kanchana', timeSlot: '09:30 - 10:20' },
      { hour: 2, subjectCode: 'PE', teacherName: 'Mrs. S. Dhivya Lakshmi', timeSlot: '10:20 - 11:10' },
      { hour: 3, subjectCode: 'DAA', teacherName: 'Mr. B. Rajmohan', timeSlot: '11:20 - 12:10' },
      { hour: 4, subjectCode: 'DBMS', teacherName: 'Dr. R. Sathya Janaki', timeSlot: '12:10 - 01:00' },
      { hour: 5, subjectCode: 'OS', teacherName: 'Mr. Bharathi', timeSlot: '01:50 - 02:30' },
      { hour: 6, subjectCode: 'ULNL', teacherName: 'Industry Mentor', timeSlot: '02:30 - 03:10' },
      { hour: 7, subjectCode: 'LSE', teacherName: 'Coordinator', timeSlot: '03:20 - 04:00' }
    ]
  },
  {
    day: 'Friday',
    section: 'CSE-A',
    slots: [
      { hour: 1, subjectCode: 'ULNL', teacherName: 'Industry Mentor', timeSlot: '09:30 - 10:20' },
      { hour: 2, subjectCode: 'ULNL', teacherName: 'Industry Mentor', timeSlot: '10:20 - 11:10' },
      { hour: 3, subjectCode: 'DBMS LAB', teacherName: 'Dr. R. Sathya Janaki', timeSlot: '11:20 - 12:10' },
      { hour: 4, subjectCode: 'DBMS LAB', teacherName: 'Dr. R. Sathya Janaki', timeSlot: '12:10 - 01:00' },
      { hour: 5, subjectCode: 'DAA', teacherName: 'Mr. B. Rajmohan', timeSlot: '01:50 - 02:30' },
      { hour: 6, subjectCode: 'DBMS', teacherName: 'Dr. R. Sathya Janaki', timeSlot: '02:30 - 03:10' },
      { hour: 7, subjectCode: 'OS', teacherName: 'Mr. Bharathi', timeSlot: '03:20 - 04:00' },
      { hour: 8, subjectCode: 'DMGT', teacherName: 'Mrs. K. Kanchana', timeSlot: '04:00 - 04:40' }
    ]
  },
  {
    day: 'Saturday',
    section: 'CSE-A',
    slots: [
      { hour: 1, subjectCode: 'DBMS', teacherName: 'Dr. R. Sathya Janaki', timeSlot: '09:30 - 10:20' },
      { hour: 2, subjectCode: 'DBMS', teacherName: 'Dr. R. Sathya Janaki', timeSlot: '10:20 - 11:10' },
      { hour: 3, subjectCode: 'OS', teacherName: 'Mr. Bharathi', timeSlot: '11:20 - 12:10' },
      { hour: 4, subjectCode: 'DMGT', teacherName: 'Mrs. K. Kanchana', timeSlot: '12:10 - 01:00' },
      { hour: 5, subjectCode: 'DAA', teacherName: 'Mr. B. Rajmohan', timeSlot: '01:50 - 02:30' },
      { hour: 6, subjectCode: 'PE', teacherName: 'Mrs. S. Dhivya Lakshmi', timeSlot: '02:30 - 03:10' },
      { hour: 7, subjectCode: 'CLUB', teacherName: 'Coordinator', timeSlot: '03:20 - 04:00' }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');
    
    await Timetable.deleteMany({ section: 'CSE-A' });
    console.log('🗑️ Cleared existing CSE-A timetable');
    
    await Timetable.insertMany(timetableData);
    console.log('✨ Timetable seeded successfully with Takshashila data!');
    
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();

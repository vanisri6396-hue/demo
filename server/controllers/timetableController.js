const Timetable = require('../models/Timetable');

exports.updateTimetable = async (req, res) => {
  try {
    const { day, slots, section, schoolId, departmentId } = req.body;
    
    let timetable = await Timetable.findOne({ day, section, schoolId, departmentId });
    
    if (timetable) {
      timetable.slots = slots;
      await timetable.save();
    } else {
      timetable = await Timetable.create({ day, slots, section, schoolId, departmentId });
    }
    
    res.json({ message: 'Timetable updated successfully ✅', timetable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTimetableByHierarchy = async (req, res) => {
  try {
    const { schoolId, departmentId, section } = req.query;
    const query = {};
    if (schoolId) query.schoolId = schoolId;
    if (departmentId) query.departmentId = departmentId;
    if (section) query.section = section;

    const timetable = await Timetable.find(query).sort({ day: 1 });
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeacherSchedule = async (req, res) => {
  try {
    const { teacherName } = req.params;
    const schedule = await Timetable.find({ 'slots.teacherName': teacherName });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

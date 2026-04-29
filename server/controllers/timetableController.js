const Timetable = require('../models/Timetable');

exports.updateTimetable = async (req, res) => {
  try {
    const { day, slots, section } = req.body;
    
    let timetable = await Timetable.findOne({ day, section });
    
    if (timetable) {
      timetable.slots = slots;
      await timetable.save();
    } else {
      timetable = await Timetable.create({ day, slots, section });
    }
    
    res.json({ message: 'Timetable updated successfully ✅', timetable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTimetableBySection = async (req, res) => {
  try {
    const { section } = req.params;
    const timetable = await Timetable.find({ section }).sort({ day: 1 });
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

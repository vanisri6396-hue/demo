const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

router.post('/update', timetableController.updateTimetable);
router.get('/filter', timetableController.getTimetableByHierarchy);
router.get('/teacher/:teacherName', timetableController.getTeacherSchedule);

module.exports = router;

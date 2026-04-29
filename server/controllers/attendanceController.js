const lastLocations = {};
const Student = require("../models/Student");

// 📍 Distance calculation (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// 🎯 SCAN API
exports.scanQR = async (req, res) => {
  try {
    const { qr, studentId, lat, lng } = req.body;

    // ❌ QR mismatch
    if (qr !== global.currentQR) {
      return res.status(400).json({ message: "Invalid QR ❌" });
    }

    // ❌ Location missing
    if (!lat || !lng) {
      return res.status(400).json({ message: "Location required ❌" });
    }

    // 📍 Calculate distance
    const distance = getDistance(
      lat,
      lng,
      global.teacherLat,
      global.teacherLng
    );

    const now = Date.now();

    // 🔐 Fake GPS Detection
    if (lastLocations[studentId]) {
      const prev = lastLocations[studentId];

      const timeDiff = (now - prev.time) / 1000; // seconds

      const moveDistance = getDistance(
        prev.lat,
        prev.lng,
        lat,
        lng
      );

      const speed = moveDistance / timeDiff;

      // 🚫 unrealistic speed
      if (speed > 50) {
        return res.status(403).json({
          message: "Fake GPS detected 🚫"
        });
      }
    }

    // ❌ Outside radius
    if (distance > global.radius) {
      return res.status(403).json({
        message: `Too far ❌ (${Math.round(distance)} meters)`
      });
    }

    // 🔍 Get student
    const student = await Student.findById(studentId);
    const Attendance = require("../models/Attendance");

// 📅 current date
const today = new Date().toISOString().split("T")[0];

// ❗ prevent duplicate entry
const alreadyMarked = await Attendance.findOne({
  studentId: student._id,
  date: today
});

if (!alreadyMarked) {
  await Attendance.create({
    studentId: student._id,
    name: student.name,
    rollNo: student.rollNo,
    className: student.className,
    date: today,
    status: "present",
    distance: Math.round(distance)
  });
}
    if (!student) {
      return res.status(404).json({ message: "Student not found ❌" });
    }

    // ⚠️ Prevent duplicate entry
    const alreadyPresent = global.presentStudents.find(
      (s) => s._id.toString() === student._id.toString()
    );

    if (!alreadyPresent) {
      const studentData = {
        ...student._doc,
        distance: Math.round(distance)
      };

      global.presentStudents.push(studentData);

      // 🔥 LIVE UPDATE TO TEACHER
      global.io.emit("attendance-update", global.presentStudents);
    }

    // ✅ 🔥 ADD THIS HERE (VERY IMPORTANT)
    lastLocations[studentId] = {
      lat,
      lng,
      time: now
    };

    // ✅ response
    res.json({
      message: "Attendance marked ✅",
      distance: Math.round(distance)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Scan failed ❌" });
  }
};
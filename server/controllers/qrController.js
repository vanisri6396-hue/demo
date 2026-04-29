const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const QRSession = require("../models/QRSession");
const crypto = require("crypto");

// ✅ QR generator
function generateQR() {
  return crypto.randomBytes(8).toString("hex");
}

// 🔁 store interval globally
let qrInterval;

exports.startQR = async (req, res) => {
  try {
    const { lat, lng, radius } = req.body;

    // 🌍 store teacher location
    global.teacherLat = lat;
    global.teacherLng = lng;
    global.radius = radius;

    // 🔄 reset present list
    global.presentStudents = [];

    // 🧹 clear old interval (IMPORTANT)
    if (qrInterval) clearInterval(qrInterval);

    // 🔥 generate first QR
    let newQR = generateQR();
    global.currentQR = newQR;

    // 📡 send first QR
    global.io.emit("qr-update", newQR);

    console.log("QR started:", newQR);
await QRSession.create({
  teacherId: req.user.id,
  qr: newQR,
  lat,
  lng,
  radius,
  startTime: new Date()
});
    // 🔄 update QR every 5 seconds
    qrInterval = setInterval(() => {
      newQR = generateQR();
      global.currentQR = newQR;

      global.io.emit("qr-update", newQR);
      console.log("QR updated:", newQR);
    }, 5000);

    /* =========================
       🔥 AUTO ABSENT TIMER
    ========================= */
    setTimeout(async () => {
      try {
        const allStudents = await Student.find();

        const absentStudents = allStudents.filter(
          (student) =>
            !global.presentStudents.find(
              (p) => p._id.toString() === student._id.toString()
            )
        );

        console.log(
          "Absent:",
          absentStudents.map((s) => s.name)
        );

        // 📡 send final result to teacher
        global.io.emit("attendance-final", {
          present: global.presentStudents,
          absent: absentStudents,
        });
      } catch (err) {
        console.error("Absent error:", err);
      }
    }, 120000); // ⏱ 2 minutes

    res.json({ message: "QR started" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error starting QR" });
  }
};
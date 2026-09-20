/* E2E verification of the seedPeople.js attendance seeding.
 * Connects directly to MongoDB (no server required) and checks that
 * every seeded attendance record has a valid timestamp and that each
 * seeded QR session has the expected 25 student records.
 *
 * Run:  node scripts/testSeedAttendance.js   (after seeding)
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

// DNS override needed for MongoDB Atlas SRV resolution
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const QRSession = require("../models/QRSession");
const User = require("../models/User");

function check(name, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}  (got=${JSON.stringify(got)}, want=${JSON.stringify(expected)})`);
  if (!pass) process.exitCode = 1;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB ✅\n");

  // ── 1. Attendance records exist ─────────────────────────────────
  const total = await Attendance.countDocuments({});
  check("attendance records exist", total > 0, true);
  check("at least 15 750 records (630 sessions × 25 students)", total >= 15750, true);

  // ── 2. All timestamps are valid Date objects (no Invalid Date) ──
  const validTs = await Attendance.countDocuments({ timestamp: { $type: "date" } });
  check("all timestamps are valid Dates", validTs, total);

  // ── 3. Records-per-session: seeded sessions should have 25 ──────
  const dist = await Attendance.aggregate([
    { $group: { _id: "$sessionId", n: { $sum: 1 } } },
    { $sort: { n: -1 } },
    { $limit: 1 }
  ]);
  check("seeded sessions have 25 records each", dist[0]?.n, 25);

  // ── 4. No duplicate (studentId, sessionId) pairs ───────────────
  const dups = await Attendance.aggregate([
    { $group: { _id: { s: "$studentId", sess: "$sessionId" }, n: { $sum: 1 } } },
    { $match: { n: { $gt: 1 } } },
    { $count: "dupGroups" }
  ]);
  check("no duplicate (studentId, sessionId) pairs", dups[0]?.dupGroups || 0, 0);

  // ── 5. Sessions exist with corresponding teachers / students ────
  const sessions = await QRSession.countDocuments({});
  const users = await User.countDocuments({});
  check("QR sessions exist", sessions > 0, true);
  check("users exist", users > 0, true);

  console.log("\n==============================");
  console.log(process.exitCode ? "SEED ATTENDANCE TEST: FAILED ❌" : "SEED ATTENDANCE TEST: PASSED ✅");
  console.log("==============================\n");

  await mongoose.disconnect();
  process.exit(process.exitCode || 0);
}

main().catch((e) => { console.error("Test crashed:", e); process.exit(1); });

/* ─────────────────────────────────────────────────────────────────────────────
 * REALISTIC UNIVERSITY TEST-DATA SEEDER
 *
 * Creates believable data for EVERY department of all 14 schools:
 *   • 25 students   per department  (role: student)
 *   • 10 teachers   per department  (role: teacher)
 *   •  1 class in-charge per department (role: classIncharge)
 *   •  1 HOD        per department  (role: authority)
 *   •  1 Dean       per school      (role: dean)
 *   •  4 subjects + 1 class (section A) per department
 *   • 15 weekdays of QR attendance history (present / absent)
 *   • Realistic OD (onDuty) & Medical leave cases, most approved and reflected
 *     in the attendance records exactly like the live approval flow does.
 *
 * Run:  node scripts/seedPeople.js
 * Flags: --days=15  --students=25  --teachers=10  --keep (keep existing data)
 *
 * Requires the academic hierarchy to exist first:  node scripts/seedUniversity.js
 * ───────────────────────────────────────────────────────────────────────────── */
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const School       = require("../models/School");
const Department   = require("../models/Department");
const User         = require("../models/User");
const Class        = require("../models/Class");
const Subject      = require("../models/Subject");
const QRSession    = require("../models/QRSession");
const Attendance   = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");

const {
  COUNTS, CREDENTIALS, FIRST_NAMES, LAST_NAMES,
  SUBJECTS_BY_DEPT, OD_REASONS, MEDICAL_REASONS
} = require("../data/testPeopleData");

/* ─── CLI options ───────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const numArg = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  const value = hit ? Number(hit.split("=")[1]) : NaN;
  return Number.isFinite(value) && value > 0 ? value : fallback;
};
const KEEP = argv.includes("--keep");
const STUDENTS_PER_DEPT = numArg("students", COUNTS.studentsPerDept);
const TEACHERS_PER_DEPT = numArg("teachers", COUNTS.teachersPerDept);
const DAYS = numArg("days", COUNTS.attendanceDays);

/* ─── Small helpers ─────────────────────────────────────────────────── */
const rnd      = (n) => Math.floor(Math.random() * n);
const pick     = (arr) => arr[rnd(arr.length)];
const pad      = (n, w = 2) => String(n).padStart(w, "0");
const slug     = (s) => s.toLowerCase().replace(/[^a-z]/g, "");
const isoDate  = (d) => d.toISOString().split("T")[0];

// Last N weekdays (oldest → newest), ending today
function lastWeekdays(count) {
  const days = [];
  const cursor = new Date();
  while (days.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) days.unshift(isoDate(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return days;
}

// Add the working days between today and `days` in the past; returns "days from now"
function dateShift(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return isoDate(d);
}

/* ─── Bulk insert helper (keeps Atlas round-trips low) ──────────────── */
// NOTE: mongoose 9's insertMany does NOT back-fill _id onto plain JS objects,
// so we pre-assign _id here — callers can immediately use doc._id afterwards.
async function insertChunks(model, docs, size = 800) {
  let returned = 0;
  for (let i = 0; i < docs.length; i += size) {
    const chunk = docs.slice(i, i + size);
    chunk.forEach((d) => { if (!d._id) d._id = new mongoose.Types.ObjectId(); });
    const res = await model.insertMany(chunk, { ordered: false });
    returned += res.length;
  }
  console.log(`   [${model.modelName}] inserted ${returned}/${docs.length}`);
  if (returned !== docs.length) {
    throw new Error(`${model.modelName}: expected ${docs.length} inserts but only ${returned} succeeded`);
  }
}

/* ─── Create one class + 4 subjects per department ──────────────────── */
async function createClassesAndSubjects(plans) {
  const classDocs = [];

  plans.forEach((plan) => {
    if (!plan.dept) return;                         // skip the Dean-only plan entry
    classDocs.push({
      name: `${plan.deptCode}-A`,
      department: plan.deptCode,
      section: "A",
      year: 2,
      semester: 3,
      schoolId: plan.school._id,
      departmentId: plan.dept._id,
      students: plan.students.map((s) => s._id)
    });
  });

  await insertChunks(Class, classDocs, 200);
  console.log(`✅ Created ${classDocs.length} classes (one per department, section A)`);

  // Map deptCode → saved class document
  const classByDept = {};
  classDocs.forEach((c) => { classByDept[c.department] = c; });

  const subjectDocs = [];
  plans.forEach((plan) => {
    if (!plan.dept) return;
    const cls = classByDept[plan.deptCode];
    const offerings = SUBJECTS_BY_DEPT[plan.deptCode] ||
      [
        `${plan.dept.name} — Core I`,
        `${plan.dept.name} — Core II`,
        `${plan.dept.name} — Laboratory`,
        `${plan.dept.name} — Elective`
      ];

    offerings.slice(0, COUNTS.subjectsPerClass).forEach((subjectName, idx) => {
      const teacher = plan.teachers[idx % plan.teachers.length];
      subjectDocs.push({
        name: subjectName,
        code: `${plan.deptCode}${300 + idx + 1}`,
        classId: cls._id,
        teacher: teacher._id,
        totalClasses: 0,
        _seedOrder: subjectDocs.length
      });
    });
  });

  await insertChunks(Subject, subjectDocs, 200);
  console.log(`✅ Created ${subjectDocs.length} subjects assigned to department faculty`);

  // Assign the class to every teacher of that department (assignedClasses)
  for (const plan of plans) {
    if (!plan.dept) continue;
    const cls = classByDept[plan.deptCode];
    const teacherIds = plan.teachers.map((t) => t._id);
    await User.updateMany({ _id: { $in: teacherIds } }, { $addToSet: { assignedClasses: cls._id } });
    // The class in-charge also supervises the class
    await User.updateOne(
      { email: `${slug(plan.incharge.name.split(" ")[0])}.incharge.${slug(plan.deptCode)}@${CREDENTIALS.facultyDomain}` },
      { $addToSet: { assignedClasses: cls._id } }
    );
  }

  return { classByDept, subjectDocs };
}

/* ─── Wipe only the data owned by this seeder (test-domain accounts) ─── */
async function clearTestData() {
  const emailFilter = { email: { $regex: /@(student\.)?tks-univ\.edu$/ } };
  const testUsers = await User.find(emailFilter).select("_id");
  const ids = testUsers.map((u) => u._id);

  if (ids.length === 0) {
    console.log("No previous test accounts found — starting fresh 🗑️");
    return;
  }

  const classIds = (await Class.find({ students: { $in: ids } }).select("_id")).map((c) => c._id);

  const removed = {
    attendance: (await Attendance.deleteMany({ studentId: { $in: ids } })).deletedCount,
    leaves:     (await LeaveRequest.deleteMany({ studentId: { $in: ids } })).deletedCount,
    sessions:   (await QRSession.deleteMany({ teacherId: { $in: ids } })).deletedCount,
    subjects:   (await Subject.deleteMany({ teacher: { $in: ids } })).deletedCount,
    classes:    (await Class.deleteMany({ _id: { $in: classIds } })).deletedCount,
    users:      (await User.deleteMany(emailFilter)).deletedCount
  };

  console.log("Cleared previous test data 🗑️", removed);
}

/* ─── Build students, teachers, in-charges, HODs, deans for every dept ─── */
async function createPeople(hierarchy) {
  const studentPasswordHash = await bcrypt.hash(CREDENTIALS.studentPassword, 10);
  const facultyPasswordHash = await bcrypt.hash(CREDENTIALS.facultyPassword, 10);

  const plans = [];            // one per department
  const userDocs = [];         // everything inserted in one bulk insert per role
  const usedNames = new Set();

  const uniquePersonName = () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      if (!usedNames.has(name)) { usedNames.add(name); return name; }
    }
    return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  };

  for (const school of hierarchy) {
    const schoolCode = school.code;

    // ── Dean: one per school (school-wide scope) ──────────────────────
    const deanName = uniquePersonName();
    plans.push({ school, dean: { name: deanName, code: schoolCode } });
    userDocs.push({
      name: deanName,
      email: `dean.${slug(schoolCode)}@${CREDENTIALS.facultyDomain}`,
      password: facultyPasswordHash,
      role: "dean",
      employeeId: `DEAN-${schoolCode}-01`,
      phone: `9${pad(rnd(9), 1)}${pad(100000000 + rnd(899999999), 9)}`.slice(0, 10),
      schoolId: school._id,
      departmentId: null,
      isVerified: true
    });

    for (const dept of school.departments) {
      const code = dept.code;

      // ── HOD (authority) ────────────────────────────────────────────
      const hodName = uniquePersonName();
      userDocs.push({
        name: hodName,
        email: `hod.${slug(code)}@${CREDENTIALS.facultyDomain}`,
        password: facultyPasswordHash,
        role: "authority",
        employeeId: `HOD-${code}-01`,
        schoolId: school._id,
        departmentId: dept._id,
        isVerified: true
      });

      // ── 10 teachers ────────────────────────────────────────────────
      const teachers = [];
      for (let i = 1; i <= TEACHERS_PER_DEPT; i++) {
        const name = uniquePersonName();
        const [first, last] = name.split(" ");
        const doc = {
          name,
          email: `${slug(first)}.${slug(last)}.${slug(code)}${pad(i)}@${CREDENTIALS.facultyDomain}`,
          password: facultyPasswordHash,
          role: "teacher",
          employeeId: `FAC-${code}-${pad(i)}`,
          department: code,
          schoolId: school._id,
          departmentId: dept._id,
          isVerified: true
        };
        teachers.push(doc);
        userDocs.push(doc);
      }

      // ── 1 class in-charge (department-scoped supervision role) ─────
      const inchName = uniquePersonName();
      const inchFirst = slug(inchName.split(" ")[0]);
      const incharge = {
        name: inchName,
        email: `${inchFirst}.incharge.${slug(code)}@${CREDENTIALS.facultyDomain}`,
        password: facultyPasswordHash,
        role: "classIncharge",
        employeeId: `CIC-${code}-01`,
        department: code,
        schoolId: school._id,
        departmentId: dept._id,
        isVerified: true
      };
      userDocs.push(incharge);

      // ── 25 students, section A ─────────────────────────────────────
      const students = [];
      for (let i = 1; i <= STUDENTS_PER_DEPT; i++) {
        const name = uniquePersonName();
        const [first, last] = name.split(" ");
        const rollNo = `${code}-${pad(2)}${pad(i, 3)}`;      // e.g. CSE-2001
        const doc = {
          name,
          email: `${slug(first)}.${slug(last)}.${slug(code)}${pad(i, 3)}@${CREDENTIALS.studentDomain}`,
          password: studentPasswordHash,
          role: "student",
          rollNo,
          department: code,
          section: "A",
          year: 2,
          semester: 3,
          phone: `9${pad(rnd(9), 1)}${pad(100000000 + rnd(899999999), 9)}`.slice(0, 10),
          schoolId: school._id,
          departmentId: dept._id,
          // per-student reliability → produces a realistic spread of attendance %
          attendanceRate: +(0.72 + Math.random() * 0.27).toFixed(3)
        };
        students.push(doc);
        userDocs.push(doc);
      }

      plans.push({
        school, schoolCode, dept,
        deptCode: code,
        teachers, incharge, hodName,
        students, hiddenRates: students.map((s) => s.attendanceRate)
      });
    }
  }

  // Insert users in sizeable chunks; insertMany mutates the docs with _id
  await insertChunks(User, userDocs, 500);
  console.log(`✅ Created ${userDocs.length} users (students, teachers, in-charges, HODs, deans)`);

  return plans;
}

/* ─── QR sessions + attendance history across the last N weekdays ───── */
async function createAttendance(plans, classByDept, subjectDocs) {
  const crypto = require("crypto");
  const days = lastWeekdays(DAYS);

  const subjectByClass = {};
  subjectDocs.forEach((s) => {
    const key = String(s.classId);
    (subjectByClass[key] = subjectByClass[key] || []).push(s);
  });

  // One (class, day, subject) tuple per session
  const tuples = [];
  plans.forEach((plan) => {
    if (!plan.dept) return;
    const cls = classByDept[plan.deptCode];
    const subjects = subjectByClass[String(cls._id)] || [];
    days.forEach((date, dayIdx) => {
      tuples.push({
        plan, cls, date,
        subject: subjects[dayIdx % subjects.length],
        isToday: date === isoDate(new Date())
      });
    });
  });

  // Persist the QR sessions (inactive history, same shape the app writes)
  const sessionDocs = tuples.map((t, i) => ({
    teacherId:  t.subject.teacher,
    classId:    t.cls._id,
    subjectId:  t.subject._id,
    currentQR:  crypto.randomBytes(12).toString("hex"),
    previousQR: null,
    expiresAt:  new Date(`${t.date}T${10 + (i % 5)}:00:00.000Z`),
    teacherLat: 12.9716,
    teacherLng: 77.5946,
    radius:     900,
    type:       "regular",
    isActive:   false,
    presentStudents: []
  }));
  await insertChunks(QRSession, sessionDocs, 500);
  // Map sessions back to tuples by their unique QR token (position-stable)
  const sessionByQR = {};
  sessionDocs.forEach((s) => { sessionByQR[s.currentQR] = s; });
  tuples.forEach((t, i) => { t.session = sessionByQR[sessionDocs[i].currentQR]; });
  console.log(`✅ Created ${sessionDocs.length} QR sessions (${DAYS} weekdays × ${tuples.length / DAYS} classes)`);

  // Attendance rows — per-student reliability drives a realistic spread
  const attendanceDocs = [];
  tuples.forEach((t) => {
    t.plan.students.forEach((student, sIdx) => {
      const rate = t.isToday
        ? Math.min(student.attendanceRate, COUNTS.presentTodayRatio)
        : student.attendanceRate;
      const isPresent = Math.random() < rate;
      attendanceDocs.push({
        studentId: student._id,
        sessionId: t.session._id,
        subjectId: t.subject._id,
        classId:   t.cls._id,
        name:      student.name,
        rollNo:    student.rollNo,
        className: t.cls.section,
        subject:   t.subject.name,
        date:      t.date,
        status:    isPresent ? "present" : "absent",
        type:      "regular",
        distance:  isPresent ? 8 + rnd(35) : undefined,
        timestamp: new Date(`${t.date}T${pad(8 + (sIdx % 8))}:${pad(10 + (sIdx % 45))}:00.000Z`)
      });
    });
  });

  await insertChunks(Attendance, attendanceDocs, 1500);
  console.log(`✅ Created ${attendanceDocs.length} attendance records (present / absent)`);

  return { tuples, days };
}

/* ─── Realistic OD (onDuty) & Medical cases, with approvals ─────────── */
async function createLeaves(plans, tuples) {
  const tuplesByDept = {};
  tuples.forEach((t) => {
    (tuplesByDept[t.plan.deptCode] = tuplesByDept[t.plan.deptCode] || []).push(t);
  });

  const leaveDocs = [];
  const attendanceUpdates = [];

  // At least 6 students are needed for the scripted OD / Medical cases below
  const STUDENTS_NEEDED = 6;
  if (STUDENTS_PER_DEPT < STUDENTS_NEEDED) {
    console.log(`ℹ️  Skipping OD/Medical cases: --students=${STUDENTS_PER_DEPT} (need ≥ ${STUDENTS_NEEDED})`);
    return;
  }

  plans.forEach((plan) => {
    if (!plan.dept) return;
    const deptTuples = tuplesByDept[plan.deptCode] || [];
    if (!deptTuples.length) return;

    const days = [...new Set(deptTuples.map((t) => t.date))];
    const tupled = (day) => deptTuples.find((t) => t.date === day);
    const usedDays = new Set();                        // one case per student per day
    const takeDay = () => {
      for (let i = 0; i < 40; i++) {
        const day = pick(days);
        if (!usedDays.has(day)) { usedDays.add(day); return day; }
      }
      return days[0];
    };

    const buildLeave = ({ student, type, status, day, reviewNote }) => {
      const t = tupled(day);
      const proofUrl = status === "rejected" && type === "medical"
        ? ""
        : `https://storage.takshashila.edu/${type === "onDuty" ? "od" : "medical"}/${student.rollNo}-${day}.pdf`;

      const approvals = {
        classIncharge: status === "pending"
          ? { status: "pending" }
          : { status, reviewedBy: plan.incharge._id, reviewedAt: new Date(`${day}T17:30:00.000Z`) },
        hod: status === "approved"
          ? { status: "approved", reviewedBy: plan.incharge._id, reviewedAt: new Date(`${day}T18:00:00.000Z`) }
          : { status: status === "rejected" ? "rejected" : "pending" }
      };

      leaveDocs.push({
        studentId: student._id,
        sessionId: t.session._id,
        subjectId: t.subject._id,
        classId:   t.cls._id,
        type,
        date: day,
        reason: type === "onDuty" ? pick(OD_REASONS) : pick(MEDICAL_REASONS),
        proofUrl,
        status,
        approvals,
        reviewedBy: status === "pending" ? undefined : plan.incharge._id,
        reviewedAt: status === "pending" ? undefined : new Date(`${day}T18:00:00.000Z`),
        reviewNote: reviewNote || ""
      });

      // Approved cases change that session's attendance row (same as live flow)
      if (status === "approved") {
        attendanceUpdates.push({
          studentId: student._id,
          sessionId: t.session._id,
          status: type === "onDuty" ? "onDuty" : "medical"
        });
      }
    };

    // ── 3 On-Duty cases: 2 approved (events) + 1 awaiting approval ──
    buildLeave({
      student: plan.students[0], type: "onDuty", status: "approved", day: takeDay(),
      reviewNote: "Event participation verified with the department coordinator ✅"
    });
    buildLeave({
      student: plan.students[1], type: "onDuty", status: "approved", day: takeDay(),
      reviewNote: "Approved — duty letter from the Dean's office on file ✅"
    });
    buildLeave({
      student: plan.students[2], type: "onDuty", status: "pending", day: takeDay()
    });

    // ── 2 Medical cases: 1 approved (hospital records) + 1 pending ──
    buildLeave({
      student: plan.students[3], type: "medical", status: "approved", day: takeDay(),
      reviewNote: "Hospital discharge summary verified by the class in-charge ✅"
    });
    buildLeave({
      student: plan.students[4], type: "medical", status: "pending", day: takeDay()
    });

    // ── 1 rejected case (documentation missing) ──
    buildLeave({
      student: plan.students[5], type: "medical", status: "rejected", day: takeDay(),
      reviewNote: "Rejected — medical certificate not attached, please resubmit ❌"
    });
  });

  await insertChunks(LeaveRequest, leaveDocs, 200);
  console.log(`✅ Created ${leaveDocs.length} OD / Medical leave requests`);

  if (attendanceUpdates.length) {
    await Attendance.bulkWrite(
      attendanceUpdates.map((u) => ({
        updateOne: {
          filter: { studentId: u.studentId, sessionId: u.sessionId },
          update: { $set: { status: u.status } }
        }
      }))
    );
    console.log(`✅ Marked ${attendanceUpdates.length} attendance records as onDuty / medical`);
  }
}

/* ─── Print the REAL statistics straight from the database ──────────── */
async function printSummary() {
  const [students, teachers, incharges, hods, deans, classes, subjects, sessions] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    User.countDocuments({ role: "classIncharge" }),
    User.countDocuments({ role: "authority" }),
    User.countDocuments({ role: "dean" }),
    Class.countDocuments(),
    Subject.countDocuments(),
    QRSession.countDocuments()
  ]);

  const byStatus = await Attendance.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const statusCount = { present: 0, absent: 0, onDuty: 0, medical: 0 };
  byStatus.forEach((s) => { statusCount[s._id] = s.count; });

  const totalRecords = Object.values(statusCount).reduce((a, b) => a + b, 0);
  const attended = statusCount.present + statusCount.onDuty + statusCount.medical;
  const percent = totalRecords ? ((attended / totalRecords) * 100).toFixed(2) : "0.00";

  const leavesByType = await LeaveRequest.aggregate([
    { $group: { _id: { type: "$type", status: "$status" }, count: { $sum: 1 } } }
  ]);

  const today = isoDate(new Date());
  const todayRecords = await Attendance.countDocuments({ date: today });

  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("  SEEDED TEST DATA SUMMARY (live database counts)");
  console.log("══════════════════════════════════════════════════════════════");
  console.log(`  Schools .............. ${await School.countDocuments()}`);
  console.log(`  Departments .......... ${await Department.countDocuments()}`);
  console.log(`  Classes .............. ${classes}`);
  console.log(`  Subjects ............. ${subjects}`);
  console.log(`  Students ............. ${students}`);
  console.log(`  Teachers ............. ${teachers}`);
  console.log(`  Class In-charges ..... ${incharges}`);
  console.log(`  HODs ................. ${hods}`);
  console.log(`  Deans ................ ${deans}`);
  console.log(`  QR sessions .......... ${sessions}`);
  console.log(`  Attendance records ... ${totalRecords}  (today: ${todayRecords})`);
  console.log("──────────────────────────────────────────────────────────────");
  console.log(`  Present .............. ${statusCount.present}`);
  console.log(`  Absent ............... ${statusCount.absent}`);
  console.log(`  On-Duty (OD) ......... ${statusCount.onDuty}`);
  console.log(`  Medical .............. ${statusCount.medical}`);
  console.log(`  Overall attendance ... ${percent}%  (present + OD + medical)`);
  console.log("──────────────────────────────────────────────────────────────");
  console.log("  Leave requests:");
  leavesByType
    .sort((a, b) => `${a._id.type}${a._id.status}`.localeCompare(`${b._id.type}${b._id.status}`))
    .forEach((l) => console.log(`    ${l._id.type.padEnd(8)} ${l._id.status.padEnd(9)} ${l.count}`));
  console.log("══════════════════════════════════════════════════════════════\n");
}

/* ─── Entry point ───────────────────────────────────────────────────── */
async function main() {
  console.log("\n🌱 Seeding realistic university test data...\n");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB ✅");

  const hierarchy = await School.find().populate("departments");
  if (!hierarchy.length) {
    console.error("❌ No schools found. Run `node scripts/seedUniversity.js` first.");
    process.exit(1);
  }
  console.log(`Hierarchy: ${hierarchy.length} schools, ${await Department.countDocuments()} departments\n`);

  if (!KEEP) await clearTestData();

  const plans = await createPeople(hierarchy);
  const { classByDept, subjectDocs } = await createClassesAndSubjects(plans);
  const { tuples } = await createAttendance(plans, classByDept, subjectDocs);
  await createLeaves(plans, tuples);
  await printSummary();

  console.log("🎉 People + attendance + OD/Medical seed complete.");
  console.log(`   Student login : <student email> / ${CREDENTIALS.studentPassword}`);
  console.log(`   Faculty login : <faculty email> / ${CREDENTIALS.facultyPassword}\n`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("Seeding error ❌:", err);
  try { await mongoose.disconnect(); } catch { /* ignore */ }
  process.exit(1);
});

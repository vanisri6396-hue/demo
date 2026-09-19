/* HTTP-only E2E test for QR-based attendance.
 * Does NOT connect to Mongo directly (sandbox outbound is intermittent);
 * the running server holds the DB connection and reads/writes via its APIs.
 * Run: node scripts/testQrAttendance.js   (server up on PORT 5000)
 */
const BASE = `http://localhost:${process.env.PORT || 5000}`;

const PASS = "QrTest@123"; // passes validatePassword
const tEmail = "qr.test.teacher@test.local";
const sEmail = "qr.test.student@test.local";

async function api(method, url, body, token) {
  const res = await fetch(BASE + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { data = await res.text(); }
  return { status: res.status, data };
}

function check(name, got, expected) {
  const pass = String(got) === String(expected);
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}  (got=${JSON.stringify(got)}, want=${JSON.stringify(expected)})`);
  if (!pass) process.exitCode = 1;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getCurrentQR(token) {
  // /api/qr/history returns full session docs including currentQR (rotates every 3-4s)
  const h = await api("GET", "/api/qr/history?limit=1", null, token);
  const s = Array.isArray(h.data.sessions) ? h.data.sessions[0] : null;
  return s ? s.currentQR : null;
}

async function main() {
  // Get a school + department for hierarchy links (public endpoint)
  const hier = await api("GET", "/api/admin/hierarchy/public");
  if (hier.status !== 200 || !Array.isArray(hier.data) || hier.data.length === 0) {
    console.error("Hierarchy returned nothing — run the university seed first.");
    process.exit(1);
  }
  const school = hier.data[0];
  const dept = school.departments ? school.departments[0] : null;
  if (!dept) { console.error("No department returned from hierarchy."); process.exit(1); }
  const schoolId = school._id, deptId = dept._id;
  console.log(`Using School: ${school.name}, Dept: ${dept.name}\n`);

  // ── Register teacher + student (HTTP) ──────────────────────────────────
  const rTeacher = await api("POST", "/api/auth/register", {
    name: "QR Test Teacher", email: tEmail, password: PASS, role: "teacher",
    employeeId: "TEACH-QR-001", schoolId, departmentId: deptId,
    verificationKey: "UNIVERSITY_STAFF_2024",
  });
  check("register teacher (201 or 409 on re-run)", [201, 409].includes(rTeacher.status), true);

  const rStudent = await api("POST", "/api/auth/register", {
    name: "QR Test Student", email: sEmail, password: PASS, role: "student",
    rollNo: "QR001", schoolId, departmentId: deptId,
  });
  check("register student (201 or 409 on re-run)", [201, 409].includes(rStudent.status), true);

  // ── Login for tokens ───────────────────────────────────────────────────
  const lTeacher = await api("POST", "/api/auth/login", { email: tEmail, password: PASS });
  check("login teacher", lTeacher.status, 200);
  const lStudent = await api("POST", "/api/auth/login", { email: sEmail, password: PASS });
  check("login student", lStudent.status, 200);

  const teacherToken = lTeacher.data.token;
  const studentToken = lStudent.data.token;

  // ── Teacher starts QR session (no class required — start allows null) ─
  const start = await api("POST", "/api/qr/start", {
    lat: 12.97, lng: 77.56, radius: 800, type: "regular",
  }, teacherToken);
  check("start QR session", start.status, 200);
  const sessionId = start.data.sessionId;
  console.log("sessionId:", sessionId);

  await sleep(500); // allow session + first QR to be ready

  const qr1 = await getCurrentQR(teacherToken);
  console.log("currentQR (from history):", qr1);
  check("QR present in history", !!qr1, true);

  // ── Student scans valid QR within radius → present ────────────────────
  const scan = await api("POST", "/api/attendance/scan", {
    qr: qr1, lat: 12.97, lng: 77.56,
  }, studentToken);
  check("student scan (present)", scan.status, 200);
  check("scan message", scan.data.message, "Attendance marked ✅");

  // ── Duplicate scan → 409 Already marked ───────────────────────────────
  await sleep(400);
  const qrDup = await getCurrentQR(teacherToken);
  const dup = await api("POST", "/api/attendance/scan", {
    qr: qrDup, lat: 12.97, lng: 77.56,
  }, studentToken);
  check("duplicate scan", dup.status, 409);

  // ── Invalid QR → 400 ───────────────────────────────────────────────────
  const bad = await api("POST", "/api/attendance/scan", {
    qr: "totally-wrong-qr-code", lat: 12.97, lng: 77.56,
  }, studentToken);
  check("wrong QR code", bad.status, 400);

  // ── Out of range (Delhi vs Chennai) → 403 ─────────────────────────────
  await sleep(400);
  const qrFar = await getCurrentQR(teacherToken);
  const far = await api("POST", "/api/attendance/scan", {
    qr: qrFar, lat: 28.61, lng: 77.20,
  }, studentToken);
  check("out of range scan", far.status, 403);

  // ── Stop session ──────────────────────────────────────────────────────
  const stop = await api("POST", "/api/qr/stop", { sessionId }, teacherToken);
  check("stop QR session", stop.status, 200);

  // ── Verify through teacher history endpoint ────────────────────────────
  const hist = await api("GET", "/api/qr/history?limit=5", null, teacherToken);
  const sessDoc = Array.isArray(hist.data.sessions)
    ? hist.data.sessions.find((s) => String(s._id) === String(sessionId)) : null;
  check("history has session", !!sessDoc, true);
  check("session isActive=false", sessDoc ? sessDoc.isActive : null, false);
  check("presentStudents count", sessDoc ? (sessDoc.presentStudents || []).length : -1, 1);

  // ── Verify through student's own attendance history ────────────────────
  const myAtt = await api("GET", "/api/attendance/my", null, studentToken);
  const rec = Array.isArray(myAtt.data.records)
    ? myAtt.data.records.find((r) => {
        const sid = r.sessionId && typeof r.sessionId === "object" ? r.sessionId._id : r.sessionId;
        return sid && String(sid) === String(sessionId);
      }) : null;
  check("my history has session", !!rec, true);
  check("my record status", rec ? rec.status : null, "present");
  console.log(`  scan record: ${rec ? `${rec.date} | ${rec.status} | distance ${rec.distance}m` : "—"}`);

  console.log("\n==============================");
  console.log(process.exitCode ? "QR ATTENDANCE TEST: FAILED ❌" : "QR ATTENDANCE TEST: PASSED ✅");
  console.log("==============================\n");
  process.exit(process.exitCode || 0);
}

main().catch((e) => { console.error("Test crashed:", e); process.exit(1); });
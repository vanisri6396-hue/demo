/* E2E verification of the Faculty profile flow + School/Department mapping.
 * Covers: GET /api/admin/users/:id, populated school/department names in the
 * list endpoint, and the Delete Faculty workflow.
 * Run: node scripts/testFacultyProfile.js   (server must be up on PORT 5000)
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const BASE = `http://localhost:${process.env.PORT || 5000}`;

const PASS = "Admin@123";
const admEmail = "admin.test@university.edu";
const admId = "ADM-TEST-001";
const stamp = Date.now();

async function api(method, url, body, token) {
  const res = await fetch(BASE + url, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { data = await res.text(); }
  return { status: res.status, data };
}

function check(name, got, expected) {
  const pass = JSON.stringify(got) === JSON.stringify(expected);
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}  (got=${JSON.stringify(got)}, want=${JSON.stringify(expected)})`);
  if (!pass) process.exitCode = 1;
}

function checkIn(name, got, allowed) {
  const pass = allowed.includes(got);
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}  (got=${JSON.stringify(got)}, want one of ${JSON.stringify(allowed)})`);
  if (!pass) process.exitCode = 1;
}

async function main() {
  await api("POST", "/api/auth/register", {
    name: "Admin Test", email: admEmail, password: PASS, role: "admin", adminId: admId,
  });
  const login = await api("POST", "/api/auth/login", { adminId: admId, password: PASS });
  check("admin login via Admin ID", login.status, 200);
  const token = login.data.token;

  const hierRes = await api("GET", "/api/admin/hierarchy", null, token);
  const school = hierRes.data[0];
  const dept = school.departments[0];
  console.log(`      using school="${school.name}" department="${dept.name}"\n`);

  // ── Create the faculty member whose profile we will open ──────────
  const email = `prof.test.${stamp}@university.edu`;
  const created = await api("POST", "/api/admin/users", {
    name: `Prof Test ${stamp}`, email, password: PASS, role: "teacher",
    employeeId: `FAC-${stamp}`, schoolId: school._id, departmentId: dept._id,
  }, token);
  checkIn("faculty created (School + Department)", created.status, [201]);
  const facultyId = created.data.userId;

  // ── GET /users/:id → profile payload with real names ──────────────
  const noToken = await api("GET", `/api/admin/users/${facultyId}`, null, null);
  check("GET /users/:id without token blocked", noToken.status, 401);

  const profile = await api("GET", `/api/admin/users/${facultyId}`, null, token);
  check("GET /users/:id authorized", profile.status, 200);
  check("profile email matches", profile.data.email, email);
  check("profile school name populated (not General)", profile.data.schoolId?.name, school.name);
  check("profile department name populated (not General)", profile.data.departmentId?.name, dept.name);
  check("profile school code populated", profile.data.schoolId?.code, school.code);
  check("profile has no password field", profile.data.password, undefined);

  const missing = await api("GET", "/api/admin/users/64b000000000000000000000", null, token);
  check("GET /users/:id unknown id → 404", missing.status, 404);
  const badId = await api("GET", "/api/admin/users/not-a-real-id", null, token);
  check("GET /users/:id malformed id → 404", badId.status, 404);
// ── Faculty list (directory table) must expose the mapping too ────
  const list = await api("GET", "/api/admin/users?role=teacher&limit=100", null, token);
  check("GET /users?role=teacher authorized", list.status, 200);
  const row = list.data.users.find(u => u._id === facultyId);
  check("directory row found", !!row, true);
  check("directory row school name (fixes 'General' column)", row?.schoolId?.name, school.name);
  check("directory row department name (fixes 'General' column)", row?.departmentId?.name, dept.name);

  // ── Delete Faculty workflow (same endpoint as Delete Student) ─────
  const del = await api("DELETE", `/api/admin/users/${facultyId}`, null, token);
  check("DELETE /users/:id (Delete Faculty) succeeds", del.status, 200);

  const afterDelete = await api("GET", `/api/admin/users/${facultyId}`, null, token);
  check("deleted faculty no longer fetchable", afterDelete.status, 404);

  const listAfter = await api("GET", "/api/admin/users?role=teacher&limit=100", null, token);
  check("deleted faculty removed from directory", !!listAfter.data.users.find(u => u._id === facultyId), false);

  // ── Existing student profile flow still works ────────────────────
  const students = await api("GET", "/api/admin/users?role=student&limit=100", null, token);
  check("student directory still authorized (profile flow intact)", students.status, 200);
  check("student records still return users array", Array.isArray(students.data.users), true);

  console.log("\n==============================");
  console.log(process.exitCode ? "FACULTY PROFILE TEST: FAILED ❌" : "FACULTY PROFILE TEST: PASSED ✅");
  console.log("==============================\n");
  process.exit(process.exitCode || 0);
}

main().catch((e) => { console.error("Test crashed:", e); process.exit(1); });
/* E2E verification of the Admin "Add Member" role support.
 * Covers: student, teacher, classIncharge, HOD (authority), dean, admin
 * plus the role-based School/Department scope validations.
 * Run: node scripts/testMemberRoles.js   (server must be up on PORT 5000)
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
  // Ensure a super admin exists to act as the creator
  await api("POST", "/api/auth/register", {
    name: "Admin Test", email: admEmail, password: PASS, role: "admin", adminId: admId,
  });
  const login = await api("POST", "/api/auth/login", { adminId: admId, password: PASS });
  check("admin login via Admin ID", login.status, 200);
  const token = login.data.token;

  const hierRes = await api("GET", "/api/admin/hierarchy", null, token);
  check("GET /api/admin/hierarchy authorized", hierRes.status, 200);
  const school = hierRes.data[0];
  const dept = school.departments[0];
  console.log(`      using school="${school.name}" department="${dept.name}"\n`);

  const newUsers = [];
  const create = async (label, role, extra, deptOverride) => {
    const payload = {
      name: `${label} ${stamp}`,
      email: `${label.replace(/\W/g, "").toLowerCase()}.${stamp}@university.edu`,
      password: PASS,
      role,
      ...extra,
    };
    if (deptOverride !== undefined) payload.departmentId = deptOverride;
    const res = await api("POST", "/api/admin/users", payload, token);
    if (res.status === 201) newUsers.push(res.data.userId);
    return { ...res, payload };
  };

  // ── Department-scoped role: HOD requires School + Department ──────
  const noDept = await create("HOD", "authority", { schoolId: school._id });
  check("HOD without Department rejected", noDept.status, 400);

  const noSchool = await create("HOD", "authority", {});
  check("HOD without School rejected", noSchool.status, 400);

  const hod = await create("HOD", "authority", { schoolId: school._id, employeeId: `HOD-${stamp}` }, dept._id);
  checkIn("HOD with School + Department created", hod.status, [201]);
  const hodList = await api("GET", `/api/admin/users?role=authority&limit=100`, null, token);
  const hodDoc = hodList.data.users.find(u => u._id === (hod.data.userId || ""));
  // Users are returned with populated school/department docs → read `_id`
  const refId = (val) => (val && val._id ? val._id : val) || null;
  check("HOD stored with school scope", refId(hodDoc && hodDoc.schoolId), school._id);
  check("HOD stored with department scope", refId(hodDoc && hodDoc.departmentId), dept._id);

  // ── Student / Teacher / Class Incharge ────────────────────────────
  const student = await create("Student", "student", {
    schoolId: school._id, rollNo: `R-${stamp}`, section: "A", year: 2, semester: 3,
  }, dept._id);
  checkIn("student created (School + Department)", student.status, [201]);

  const teacher = await create("Teacher", "teacher", { schoolId: school._id, employeeId: `FAC-${stamp}` }, dept._id);
  checkIn("teacher created (School + Department)", teacher.status, [201]);

  const incharge = await create("Incharge", "classIncharge", { schoolId: school._id, employeeId: `CIC-${stamp}` }, dept._id);
  checkIn("classIncharge created (School + Department)", incharge.status, [201]);

  // ── School-scoped role: Dean needs School, no Department ──────────
  const deanNoSchool = await create("Dean", "dean", {});
  check("Dean without School rejected", deanNoSchool.status, 400);

  // A department is sent on purpose → the API must ignore/null it for Deans
  const dean = await create("Dean", "dean", { schoolId: school._id, employeeId: `DEAN-${stamp}` }, dept._id);
  checkIn("Dean with School created", dean.status, [201]);
  const deanLogin = await api("POST", "/api/auth/login", { email: dean.payload.email, password: PASS });
  check("new Dean can log in", deanLogin.status, 200);
  check("Dean schoolId assigned", deanLogin.data.schoolId, school._id);
  check("Dean departmentId is null (school-wide)", deanLogin.data.departmentId, null);

  // ── Admin remains university-wide (Admin ID only) ─────────────────
  const newAdminId = `ADM-TEST-${stamp}`;
  const admin = await create("Admin", "admin", { adminId: newAdminId });
  checkIn("admin created (Admin ID only, no School/Department)", admin.status, [201]);
  const adminLogin = await api("POST", "/api/auth/login", { adminId: newAdminId, password: PASS });
  check("new admin can log in via Admin ID", adminLogin.status, 200);
  check("new admin schoolId null (university-wide)", adminLogin.data.schoolId, null);
  check("new admin departmentId null (university-wide)", adminLogin.data.departmentId, null);

  // ── Unsupported role rejected ────────────────────────────────────
  const badRole = await create("SuperAdmin", "superadmin", { adminId: `SUP-${stamp}` });
  check("unsupported role (superadmin) rejected", badRole.status, 400);

  // ── Cleanup: remove members created by this run ───────────────────
  for (const id of newUsers) {
    const del = await api("DELETE", `/api/admin/users/${id}`, null, token);
    if (del.status !== 200) console.log(`      cleanup warning: ${id} -> ${del.status}`);
  }
  console.log(`      cleanup: removed ${newUsers.length} test accounts`);

  console.log("\n==============================");
  console.log(process.exitCode ? "MEMBER ROLES TEST: FAILED ❌" : "MEMBER ROLES TEST: PASSED ✅");
  console.log("==============================\n");
  process.exit(process.exitCode || 0);
}

main().catch((e) => { console.error("Test crashed:", e); process.exit(1); });

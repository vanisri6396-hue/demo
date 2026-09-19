/* E2E verification of the Admin role flow (login, registration, protected routes).
 * Run: node scripts/testAdminRole.js   (server must be up on PORT 5000)
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const BASE = `http://localhost:${process.env.PORT || 5000}`;

const PASS = "Admin@123";
const admEmail = "admin.test@university.edu";
const admId = "ADM-TEST-001";
const stuEmail = "admin.test.student@university.edu";

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

// Accept any of several allowed values (for idempotent checks)
function checkIn(name, got, allowed) {
  const pass = allowed.includes(got);
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}  (got=${JSON.stringify(got)}, want one of ${JSON.stringify(allowed)})`);
  if (!pass) process.exitCode = 1;
}

async function main() {
  // Register admin with ONLY Admin ID + password (NO school/dept, NO faculty key)
  const reg = await api("POST", "/api/auth/register", {
    name: "Admin Test", email: admEmail, password: PASS,
    role: "admin", adminId: admId,
  });
  checkIn("admin register (no school/dept/faculty-key)", reg.status, [201, 409]);

  // Login with Admin ID + password (no email)
  const login = await api("POST", "/api/auth/login", { adminId: admId, password: PASS });
  check("admin login via Admin ID", login.status, 200);
  check("login role", login.data.role, "admin");
  check("login returns adminId", login.data.adminId, admId);
  const token = login.data.token;

  // me endpoint → school/dept null (university-wide)
  const me = await api("GET", "/api/auth/me", null, token);
  check("me schoolId is null", me.data.schoolId, null);
  check("me departmentId is null", me.data.departmentId, null);

  // Protected admin route with valid admin token → 200
  const dash = await api("GET", "/api/admin/dashboard", null, token);
  check("GET /api/admin/dashboard (admin) authorized", dash.status, 200);

  const users = await api("GET", "/api/admin/users", null, token);
  check("GET /api/admin/users (admin) authorized", users.status, 200);

  // Protected route WITHOUT token → 401
  const noTok = await api("GET", "/api/admin/dashboard", null, null);
  check("GET /api/admin/dashboard (no token) blocked", noTok.status, 401);

  // Non-admin (student) attempting admin routes → 403
  await api("POST", "/api/auth/register", {
    name: "DoorDash Student", email: stuEmail, password: PASS, role: "student",
  });
  const stuLogin = await api("POST", "/api/auth/login", { email: stuEmail, password: PASS });
  const stuToken = stuLogin.data.token;
  const stuDash = await api("GET", "/api/admin/dashboard", null, stuToken);
  check("student cannot access dashboard", stuDash.status, 403);
  const stuCreate = await api("POST", "/api/admin/users", {
    name: "X", email: "x@x.com", password: PASS, role: "student",
  }, stuToken);
  check("student cannot create users", stuCreate.status, 403);

  // ── Admin creates ANOTHER admin via protected route (Admin ID only) ──
  const newAdmId    = "ADM-TEST-002";
  const newAdmEmail = "admin.test2@university.edu";

  const create = await api("POST", "/api/admin/users", {
    name: "Admin Two", email: newAdmEmail, password: PASS,
    role: "admin", adminId: newAdmId,
  }, token);
  checkIn("admin creates admin (Admin ID only, no school/dept)", create.status, [201, 409]);

  const newLogin = await api("POST", "/api/auth/login", { adminId: newAdmId, password: PASS });
  check("new admin can log in via Admin ID", newLogin.status, 200);
  const newMe = await api("GET", "/api/auth/me", null, newLogin.data.token);
  check("new admin schoolId null (university-wide)", newMe.data.schoolId, null);
  check("new admin departmentId null (university-wide)", newMe.data.departmentId, null);

  // Admin creation WITHOUT Admin ID → 400
  const noId = await api("POST", "/api/admin/users", {
    name: "Admin Three", email: "admin.test3@university.edu", password: PASS, role: "admin",
  }, token);
  check("admin create without Admin ID rejected", noId.status, 400);

  // Duplicate Admin ID → 409
  const dupAdmId = await api("POST", "/api/admin/users", {
    name: "Admin Four", email: "admin.test4@university.edu", password: PASS,
    role: "admin", adminId: newAdmId,
  }, token);
  check("duplicate Admin ID rejected", dupAdmId.status, 409);

  console.log("\n==============================");
  console.log(process.exitCode ? "ADMIN ROLE TEST: FAILED ❌" : "ADMIN ROLE TEST: PASSED ✅");
  console.log("==============================\n");
  process.exit(process.exitCode || 0);
}

main().catch((e) => { console.error("Test crashed:", e); process.exit(1); });
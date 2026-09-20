/* Verifies the Faculty Directory search + School/Department filter logic.
 * Replicates the exact predicate used in client/src/pages/hod/FacultyManager.jsx
 * (useMemo filteredFaculty) and runs it against real API data shapes.
 * Run: node scripts/testFacultyFilters.js   (server must be up on PORT 5000)
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

/* ── Exact copy of the component's helpers + predicate ─────────────── */
const schoolRef = (member) => member.schoolId?._id || member.schoolId || "";
const deptRef   = (member) => member.departmentId?._id || member.departmentId || "";

function applyRefinements(faculty, { searchQuery = "", filterSchoolId = "", filterDeptId = "" }) {
  const q = searchQuery.trim().toLowerCase();

  return faculty.filter(member => {
    const matchesSearch = !q || [
      member.name, member.email, member.employeeId,
      member.schoolId?.name, member.departmentId?.name, member.department
    ].some(value => (value || "").toLowerCase().includes(q));

    const matchesSchool = !filterSchoolId || schoolRef(member) === filterSchoolId;
    const matchesDept   = !filterDeptId   || deptRef(member)   === filterDeptId;

    return matchesSearch && matchesSchool && matchesDept;
  });
}

async function main() {
  await api("POST", "/api/auth/register", {
    name: "Admin Test", email: admEmail, password: PASS, role: "admin", adminId: admId,
  });
  const login = await api("POST", "/api/auth/login", { adminId: admId, password: PASS });
  check("admin login", login.status, 200);
  const token = login.data.token;

  const hier = await api("GET", "/api/admin/hierarchy", null, token);
  const schoolA = hier.data[0];
  const deptA1  = schoolA.departments[0];
  const deptA2  = schoolA.departments[1];
  const schoolB = hier.data.find(s => s._id !== schoolA._id) || hier.data[0];
  const deptB1  = schoolB.departments[0];
  console.log(`      A="${schoolA.name}" / "${deptA1.name}"+"${deptA2.name}"`);
  console.log(`      B="${schoolB.name}" / "${deptB1.name}"\n`);

  const created = [];
  const mk = async (name, schoolId, departmentId) => {
    const email = `${name.replace(/\W/g, "").toLowerCase()}.${stamp}@university.edu`;
    const res = await api("POST", "/api/admin/users", {
      name, email, password: PASS, role: "teacher",
      employeeId: `EMP-${name.replace(/\W/g, "").toUpperCase()}-${stamp}`,
      schoolId, departmentId,
    }, token);
    if (res.status === 201) created.push(res.data.userId);
    return { ...res, email };
  };

  const n1 = await mk(`Alpha Sorter ${stamp}`, schoolA._id, deptA1._id);
  const n2 = await mk(`Beta Sorter ${stamp}`,  schoolA._id, deptA2._id);
  const n3 = await mk(`Gamma Sorter ${stamp}`, schoolB._id, deptB1._id);
  check("3 test faculty created", [n1.status, n2.status, n3.status], [201, 201, 201]);

  // Narrow to just this run's records (mirrors the component loading ?role=teacher)
  const listRes = await api("GET", "/api/admin/users?role=teacher&limit=200", null, token);
  const faculty = (listRes.data.users || []).filter(u => u.name.includes(`Sorter ${stamp}`));
  check("test faculty loaded from API", faculty.length, 3);

  // 1. Search filters per keystroke (substring, case-insensitive)
  check("search 'alpha' → 1 match",
    applyRefinements(faculty, { searchQuery: "alpha" }).map(f => f.name.split(" ")[0]), ["Alpha"]);
  check("search 'SORT' → all 3 matches",
    applyRefinements(faculty, { searchQuery: "SORT" }).length, 3);
  check("search 'gamm' → 1 match",
    applyRefinements(faculty, { searchQuery: "gamm" }).map(f => f.name.split(" ")[0]), ["Gamma"]);
  check("search 'no-such-faculty' → 0 matches",
    applyRefinements(faculty, { searchQuery: "no-such-faculty" }).length, 0);
// 2. School filter alone
  check("filter by School A → 2 (Alpha, Beta)",
    applyRefinements(faculty, { filterSchoolId: schoolA._id }).map(f => f.name.split(" ")[0]).sort(),
    ["Alpha", "Beta"]);
  check("filter by School B → 1 (Gamma)",
    applyRefinements(faculty, { filterSchoolId: schoolB._id }).map(f => f.name.split(" ")[0]),
    ["Gamma"]);

  // 3. Department filter (requires its School, as the UI cascades)
  check("filter by Dept A1 → 1 (Alpha)",
    applyRefinements(faculty, { filterSchoolId: schoolA._id, filterDeptId: deptA1._id }).map(f => f.name.split(" ")[0]),
    ["Alpha"]);
  check("filter by Dept A2 → 1 (Beta)",
    applyRefinements(faculty, { filterSchoolId: schoolA._id, filterDeptId: deptA2._id }).map(f => f.name.split(" ")[0]),
    ["Beta"]);
  check("Dept filter for another School's dept → 0 (no cross-school leak)",
    applyRefinements(faculty, { filterSchoolId: schoolA._id, filterDeptId: deptB1._id }).length, 0);

  // 4. Search + filters combined
  check("search 'sorter' + School A → 2 combined",
    applyRefinements(faculty, { searchQuery: "sorter", filterSchoolId: schoolA._id }).length, 2);
  check("search 'beta' + School A + Dept A1 → 0 (all three together)",
    applyRefinements(faculty, { searchQuery: "beta", filterSchoolId: schoolA._id, filterDeptId: deptA1._id }).length, 0);
  check("search 'beta' + School A + Dept A2 → 1 (all three together)",
    applyRefinements(faculty, { searchQuery: "beta", filterSchoolId: schoolA._id, filterDeptId: deptA2._id })
      .map(f => f.name.split(" ")[0]), ["Beta"]);

  // 5. Employee ID / email are searchable, and clearing restores everything
  check("search by employee id fragment → 1 (Alpha only)",
    applyRefinements(faculty, { searchQuery: "ALPHASORTER" }).map(f => f.name.split(" ")[0]), ["Alpha"]);
  check("search by email fragment → 1 (Gamma only)",
    applyRefinements(faculty, { searchQuery: "gammasorter" }).map(f => f.name.split(" ")[0]), ["Gamma"]);
  check("clearing all refinements restores 3",
    applyRefinements(faculty, { searchQuery: "", filterSchoolId: "", filterDeptId: "" }).length, 3);

  // ── Cleanup ──────────────────────────────────────────────────────
  for (const id of created) await api("DELETE", `/api/admin/users/${id}`, null, token);
  console.log(`      cleanup: removed ${created.length} test accounts`);

  console.log("\n==============================");
  console.log(process.exitCode ? "FACULTY FILTER TEST: FAILED ❌" : "FACULTY FILTER TEST: PASSED ✅");
  console.log("==============================\n");
  process.exit(process.exitCode || 0);
}

main().catch((e) => { console.error("Test crashed:", e); process.exit(1); });
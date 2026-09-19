/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UNIVERSITY HIERARCHY — SINGLE SOURCE OF TRUTH
 *
 * This is the ONLY canonical copy of the Takshashila University academic
 * hierarchy (School → Department → Programs). Both the standalone seed script
 * (`server/scripts/seedUniversity.js`) and the in-app seed endpoint
 * (`server/controllers/adminController.js → seedUniversityData`) import from
 * this file so the two seeding paths can never drift apart again.
 *
 * If you change the hierarchy, edit ONLY this file and re-run the seed.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const universityData = [
  {
    name: "School of Computational Engineering",
    code: "SCE",
    departments: [
      { name: "Computer Science and Engineering", code: "CSE", programs: ["B.Tech Computer Science and Engineering", "B.Tech CSE (AI & ML)", "M.Tech CSE (AI)", "Ph.D Computer Science & Engineering"] },
      { name: "Artificial Intelligence & Data Science", code: "AIDS_SCE", programs: ["B.Tech Artificial Intelligence and Data Science", "M.Tech CSE (Big Data)"] },
      { name: "Information Technology", code: "IT", programs: ["B.Tech Information Technology", "M.Tech CSE (IoT & Cloud Computing)"] },
      { name: "Cyber Security", code: "CYS", programs: ["B.Tech CSE (Cyber Security)"] },
      { name: "Applied AI", code: "AAI", programs: ["B.Tech CSE (Applied AI)"] }
    ]
  },
  {
    name: "School of Core Engineering",
    code: "SCORE",
    departments: [
      { name: "Electronics and Communication Engineering", code: "ECE", programs: ["B.Tech Electronics and Communication Engineering", "M.Tech Communication Systems", "Ph.D Electronics and Communication Engineering"] },
      { name: "Electrical and Electronics Engineering", code: "EEE", programs: ["B.Tech Electrical and Electronics Engineering"] },
      { name: "Mechanical Engineering", code: "MECH", programs: ["B.Tech Mechanical Engineering"] },
      { name: "Civil Engineering", code: "CIVIL", programs: ["B.Tech Civil Engineering"] }
    ]
  },
  {
    name: "Takshashila Medical College",
    code: "TMC",
    departments: [
      { name: "Medicine (MBBS)", code: "MBBS", programs: ["MBBS"] },
      { name: "Medical Anatomy", code: "ANAT", programs: ["M.Sc Medical Anatomy"] },
      { name: "Medical Biochemistry", code: "BIOCH", programs: ["M.Sc Medical Biochemistry"] },
      { name: "Medical Microbiology", code: "MICRO", programs: ["M.Sc Medical Microbiology"] },
      { name: "Medical Pharmacology", code: "PHARM_MED", programs: ["M.Sc Medical Pharmacology"] },
      { name: "Medical Physiology", code: "PHYSIOL", programs: ["M.Sc Medical Physiology"] }
    ]
  },
  {
    name: "School of Basic Sciences",
    code: "SBS",
    departments: [
      { name: "Chemistry", code: "CHEM", programs: ["B.Sc Chemistry", "M.Sc Chemistry"] },
      { name: "Mathematics", code: "MATH", programs: ["M.Sc Mathematics"] },
      { name: "Physics", code: "PHYS", programs: ["M.Sc Physics"] }
    ]
  },
  {
    name: "School of Humanities",
    code: "SOH",
    departments: [
      { name: "Tamil", code: "TAM", programs: ["B.A Tamil", "M.A Tamil"] },
      { name: "English", code: "ENG", programs: ["B.A English", "M.A English"] }
    ]
  },
  {
    name: "School of Agricultural Sciences",
    code: "SAS",
    departments: [
      { name: "Agriculture", code: "AGRI", programs: ["B.Sc (Hons) Agriculture"] }
    ]
  },
  {
    name: "School of Allied Health Sciences",
    code: "SAHS",
    departments: [
      { name: "Cardiac Technology", code: "CT", programs: ["B.Sc Cardiac Technology"] },
      { name: "Medical Laboratory Technology", code: "MLT", programs: ["B.Sc Medical Laboratory Technology"] },
      { name: "Optometry", code: "OPT", programs: ["B.Sc Optometry"] },
      { name: "Operation Theatre & Anesthesia Technology", code: "OTAT", programs: ["B.Sc Operation Theatre and Anesthesia Technology"] },
      { name: "Physician Assistant", code: "PA", programs: ["B.Sc Physician Assistant"] },
      { name: "Radio Imaging Technology", code: "RIT", programs: ["B.Sc Radio Imaging Technology"] },
      { name: "Cardiac Perfusion Technology", code: "CPT", programs: ["B.Sc Cardiac Perfusion Technology"] }
    ]
  },
  {
    name: "School of Commerce",
    code: "SOC",
    departments: [
      { name: "Commerce", code: "COMM", programs: ["B.Com General", "M.Com"] },
      { name: "Accounting & Finance", code: "AF", programs: ["B.Com Accounting and Finance"] }
    ]
  },
  {
    name: "School of Computer Science",
    code: "SCS",
    departments: [
      { name: "Computer Science", code: "CS_SCS", programs: ["MCA (Master of Computer Applications)"] },
      { name: "Artificial Intelligence & Data Science", code: "AIDS_SCS", programs: ["B.Sc Computer Science (AI & DS)"] }
    ]
  },
  {
    name: "School of Management Studies",
    code: "SMS",
    departments: [
      { name: "Business Administration", code: "BA_SMS", programs: ["MBA (Master of Business Administration)", "Ph.D Management"] },
      { name: "FinTech", code: "FT", programs: ["BBA (FinTech)"] }
    ]
  },
  {
    name: "School of Social Sciences",
    code: "SSS",
    departments: [
      { name: "Defense & Strategic Studies", code: "DSS", programs: ["B.A Defense and Strategic Studies", "M.A Defence and Strategic Studies"] },
      { name: "International Relations & Public Policy", code: "IRPP", programs: ["B.A International Relations and Public Policy"] },
      { name: "Social Work", code: "SW", programs: ["B.A Social Work", "Master of Social Work (MSW)"] },
      { name: "Library & Information Sciences", code: "LIS", programs: ["B.Lib.I.Sc", "M.Lib.I.Sc"] },
      { name: "Economics", code: "ECON", programs: ["M.A Economics"] }
    ]
  },
  {
    name: "School of Nursing",
    code: "SON",
    departments: [
      { name: "Nursing", code: "NUR", programs: ["B.Sc Nursing", "M.Sc Nursing"] }
    ]
  },
  {
    name: "School of Pharmacy",
    code: "SOP",
    departments: [
      { name: "Pharmacy", code: "PHARM", programs: ["Bachelor of Pharmacy (B.Pharm)", "M.Pharm"] }
    ]
  },
  {
    name: "School of Physiotherapy",
    code: "SPT",
    departments: [
      { name: "Physiotherapy", code: "PHYSIO", programs: ["Bachelor of Physiotherapy (BPT)", "Master of Physiotherapy (MPT)"] }
    ]
  }
];

module.exports = universityData;
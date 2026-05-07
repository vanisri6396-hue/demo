const mongoose = require('mongoose');
const School = require('../models/School');
const Department = require('../models/Department');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const universityData = [
  {
    name: "School of Computational Engineering",
    code: "SCE",
    departments: [
      { name: "Computer Science and Engineering", code: "CSE", programs: ["B.Tech Computer Science and Engineering", "B.Tech CSE (AI & ML)", "M.Tech CSE (AI)", "Ph.D Computer Science & Engineering"] },
      { name: "Artificial Intelligence & Data Science", code: "AIDS_SCE", programs: ["B.Tech Artificial Intelligence and Data Science", "M.Tech CSE (Big Data)"] },
      { name: "Information Technology", code: "IT", programs: ["B.Tech Information Technology", "M.Tech CSE (IoT & Cloud Computing)"] },
      { name: "Cyber Security", code: "CS", programs: ["B.Tech CSE (Cyber Security)"] },
      { name: "Applied AI", code: "AAI", programs: ["B.Tech CSE (Applied AI)"] }
    ]
  },
  {
    name: "School of Core Engineering",
    code: "SCORE",
    departments: [
      { name: "Electronics and Communication Engineering", code: "ECE", programs: ["B.Tech Electronics and Communication Engineering", "M.Tech Communication Systems", "Ph.D Electronics and Communication Engineering"] }
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
      { name: "Tamil", code: "TAM", programs: ["B.A Tamil"] },
      { name: "English", code: "ENG", programs: ["M.A English"] }
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
      { name: "Business Administration", code: "BA", programs: ["MBA (Master of Business Administration)", "Ph.D Management"] },
      { name: "FinTech", code: "FT", programs: ["BBA (FinTech)"] }
    ]
  },
  {
    name: "School of Social Studies",
    code: "SSS",
    departments: [
      { name: "Defense & Strategic Studies", code: "DSS", programs: ["B.A Defense and Strategic Studies"] },
      { name: "International Relations & Public Policy", code: "IRPP", programs: ["B.A International Relations and Public Policy"] },
      { name: "Social Work", code: "SW", programs: ["Master of Social Work"] }
    ]
  },
  {
    name: "School of Nursing",
    code: "SON",
    departments: [
      { name: "Nursing", code: "NUR", programs: ["B.Sc Nursing"] }
    ]
  },
  {
    name: "School of Pharmacy",
    code: "SOP",
    departments: [
      { name: "Pharmacy", code: "PHARM", programs: ["Bachelor of Pharmacy (B.Pharm)"] }
    ]
  },
  {
    name: "School of Physiotherapy",
    code: "SPT",
    departments: [
      { name: "Physiotherapy", code: "PHYSIO", programs: ["Bachelor of Physiotherapy (BPT)"] }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB ✅");

    // Clear existing schools and departments
    await School.deleteMany({});
    await Department.deleteMany({});
    console.log("Cleared existing schools and departments 🗑️");

    for (const schoolData of universityData) {
      const school = new School({
        name: schoolData.name,
        code: schoolData.code
      });
      await school.save();
      console.log(`Created School: ${school.name}`);

      const deptIds = [];
      for (const deptData of schoolData.departments) {
        const dept = new Department({
          name: deptData.name,
          code: deptData.code,
          schoolId: school._id,
          programs: deptData.programs
        });
        await dept.save();
        deptIds.push(dept._id);
        console.log(`  - Created Department: ${dept.name}`);
      }

      school.departments = deptIds;
      await school.save();
    }

    console.log("University hierarchy seeded successfully! 🎉");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error ❌:", err);
    process.exit(1);
  }
}

seed();

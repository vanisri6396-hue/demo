const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require('mongoose');
const School = require('../models/School');
const Department = require('../models/Department');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Single source of truth for the academic hierarchy (School -> Department -> Programs)
const universityData = require('../data/universityData');

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

    console.log("\nUniversity hierarchy seeded successfully! 🎉");
    console.log(`Total Schools: ${universityData.length}`);
    console.log(`Total Departments: ${universityData.reduce((acc, s) => acc + s.departments.length, 0)}`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error ❌:", err);
    process.exit(1);
  }
}

seed();
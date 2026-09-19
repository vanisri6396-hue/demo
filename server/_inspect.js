const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("connected");
  const School = require("./models/School");
  const Department = require("./models/Department");

  console.log("Total Schools:", await School.countDocuments());
  const sc = await School.find().populate("departments");
  sc.forEach((s) =>
    console.log(" -", s.code, "|", s.name, "| depts:", s.departments.length)
  );

  console.log("Total Departments:", await Department.countDocuments());
  const dep = await Department.find();
  dep.forEach((d) => console.log("   ", d.code, "|", d.name, "| programs:", (d.programs || []).length));

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
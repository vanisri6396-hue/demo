const mongoose = require("mongoose");
const User = require("../models/User");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const cleanupDeans = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/smart-attendance";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB ✅");

    const result = await User.deleteMany({ role: "dean" });
    console.log(`Successfully removed ${result.deletedCount} old Dean accounts 🗑️`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed ❌", err);
    process.exit(1);
  }
};

cleanupDeans();

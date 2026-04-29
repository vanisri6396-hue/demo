const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

/* ─── REGISTER ──────────────────────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, role,
      rollNo, employeeId,
      department, section, year, semester, phone
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required ❌" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already registered ❌" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role || "student",
      rollNo:     rollNo     || "",
      employeeId: employeeId || "",
      department: department || "",
      section:    section    || "",
      year:       year       || 1,
      semester:   semester   || 1,
      phone:      phone      || ""
    });

    res.status(201).json({ message: "User registered successfully ✅", userId: user._id });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed ❌" });
  }
};

/* ─── LOGIN ─────────────────────────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required ❌" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account deactivated. Contact admin ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password ❌" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role:       user.role,
      name:       user.name,
      email:      user.email,
      rollNo:     user.rollNo,
      employeeId: user.employeeId,
      department: user.department,
      section:    user.section,
      year:       user.year,
      semester:   user.semester,
      userId:     user._id
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed ❌" });
  }
};

/* ─── GET ME ─────────────────────────────────────────────────────────── */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("assignedClasses", "name department section year semester");

    if (!user) return res.status(404).json({ message: "User not found ❌" });

    res.json(user);
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Failed to fetch profile ❌" });
  }
};
/* ─── UPDATE PROFILE ─────────────────────────────────────────────────── */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, department, section, year, semester } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, department, section, year, semester },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Profile updated ✅", user: updated });
  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ message: "Update failed ❌" });
  }
};

/* ─── CHANGE PASSWORD ────────────────────────────────────────────────── */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password ❌" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully ✅" });
  } catch (err) {
    console.error("ChangePassword error:", err);
    res.status(500).json({ message: "Failed to change password ❌" });
  }
};

/* ─── UPDATE NOTIFICATIONS ───────────────────────────────────────────── */
exports.updateNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;
    // Assuming User model has a notifications field (as a subdocument or JSON)
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationSettings: notifications },
      { new: true }
    );

    res.json({ message: "Notification settings updated ✅", settings: user.notificationSettings });
  } catch (err) {
    console.error("UpdateNotifications error:", err);
    res.status(500).json({ message: "Update failed ❌" });
  }
};
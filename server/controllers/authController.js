const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");
const { validatePassword } = require("../utils/validators");

/* ─── REGISTER ──────────────────────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, role,
      rollNo, employeeId,
      department, section, year, semester, phone,
      verificationKey, schoolId, departmentId, adminId
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required ❌" });
    }

    // Password Strength Check
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    // ── Admin: Admin ID + password only (university-wide, no school/dept, no faculty key)
    const adminRole = role === "admin";
    if (adminRole) {
      const adminIdProvided = (adminId || employeeId || "").trim();
      if (!adminIdProvided) {
        return res.status(400).json({ message: "Admin ID is required ❌" });
      }
      const adminIdExists = await User.findOne({ adminId: adminIdProvided });
      if (adminIdExists) {
        return res.status(409).json({ message: "Admin ID already in use ❌" });
      }
    }

    // Security: Check for faculty verification key if role is not student/admin
    if (role !== "student" && !adminRole) {
      const serverKey = process.env.FACULTY_SECRET_KEY || "UNIVERSITY_STAFF_2024";
      if (verificationKey !== serverKey) {
        return res.status(403).json({ message: "Invalid Faculty Verification Key! ❌" });
      }
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already registered ❌" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Sanitize school/department IDs (convert empty strings to null to avoid cast errors)
    // Admin is university-wide → always null (full access across all schools/depts)
    const isAdmin = adminRole;
    const sanitizedSchoolId = isAdmin ? null : ((schoolId && schoolId.trim() !== "") ? schoolId : null);
    const sanitizedDeptId = isAdmin ? null : ((departmentId && departmentId.trim() !== "") ? departmentId : null);

    const adminIdValue = isAdmin ? (adminId || employeeId || "").trim() : "";
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role || "student",
      schoolId: sanitizedSchoolId,
      departmentId: sanitizedDeptId,
      rollNo:     rollNo     || "",
      employeeId: isAdmin ? adminIdValue : (employeeId || ""),
      adminId:    isAdmin ? adminIdValue : (adminId || ""),
      department: department || "",
      section:    section    || "",
      year:       year       || 1,
      semester:   semester   || 1,
      phone:      phone      || ""
    });

    res.status(201).json({ message: "User registered successfully ✅", userId: user._id });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ 
      message: "Registration failed ❌", 
      error: err.message 
    });
  }
};

/* ─── LOGIN ─────────────────────────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password, adminId } = req.body;

    // Admins may log in with Admin ID (or email/employeeId for backward compat)
    const identifier = (adminId && adminId.trim()) || (email && email.trim());

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Admin ID and password are required ❌" });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { adminId: identifier },
        { employeeId: identifier }
      ]
    });
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
      adminId:    user.adminId,
      department: user.department,
      section:    user.section,
      year:       user.year,
      semester:   user.semester,
      schoolId:   user.schoolId,
      departmentId: user.departmentId,
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
    
    // Password Strength Check
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

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
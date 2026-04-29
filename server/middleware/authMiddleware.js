const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "smart_attendance_super_secret_key_2024";

/* ─── Verify JWT token ──────────────────────────────────────────────── */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided ❌" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token ❌" });
  }
};

/* ─── Role guard (variadic) ─────────────────────────────────────────── */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(", ")} ❌`
      });
    }
    next();
  };
};

module.exports = { verifyToken, allowRoles, JWT_SECRET };
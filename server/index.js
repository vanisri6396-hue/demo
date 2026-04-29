const express  = require("express");
const http     = require("http");
const { Server } = require("socket.io");
const cors     = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

/* =============================================================
   🔹 MIDDLEWARE
============================================================= */
app.use(cors({ origin: "*", methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"] }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =============================================================
   🔹 MONGODB CONNECTION
============================================================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* =============================================================
   🔹 HTTP SERVER
============================================================= */
const server = http.createServer(app);

/* =============================================================
   🔹 SOCKET.IO
============================================================= */
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] }
});

global.io             = io;
global.activeSessions = {};

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

/* =============================================================
   🔹 API ROUTES
============================================================= */
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/qr",            require("./routes/qrRoutes"));
app.use("/api/attendance",    require("./routes/attendanceRoutes"));
app.use("/api/admin",         require("./routes/adminRoutes"));
app.use("/api/teacher",       require("./routes/teacherRoutes"));
app.use("/api/student",       require("./routes/studentRoutes"));
app.use("/api/classes",       require("./routes/classRoutes"));
app.use("/api/leave",         require("./routes/leaveRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

/* =============================================================
   🔹 HEALTH CHECK
============================================================= */
app.get("/", (req, res) => {
  res.json({
    status:  "running",
    message: "🚀 Smart Attendance API is live",
    routes: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET  /api/auth/me",
      "POST /api/qr/start",
      "POST /api/qr/stop",
      "POST /api/attendance/scan",
      "GET  /api/admin/dashboard",
      "GET  /api/teacher/classes",
      "GET  /api/student/attendance",
      "POST /api/leave/submit",
      "GET  /api/notifications"
    ]
  });
});

/* =============================================================
   🔹 404 HANDLER
============================================================= */
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

/* =============================================================
   🔹 GLOBAL ERROR HANDLER
============================================================= */
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

/* =============================================================
   🔹 START SERVER
============================================================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🔥 Smart Attendance Server running on port ${PORT}`);
  console.log(`   ➜ Local:   http://localhost:${PORT}`);
  console.log(`   ➜ Health:  http://localhost:${PORT}/\n`);
});
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

/* =========================
   🔹 MIDDLEWARE
========================= */
app.use(cors({ origin: "*" }))

app.use(express.json());

/* =========================
   🔹 MONGODB CONNECTION
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB Error ❌", err));

/* =========================
   🔹 CREATE SERVER
========================= */
const server = http.createServer(app);

/* =========================
   🔹 SOCKET.IO SETUP
========================= */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

/* =========================
   🔥 GLOBAL SOCKET (IMPORTANT)
========================= */
global.io = io;

/* =========================
   🔹 SOCKET CONNECTION
========================= */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* =========================
   🔹 ROUTES
========================= */
app.use("/api/qr", require("./routes/qrRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
/* =========================
   🔹 TEST ROUTE (OPTIONAL)
========================= */
app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

/* =========================
   🔹 START SERVER
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🔥`);
});




const express = require("express");
const router = express.Router();
const { scanQR } = require("../controllers/attendanceController");

router.post("/scan", scanQR);

module.exports = router;
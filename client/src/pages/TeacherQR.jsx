import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";

// 🔌 socket connection
const socket = io("http://localhost:5000");

export default function TeacherQR() {
  const [qr, setQR] = useState("");
  const [status, setStatus] = useState("");
  const [students, setStudents] = useState([]);
  const [absent, setAbsent] = useState([]);

  // 🚀 Start Attendance
  const startQR = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("Please login first ❌");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          await axios.post(
            "http://localhost:5000/api/qr/start",
            {
              lat,
              lng,
              radius: 50
            },
            {
              headers: {
                Authorization: `Bearer ${token}` // 🔥 IMPORTANT
              }
            }
          );

          setStatus("Attendance Started ✅");
          setStudents([]);
          setAbsent([]);

        } catch (err) {
          console.error("FULL ERROR:", err.response || err);

          if (err.response?.status === 401) {
            setStatus("Unauthorized ❌ Login again");
          } else if (err.response?.status === 403) {
            setStatus("Only teachers allowed ❌");
          } else {
            setStatus("Error starting attendance ❌");
          }
        }
      },
      () => {
        setStatus("Location permission denied ❌");
      }
    );
  };

  // 🔄 socket listeners
  useEffect(() => {
    socket.on("qr-update", (data) => {
      setQR(data);
    });

    socket.on("attendance-update", (data) => {
      setStudents(data);
    });

    socket.on("attendance-final", (data) => {
      setAbsent(data.absent);
    });

    return () => {
      socket.off("qr-update");
      socket.off("attendance-update");
      socket.off("attendance-final");
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>👨‍🏫 Teacher Dashboard</h1>

      <button onClick={startQR}>Start Attendance</button>

      <p>{status}</p>

      {/* QR */}
      {qr && (
        <div style={{ marginTop: "20px" }}>
          <QRCodeCanvas value={qr} size={200} />
        </div>
      )}

      {/* PRESENT */}
      <h2 style={{ marginTop: "30px" }}>✅ Present Students</h2>

      {students.length === 0 ? (
        <p>No students scanned yet</p>
      ) : (
        <ul>
          {students.map((s, i) => (
            <li key={i}>
              {s.name} ({s.rollNo}) — 📍 {s.distance}m
            </li>
          ))}
        </ul>
      )}

      {/* ABSENT */}
      <h2 style={{ marginTop: "30px" }}>❌ Absent Students</h2>

      {absent.length === 0 ? (
        <p>Waiting for result...</p>
      ) : (
        <ul>
          {absent.map((s, i) => (
            <li key={i}>
              {s.name} ({s.rollNo})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
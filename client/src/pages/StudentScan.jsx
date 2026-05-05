import { useEffect } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import { BASE_URL } from "../config";
export default function StudentScan() {
  useEffect(() => {
    let scanner = null;

    const startScanner = async () => {
      // Small delay to ensure DOM is ready
      await new Promise(r => setTimeout(r, 100));
      const element = document.getElementById("reader");
      if (!element) return;

      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        async (decodedText) => {
          try {
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const token = localStorage.getItem("token");
                try {
                  const res = await axios.post(`${BASE_URL}/api/attendance/scan`, {
                    qrValue: decodedText,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  alert(res.data.message || "Attendance Marked ✅");
                } catch (apiErr) {
                  const msg = apiErr.response?.data?.message || "Attendance Failed ❌";
                  alert(msg);
                }
              },
              (gpsErr) => {
                alert("GPS Error: Please enable location access 📍");
              }
            );
          } catch (err) {
            alert("Scanner Error ❌");
          }
        },
        (error) => {
          // Ignore scanner noise
        }
      );
    };

    startScanner();

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Scanner cleanup error:", err));
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Scan QR</h1>
      <div id="reader"></div>
    </div>
  );
}
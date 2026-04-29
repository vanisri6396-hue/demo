import { useEffect } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function StudentScan() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            await axios.post("http://localhost:5000/api/attendance/scan", {
              qrValue: decodedText,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });

            alert("Attendance Marked ✅");
          });
        } catch (err) {
          alert("Error ❌");
        }
      },
      () => {}
    );

    return () => scanner.clear();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Scan QR</h1>
      <div id="reader"></div>
    </div>
  );
}
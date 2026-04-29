import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
export default function Admin() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/admin/dashboard`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            }
          }
        );

        setData(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ textAlign: "center" }}>
      <h1>📊 Admin Dashboard</h1>

      <h3>Total Students: {data.totalStudents}</h3>
      <h3>Present: {data.presentCount}</h3>
      <h3>Absent: {data.absentCount}</h3>

      <h2>✅ Present Students</h2>
      <ul>
        {data.present.map((s, i) => (
          <li key={i}>{s.name} ({s.rollNo})</li>
        ))}
      </ul>

      <h2>❌ Absent Students</h2>
      <ul>
        {data.absent.map((s, i) => (
          <li key={i}>{s.name} ({s.rollNo})</li>
        ))}
      </ul>
    </div>
  );
}
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import TeacherQR from "./pages/TeacherQR";
import StudentScan from "./pages/StudentScan";
import Admin from "./pages/Admin";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />   {/* 👈 IMPORTANT */}
        <Route path="/teacher" element={<TeacherQR />} />
        <Route path="/student" element={<StudentScan />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
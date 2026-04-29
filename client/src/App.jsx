import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./components/layout/DashboardLayout";

// Role-based pages
import SectionDetails from "./pages/admin/SectionDetails";
import DepartmentIntelligence from "./pages/hod/DepartmentIntelligence";
import ODRequests from "./pages/student/ODRequests";
import MedicalLeave from "./pages/student/MedicalLeave";
import InstructorConsole from "./pages/instructor/InstructorConsole";
import Timetable from "./pages/teacher/Timetable";
import AttendanceLogs from "./pages/teacher/AttendanceLogs";
import LeavePermissions from "./pages/teacher/LeavePermissions";
import TimetableManager from "./pages/admin/TimetableManager";
import ExamInvigilation from "./pages/invigilator/ExamInvigilation";
import Settings from "./pages/shared/Settings";
import StudentDashboard from "./pages/student/StudentDashboard";
import QRScanner from "./pages/student/QRScanner";
import AttendanceHistory from "./pages/student/AttendanceHistory";
import ApprovalDashboard from "./pages/hod/ApprovalDashboard";
import EventManager from "./pages/shared/EventManager";
import MonthlyReport from "./pages/hod/MonthlyReport";
import SectionIntelligence from "./pages/hod/SectionIntelligence";
import FacultyManager from "./pages/hod/FacultyManager";
import HODStatistics from "./pages/hod/HODStatistics";
import AuditLogs from "./pages/hod/AuditLogs";
import InchargeDashboard from "./pages/teacher/InchargeDashboard";

// A simple protected route wrapper (can be expanded later with real auth checks)
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  // Basic role check (can be made more robust)
  if (allowedRole && user.role !== allowedRole && user.role !== 'admin') {
    // If not allowed, redirect to their own dashboard or login
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRole="teacher">
            <DashboardLayout role="teacher" title="Instructor Console" />
          </ProtectedRoute>
        }>
          <Route index element={<InstructorConsole />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="logs" element={<AttendanceLogs />} />
          <Route path="permissions" element={<LeavePermissions />} />
          <Route path="settings" element={<Settings />} />
          {/* Add other nested routes here later */}
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout role="admin" title="Takshashila Admin" subtitle="Admin Portal" />
          </ProtectedRoute>
        }>
          <Route index element={<SectionDetails />} />
          <Route path="timetable" element={<TimetableManager />} />
          <Route path="events" element={<EventManager />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout role="student" title="Academia Attendance" subtitle="Student Portal" />
          </ProtectedRoute>
        }>
          <Route path="od-requests" element={<ODRequests />} />
          <Route path="medical-leave" element={<MedicalLeave />} />
          <Route path="history" element={<AttendanceHistory />} />
          <Route path="profile" element={<Settings />} />
          <Route path="settings" element={<Settings />} />
          <Route path="scan" element={<QRScanner />} />
          <Route index element={<StudentDashboard />} />
        </Route>

        {/* HOD/Authority Routes */}
        <Route path="/hod" element={
          <ProtectedRoute allowedRole="authority">
            <DashboardLayout role="authority" title="Departmental Intelligence" subtitle="HOD Portal" />
          </ProtectedRoute>
        }>
          <Route path="approvals" element={<ApprovalDashboard />} />
          <Route path="sections" element={<SectionIntelligence />} />
          <Route path="faculty" element={<FacultyManager />} />
          <Route path="statistics" element={<HODStatistics />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="events" element={<EventManager />} />
          <Route path="reports" element={<MonthlyReport />} />
          <Route path="settings" element={<Settings />} />
          <Route index element={<ApprovalDashboard />} />
        </Route>

        {/* Class Incharge Routes */}
        <Route path="/incharge" element={
          <ProtectedRoute allowedRole="classIncharge">
            <DashboardLayout role="classIncharge" title="Academic Supervision" subtitle="Class Incharge" />
          </ProtectedRoute>
        }>
          <Route index element={<InchargeDashboard />} />
          <Route path="verify" element={<InchargeDashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/invigilator" element={
          <ProtectedRoute allowedRole="invigilator">
            <DashboardLayout role="invigilator" title="Exam Invigilation" subtitle="Takshashila University" />
          </ProtectedRoute>
        }>
          <Route index element={<ExamInvigilation />} />
          <Route path="settings" element={<Settings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
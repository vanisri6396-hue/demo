# Smart Attendance System: Full Connectivity Audit & Fix Plan

The goal of this plan is to ensure that **each and every page** across all user roles (Student, Teacher, Class Incharge, HOD, Admin) is perfectly connected to the backend API and the MongoDB database. We will systematically audit, test, and fix any broken links, missing endpoints, or incorrect data handling.

## User Review Required

> [!IMPORTANT]
> This is a comprehensive sweep of the entire application. Please review the targeted areas below. If there are specific pages or features you know are currently broken, please let me know so I can prioritize them!

## Open Questions

> [!WARNING]
> 1. Are there any specific features (e.g., Timetable generation, Push notifications, Profile picture uploads) that you noticed are completely non-functional?
> 2. Should we implement the `End Class Session` functionality in the Instructor Console? Currently, the "Stop" API call is commented out.

## Proposed Changes

We will systematically review and fix the application module by module.

---

### Student Module
Audit and fix endpoints for the Student Portal.

#### [VERIFY & FIX] `client/src/pages/student/StudentDashboard.jsx`
- Verify `GET /api/student/dashboard` returns correct alerts and upcoming classes.
- Verify `GET /api/student/attendance/summary` accurately reflects database attendance.

#### [VERIFY & FIX] `client/src/pages/student/QRScanner.jsx`
- Ensure `POST /api/attendance/scan` correctly validates GPS location, distance, and writes to the MongoDB `Attendance` collection.

#### [VERIFY & FIX] `client/src/pages/student/AttendanceHistory.jsx`
- Ensure `GET /api/student/attendance` correctly queries and paginates history.

#### [VERIFY & FIX] `client/src/pages/student/ODRequests.jsx` & `MedicalLeave.jsx`
- Ensure `GET /api/leave/mine` correctly fetches only the logged-in student's leaves.
- Ensure `POST /api/leave/submit` stores the request perfectly in MongoDB.

---

### Teacher / Instructor Module
Audit and fix endpoints for the Instructor Console.

#### [VERIFY & FIX] `client/src/pages/instructor/InstructorConsole.jsx`
- Ensure `POST /api/qr/start` successfully initializes a session and emits Socket events.
- **Action**: Implement `POST /api/qr/stop` to allow teachers to manually end sessions.

#### [VERIFY & FIX] `client/src/pages/teacher/AttendanceLogs.jsx` & `LeavePermissions.jsx`
- Audit these pages to ensure they correctly pull logs from `GET /api/attendance/teacher-logs/:id` and review class-level leaves.

#### [VERIFY & FIX] `client/src/pages/teacher/TeacherTimetable.jsx`
- Ensure `GET /api/timetable/teacher/:name` correctly aggregates schedule data from the DB.

---

### Class Incharge & HOD Modules
Audit and fix approval flows and reports.

#### [VERIFY & FIX] `client/src/pages/teacher/InchargeDashboard.jsx`
- Ensure `POST /api/authority/review` correctly advances the request state from `Incharge` to `HOD`.

#### [VERIFY & FIX] `client/src/pages/hod/ApprovalDashboard.jsx`
- Ensure the HOD can view forwarded requests and that final approval correctly writes `onDuty` or `medical` entries to the `Attendance` collection.

#### [VERIFY & FIX] `client/src/pages/hod/MonthlyReport.jsx` & Intelligence Dashboards
- Verify aggregation pipelines in `GET /api/authority/monthly-report` correctly calculate percentages and fetch student data.

---

### Admin & Shared Modules
Audit system configuration tools.

#### [VERIFY & FIX] `client/src/pages/admin/TimetableManager.jsx`
- Verify CRUD operations for timetable slots (`POST /api/timetable/update`).

#### [VERIFY & FIX] `client/src/pages/shared/EventManager.jsx`
- Verify events are correctly stored and fetched (`GET /api/events`, `POST /api/events`, `DELETE /api/events/:id`).

#### [VERIFY & FIX] `client/src/pages/shared/Settings.jsx`
- Verify Profile updates and Password changes work securely.

## Verification Plan

### Automated / Manual Script Testing
- I will write localized scripts to test the MongoDB collections (e.g., verifying `Timetable`, `User`, `Attendance` structures match what the frontend expects).

### Backend Route Validation
- I will systematically cross-reference every `axios` call in the React code against the Express routes and ensure the controllers return valid JSON without crashing.

### Frontend Data Binding
- I will inspect React components to ensure they correctly handle `res.data` structures and prevent "undefined" crashes (similar to the Class Incharge bug we just fixed).

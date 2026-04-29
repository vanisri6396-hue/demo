# Takshashila Smart Attendance System - Documentation

## 1. Project Overview
The **Takshashila Smart Attendance System** is a next-generation MERN-stack application designed to eliminate proxy attendance and streamline academic administration. It leverages proximity-aware QR codes, sequential approval workflows for leaves, and automated reporting for department heads.

---

## 2. System Architecture
- **Frontend**: React.js (Vite) with TailwindCSS and Lucide Icons.
- **Backend**: Node.js & Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Security**: JWT Authentication, Role-Based Access Control (RBAC), and 5:00 PM submission locks for medical leave.

---

## 3. Entity Relationship (ER) Diagram
```mermaid
erDiagram
    USER ||--o{ ATTENDANCE : marks
    USER ||--o{ LEAVE_REQUEST : applies
    USER ||--o{ TIMETABLE : assigned
    CLASS ||--o{ ATTENDANCE : contains
    CLASS ||--o{ TIMETABLE : scheduled
    SUBJECT ||--o{ TIMETABLE : taught
    EVENT ||--o{ LEAVE_REQUEST : linked_to

    USER {
        string _id PK
        string name
        string email
        string password
        string role "student | teacher | incharge | authority | admin"
        string rollNo
        string section
        string employeeId
    }

    ATTENDANCE {
        string _id PK
        objectId studentId FK
        objectId classId FK
        string status "present | absent | onDuty"
        date date
        string location
    }

    LEAVE_REQUEST {
        string _id PK
        objectId studentId FK
        string type "medical | od"
        string status "pending | approved | rejected"
        object approvals "classIncharge & hod stages"
        string documentUrl
    }

    TIMETABLE {
        string _id PK
        string section
        string day
        array slots "hour, subject, teacher, room"
    }
```

---

## 4. Key Workflows

### A. Proximity-Based Attendance
1. **Teacher** generates a dynamic QR code.
2. **Student** scans via the portal.
3. **Validation**: System checks student's session and marks them `present` in real-time.

### B. Sequential Leave Approval
1. **Student** applies for OD (using HOD-created events) or Medical Leave.
2. **Class Incharge** (Level 1) verifies the proof and forwards it.
3. **HOD** (Level 2) gives final approval.
4. **Auto-Update**: Attendance for that day is automatically updated to `onDuty`.

### C. Monthly Reporting
1. **HOD** filters records by Month/Year/Section.
2. **Analytics**: System calculates attendance percentages and flags students below 75%.
3. **Export**: Data can be exported for departmental records.

---

## 5. API Reference (Core)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register with Verification Key | Public |
| POST | `/api/auth/login` | Secure JWT Login | Public |
| GET | `/api/attendance/history` | View personal scan logs | Student |
| GET | `/api/authority/pending` | Fetch requests for approval | Incharge/HOD |
| POST | `/api/authority/review` | Approve/Reject requests | Incharge/HOD |
| GET | `/api/timetable/section/:id` | Get 6-slot weekly schedule | All |

---

## 6. Security Implementation
- **Faculty Shield**: Non-student roles require the `UNIVERSITY_STAFF_2024` secret key during signup.
- **Time Lock**: Medical leave requests for the current day must be submitted before 5:00 PM.
- **Route Protection**: Private routes in React ensure users cannot access dashboards outside their role.

---

## 7. Developer Setup
1. **Backend**: `cd server && npm install && npm run dev`
2. **Frontend**: `cd client && npm install && npm run dev`
3. **Env**: Ensure `MONGO_URI` and `JWT_SECRET` are configured.

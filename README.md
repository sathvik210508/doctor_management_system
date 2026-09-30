# LIORA HOSPITALS — DEDICATED DOCTOR PORTAL
**Super-Speciality Clinical Management & Practitioner Healthcare System**

---

## 🏥 System Overview

The **Liora Hospitals Doctor Portal** is a completely independent clinical workstation application built from scratch for physicians, surgeons, and healthcare specialists.

### 🔒 Architectural Isolation (Important)
- **100% Independent Frontend**: Built with React 19, Vite, and Lucide React on `http://localhost:5175`.
- **100% Independent Backend**: Express.js REST API server on `http://localhost:5001`.
- **100% Independent Database**: Isolated file-backed persistent database (`doctor-portal/database/db.json`) with zero external DB dependencies and zero cross-portal imports.
- **Dedicated Authentication**: Doctor ID + Bcrypt-Hashed Password authentication with JWT session protection.
- **ZERO OTP Dependency**: No phone OTP, email OTP, or OTP dialogs anywhere in the portal.
- **Zero Patient Portal Coupling**: Completely separate from the existing Patient Portal.

---

## 👨‍⚕️ Demo Doctor Accounts

All accounts come pre-configured with secure bcrypt-hashed passwords:

| Doctor ID | Password | Doctor Name | Specialization & Department | Cabin / Room |
| :--- | :--- | :--- | :--- | :--- |
| **`DOC1001`** | `Doctor@123` | Dr. Sarah Jenkins | Senior Consultant Cardiologist, Cardiology & Vascular Medicine | Cabin 302, 3rd Floor |
| **`DOC1002`** | `Doctor@123` | Dr. Rajesh Patel | Consultant Dermatologist, Dermatology & Cutaneous Surgery | Cabin 205, 2nd Floor |
| **`DOC1003`** | `Doctor@123` | Dr. Vikram Rao | Chief of Orthopedic Surgery, Orthopedics & Joint Reconstruction | Cabin 401, 4th Floor |
| **`DOC1004`** | `Doctor@123` | Dr. Alisha Sharma | Consultant Neurologist, Neurology & Neurosciences | Cabin 310, 3rd Floor |
| **`DOC1005`** | `Doctor@123` | Dr. Ananya Reddy | Senior Consultant, Obstetrics & Gynecology | Cabin 108, 1st Floor |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v26+)
- npm

### 1. Start Doctor Portal Backend
```bash
cd doctor-portal/backend
npm install
node server.js
```
*Backend runs on `http://localhost:5001`*

### 2. Start Doctor Portal Frontend
```bash
cd doctor-portal/frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5175`*

---

## 📋 Comprehensive Feature Checklist

### 1. Doctor Authentication & Security
- Doctor ID + Password login screen with demo switcher.
- Bcrypt password hashing & JWT token validation.
- Institutional password change in Settings with current password verification.
- Auto-logout and protected route redirection for expired tokens.
- **NO OTP used anywhere**.

### 2. Clinical Dashboard
- Top bar showing logged-in doctor, ID, department, cabin, and attendance status badge.
- 8 Core Metric Cards:
  1. Today's Patients
  2. Upcoming Appointments
  3. Attendance Status
  4. Leave Status
  5. Today's Meetings
  6. Hospital Announcements
  7. Unread Messages
  8. Pending Referrals
- Quick schedule table with patient queue progression buttons.
- Pending specialist referrals widget.
- Hospital directives and today's clinical meetings summary.

### 3. Patient Dossier & Medical Records
- Dedicated "Today's Patients" and "All Registered Patients" tabs.
- Full-text search by patient name, ID, symptoms, diagnosis.
- Medical Dossier Modal with 4 sub-views:
  - **Patient & Medical Profile**: Demographics, emergency contact, known drug allergies, existing conditions, current medications.
  - **Visit History**: Chronological past consultations, diagnoses, and treatment plans.
  - **Prescriptions**: Comprehensive historical drug regimens.
  - **Upcoming Appointments**: Scheduled future appointments.
- Quick action buttons: Record Consultation, Prescribe, and Refer Specialist.

### 4. Appointment Queue Management
- Status workflow progression:
  `Scheduled` ➔ `Waiting` ➔ `In Consultation` ➔ `Completed`
- Filter appointments by status: Scheduled, Waiting, In Consultation, Completed, Cancelled, No Show.
- Update appointment notes and real-time consultation status synchronization.

### 5. Doctor Attendance & Duty Logging
- Daily duty Check-in and Check-out buttons.
- Real-time time recording (e.g. `Present • 09:02 AM`).
- **Duplicate check-in prevention**: Rejects duplicate submissions for the same date.
- Performance statistics: Working Days, Present Days, Leave Days, Absent Days, and Attendance Rate.
- Full chronological attendance audit log.

### 6. Leave Management
- Application modal with Leave Types: Casual Leave, Sick Leave, Emergency Leave, Personal Leave, Other.
- Date range validation (prevents end date < start date).
- Leave request audit trail with statuses: `Pending`, `Approved`, `Rejected`.

### 7. Hospital Meetings & Rounds
- Multidisciplinary case conferences, safety audits, and medical rounds.
- Meeting location, organizer, date, time, and department tags.
- **Add to Calendar (.ics)**: Generates and downloads standard iCalendar files for Outlook, Apple Calendar, and Google Calendar.

### 8. Hospital Announcements & Directives
- Priority classification: `Urgent`, `Important`, `Normal`.
- Per-doctor read/unread status tracking with badges.
- One-click "Mark as Read" action.

### 9. 1-to-1 Private Doctor Messaging
- **Strictly 1-to-1**: No group chats, completely private medical consultations between two practitioners.
- Search other doctors by name or department.
- Conversation history, timestamping, unread message badges, and delivery confirmation.

### 10. Patient Inter-Specialty Referrals (High Priority)
- Structured referral form: Select Patient, Select Target Department, Select Specialist Doctor, Urgency (`Routine`, `Priority`, `Urgent`, `Emergency`), Reason, and Additional Notes.
- Incoming Referrals Inbox: Referred doctors can `Accept`, `Decline`, or `View Patient Dossier`.
- Sent Referrals Tracker: Monitor referral acceptance status.

### 11. Consultation Notes
- Clinical documentation: Symptoms, Diagnosis, Clinical Observations & Vitals, Treatment Plan, Doctor Remarks, and Scheduled Follow-up Date.
- Auto-completes associated appointments.
- Full patient consultation history.

### 12. Electronic Prescriptions & Printable Slip
- Dynamic medicine formulation: Name, Dosage, Frequency (e.g. 1-0-1), Duration, and Instructions.
- Add/remove unlimited medication rows.
- Dietary and general clinical advice.
- **Printable Official Prescription Slip**: Formal hospital prescription slip with Liora Hospitals header, Rx symbol, dosage table, and digital signature block.

### 13. Practice Availability Settings
- Configure day-by-day clinic hours (Monday – Sunday).
- Lunch / ward round break time configuration.
- Consultation slot intervals (15 min, 20 min, 30 min, 45 min).
- Persistent storage for future patient portal integration.

### 14. Notifications Hub
- Categorized notifications: Appointments, Referrals Received/Accepted, Private Messages, Announcements, Leaves, and Meetings.
- Unread badge counter, single mark-read, and "Mark All as Read" action.

### 15. Doctor Profile & Settings
- Professional medical credentials, room allocation, and bio.
- **Locked Doctor ID**: Protected against modification.
- Password change with bcrypt verification.
- Notification preference toggles.
- Session termination & logout.

---

## 🗄️ Database Architecture (`doctor-portal/database/db.json`)

The database layer uses an isolated persistent data store with atomic file writes:
- `doctors`
- `patients` (Mock Patient Dossiers)
- `appointments` (Mock Appointments & Real-time Statuses)
- `attendance` (Check-in/Check-out logs)
- `leaves` (Leave applications)
- `meetings` (Hospital conferences)
- `announcements` (Hospital directives)
- `messages` (1-to-1 doctor chat messages)
- `referrals` (Cross-specialty patient referrals)
- `consultations` (Clinical notes)
- `prescriptions` (Electronic medication orders)
- `availability` (Clinic hours & slot intervals)
- `notifications` (System alerts & read receipts)

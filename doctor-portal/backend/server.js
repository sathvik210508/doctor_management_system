import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { initDB } from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

// Initialize Doctor Portal independent database
initDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());

// Base Route
app.get("/", (req, res) => {
  res.json({
    message: "LIORA HOSPITALS — Dedicated Independent Doctor Portal API",
    status: "Operational",
    version: "1.0.0",
    port: PORT,
    portal: "Doctor Portal (Independent System)"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/notifications", notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Doctor Portal Server Error]", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏥 LIORA HOSPITALS — DOCTOR PORTAL BACKEND ACTIVE`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔒 Authentication: Doctor ID + Password (NO OTP)`);
  console.log(`=======================================================`);
});

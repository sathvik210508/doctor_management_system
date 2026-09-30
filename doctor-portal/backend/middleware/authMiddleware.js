import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const protectDoctor = (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Doctor authentication token is required."
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "liora_hospitals_doctor_portal_jwt_secret_secure_key_2026";
    const decoded = jwt.verify(token, secret);

    const doctor = db.findOne("doctors", (d) => d.doctorId === decoded.doctorId);

    if (!doctor || !doctor.isActive) {
      return res.status(401).json({
        success: false,
        message: "Doctor profile not found or inactive."
      });
    }

    const { password, ...doctorWithoutPassword } = doctor;
    req.doctor = doctorWithoutPassword;
    next();
  } catch (error) {
    console.error("[Auth Middleware Error]", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again."
    });
  }
};

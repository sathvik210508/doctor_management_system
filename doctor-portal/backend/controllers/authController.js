import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const generateToken = (doctor) => {
  const secret = process.env.JWT_SECRET || "liora_hospitals_doctor_portal_jwt_secret_secure_key_2026";
  return jwt.sign(
    {
      id: doctor.id,
      doctorId: doctor.doctorId,
      email: doctor.email,
      name: doctor.name,
      department: doctor.department
    },
    secret,
    { expiresIn: "7d" }
  );
};

export const login = (req, res) => {
  try {
    const { doctorId, password } = req.body;

    if (!doctorId || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both Doctor ID and Password."
      });
    }

    const cleanDoctorId = doctorId.trim().toUpperCase();
    const doctor = db.findOne("doctors", (d) => d.doctorId === cleanDoctorId);

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Doctor ID not recognized."
      });
    }

    const isMatch = bcrypt.compareSync(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Incorrect password."
      });
    }

    const token = generateToken(doctor);
    const { password: _, ...doctorData } = doctor;

    return res.status(200).json({
      success: true,
      message: "Doctor authenticated successfully.",
      token,
      doctor: doctorData
    });
  } catch (error) {
    console.error("[Login Error]", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during login."
    });
  }
};

export const changePassword = (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const currentDoctorId = req.doctor.doctorId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long."
      });
    }

    const doctor = db.findOne("doctors", (d) => d.doctorId === currentDoctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor account not found."
      });
    }

    const isMatch = bcrypt.compareSync(currentPassword, doctor.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password does not match our records."
      });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    db.update("doctors", (d) => d.doctorId === currentDoctorId, {
      password: hashedNewPassword,
      passwordUpdatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please keep your credentials secure."
    });
  } catch (error) {
    console.error("[Change Password Error]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update password."
    });
  }
};

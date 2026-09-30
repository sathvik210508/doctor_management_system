import db from "../config/db.js";

export const getMe = (req, res) => {
  try {
    const doctor = db.findOne("doctors", (d) => d.doctorId === req.doctor.doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }
    const { password, ...doctorData } = doctor;
    return res.status(200).json({ success: true, doctor: doctorData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const { name, phone, email, specialization, department, qualification, experienceYears, cabin, bio, avatar } = req.body;

    const updated = db.update(
      "doctors",
      (d) => d.doctorId === doctorId,
      (existing) => ({
        ...existing,
        name: name !== undefined ? name : existing.name,
        phone: phone !== undefined ? phone : existing.phone,
        email: email !== undefined ? email : existing.email,
        specialization: specialization !== undefined ? specialization : existing.specialization,
        department: department !== undefined ? department : existing.department,
        qualification: qualification !== undefined ? qualification : existing.qualification,
        experienceYears: experienceYears !== undefined ? Number(experienceYears) : existing.experienceYears,
        cabin: cabin !== undefined ? cabin : existing.cabin,
        bio: bio !== undefined ? bio : existing.bio,
        avatar: avatar !== undefined ? avatar : existing.avatar,
        updatedAt: new Date().toISOString()
      })
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Doctor not found to update." });
    }

    const { password, ...safeDoctor } = updated;
    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully.",
      doctor: safeDoctor
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllDoctors = (req, res) => {
  try {
    const doctors = db.find("doctors", (d) => d.isActive).map(({ password, ...doc }) => doc);
    return res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

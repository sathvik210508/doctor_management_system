import db from "../config/db.js";

export const getPrescriptions = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const { patientId } = req.query;

    let prescriptions = db.find("prescriptions", (p) => p.doctorId === doctorId);

    if (patientId) {
      prescriptions = prescriptions.filter((p) => p.patientId === patientId);
    }

    prescriptions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientPrescriptions = (req, res) => {
  try {
    const { id } = req.params; // patientId
    const prescriptions = db
      .find("prescriptions", (p) => p.patientId === id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPrescription = (req, res) => {
  try {
    const doctor = req.doctor;
    const { patientId, medicines, generalAdvice, followUpDate } = req.body;

    if (!patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Patient ID and at least one prescribed medicine are required."
      });
    }

    const patient = db.findOne("patients", (p) => p.patientId === patientId || p.id === patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }

    // Validate medicines
    for (const med of medicines) {
      if (!med.name || !med.dosage) {
        return res.status(400).json({
          success: false,
          message: "Each medicine must have a name and dosage."
        });
      }
    }

    const rxNumber = Math.floor(1000 + Math.random() * 9000);
    const newPrescription = {
      id: `rx-${Date.now()}`,
      prescriptionId: `RX-2026-${rxNumber}`,
      patientId: patient.patientId,
      patientName: patient.name,
      doctorId: doctor.doctorId,
      doctorName: doctor.name,
      doctorDepartment: doctor.department,
      doctorSpecialization: doctor.specialization,
      date: new Date().toISOString().split("T")[0],
      medicines: medicines.map((m, idx) => ({
        id: `med-${Date.now()}-${idx}`,
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        frequency: m.frequency ? m.frequency.trim() : "1-0-1",
        duration: m.duration ? m.duration.trim() : "5 days",
        instructions: m.instructions ? m.instructions.trim() : "After food"
      })),
      generalAdvice: generalAdvice ? generalAdvice.trim() : "",
      followUpDate: followUpDate || null,
      createdAt: new Date().toISOString()
    };

    db.insert("prescriptions", newPrescription);

    return res.status(201).json({
      success: true,
      message: `Prescription ${newPrescription.prescriptionId} issued successfully.`,
      prescription: newPrescription
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

import db from "../config/db.js";

export const getConsultations = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const { patientId } = req.query;

    let consultations = db.find("consultations", (c) => c.doctorId === doctorId);

    if (patientId) {
      consultations = consultations.filter((c) => c.patientId === patientId);
    }

    consultations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: consultations.length,
      consultations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientConsultations = (req, res) => {
  try {
    const { id } = req.params; // patientId
    const consultations = db
      .find("consultations", (c) => c.patientId === id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: consultations.length,
      consultations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createConsultation = (req, res) => {
  try {
    const doctor = req.doctor;
    const {
      patientId,
      appointmentId,
      symptoms,
      diagnosis,
      observations,
      treatmentPlan,
      doctorNotes,
      followUpDate
    } = req.body;

    if (!patientId || !symptoms || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: "Patient ID, Symptoms, and Diagnosis are mandatory."
      });
    }

    const patient = db.findOne("patients", (p) => p.patientId === patientId || p.id === patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient record not found." });
    }

    const consultationNumber = Math.floor(100 + Math.random() * 900);
    const newConsultation = {
      id: `con-${Date.now()}`,
      consultationId: `CNS-2026-${consultationNumber}`,
      patientId: patient.patientId,
      patientName: patient.name,
      doctorId: doctor.doctorId,
      doctorName: doctor.name,
      date: new Date().toISOString().split("T")[0],
      symptoms: symptoms.trim(),
      diagnosis: diagnosis.trim(),
      observations: observations ? observations.trim() : "",
      treatmentPlan: treatmentPlan ? treatmentPlan.trim() : "",
      doctorNotes: doctorNotes ? doctorNotes.trim() : "",
      followUpDate: followUpDate || null,
      createdAt: new Date().toISOString()
    };

    db.insert("consultations", newConsultation);

    // If an appointmentId was associated or exists today for this patient, mark as Completed
    if (appointmentId) {
      db.update(
        "appointments",
        (a) => a.id === appointmentId || a.appointmentId === appointmentId,
        (existing) => ({
          ...existing,
          status: "Completed",
          consultationStatus: "Completed",
          updatedAt: new Date().toISOString()
        })
      );
    } else {
      // Find today's appointment for this patient and doctor
      const today = new Date().toISOString().split("T")[0];
      db.update(
        "appointments",
        (a) => a.patientId === patient.patientId && a.doctorId === doctor.doctorId && a.date === today,
        (existing) => ({
          ...existing,
          status: "Completed",
          consultationStatus: "Completed",
          updatedAt: new Date().toISOString()
        })
      );
    }

    return res.status(201).json({
      success: true,
      message: `Consultation note ${newConsultation.consultationId} saved successfully.`,
      consultation: newConsultation
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

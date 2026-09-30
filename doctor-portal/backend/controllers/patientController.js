import db from "../config/db.js";

export const getAllPatients = (req, res) => {
  try {
    const { search, doctorOnly } = req.query;
    const currentDoctorId = req.doctor.doctorId;

    let patients = db.find("patients");

    if (doctorOnly === "true") {
      // Find patients with appointments or primary care with this doctor
      const myAppointmentPatientIds = new Set(
        db.find("appointments", (a) => a.doctorId === currentDoctorId).map((a) => a.patientId)
      );
      patients = patients.filter(
        (p) => p.primaryDoctorId === currentDoctorId || myAppointmentPatientIds.has(p.patientId)
      );
    }

    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.patientId.toLowerCase().includes(q) ||
          (p.phone && p.phone.toLowerCase().includes(q)) ||
          (p.currentCondition && p.currentCondition.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientById = (req, res) => {
  try {
    const { id } = req.params;
    const patient = db.findOne("patients", (p) => p.id === id || p.patientId === id);

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }

    // Attach related medical records (consultations, appointments, prescriptions, referrals)
    const patientAppointments = db.find("appointments", (a) => a.patientId === patient.patientId);
    const patientConsultations = db.find("consultations", (c) => c.patientId === patient.patientId);
    const patientPrescriptions = db.find("prescriptions", (rx) => rx.patientId === patient.patientId);
    const patientReferrals = db.find("referrals", (r) => r.patientId === patient.patientId);

    // Compile comprehensive visit history
    const visitHistory = [
      ...patientConsultations.map((c) => ({
        id: c.id,
        date: c.date,
        type: "Consultation",
        department: "Cardiology & Vascular Medicine",
        doctorName: c.doctorName,
        diagnosis: c.diagnosis,
        treatmentPlan: c.treatmentPlan,
        notes: c.doctorNotes
      })),
      ...patientAppointments
        .filter((a) => a.status === "Completed")
        .map((a) => ({
          id: a.id,
          date: a.date,
          type: a.appointmentType,
          department: a.department,
          doctorName: "Dr. Sarah Jenkins",
          diagnosis: a.reasonForVisit,
          treatmentPlan: "Review completed. Follow medication guidelines.",
          notes: a.notes
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Compile upcoming appointments
    const todayStr = new Date().toISOString().split("T")[0];
    const upcomingAppointments = patientAppointments.filter((a) => a.date >= todayStr && a.status !== "Completed");

    return res.status(200).json({
      success: true,
      patient: {
        ...patient,
        appointments: patientAppointments,
        consultations: patientConsultations,
        prescriptions: patientPrescriptions,
        referrals: patientReferrals,
        visitHistory,
        upcomingAppointments
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

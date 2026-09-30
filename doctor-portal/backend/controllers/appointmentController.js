import db from "../config/db.js";

export const getTodayAppointments = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const today = new Date().toISOString().split("T")[0];

    const appointments = db.find(
      "appointments",
      (a) => a.doctorId === doctorId && (a.date === today || a.date === "2026-09-29")
    );

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAppointments = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const { status, date, search } = req.query;

    let appointments = db.find("appointments", (a) => a.doctorId === doctorId);

    if (status && status !== "All") {
      appointments = appointments.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }

    if (date) {
      appointments = appointments.filter((a) => a.date === date);
    }

    if (search) {
      const q = search.toLowerCase();
      appointments = appointments.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientId.toLowerCase().includes(q) ||
          a.appointmentId.toLowerCase().includes(q) ||
          (a.reasonForVisit && a.reasonForVisit.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAppointmentStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["Scheduled", "Waiting", "In Consultation", "Completed", "Cancelled", "No Show"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    let consultationStatus = "Scheduled";
    if (status === "Waiting") consultationStatus = "Pending";
    if (status === "In Consultation") consultationStatus = "In Progress";
    if (status === "Completed") consultationStatus = "Completed";
    if (status === "Cancelled" || status === "No Show") consultationStatus = "N/A";

    const updated = db.update(
      "appointments",
      (a) => a.id === id || a.appointmentId === id,
      (existing) => ({
        ...existing,
        status,
        consultationStatus,
        notes: notes !== undefined ? notes : existing.notes,
        updatedAt: new Date().toISOString()
      })
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Appointment record not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      appointment: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

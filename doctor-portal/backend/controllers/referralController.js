import db from "../config/db.js";

export const getReferrals = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const { status, type } = req.query; // type: "received", "sent", or all

    const allReferrals = db.find(
      "referrals",
      (r) => r.targetDoctorId === doctorId || r.referringDoctorId === doctorId
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let received = allReferrals.filter((r) => r.targetDoctorId === doctorId);
    let sent = allReferrals.filter((r) => r.referringDoctorId === doctorId);

    if (status && status !== "All") {
      received = received.filter((r) => r.status.toLowerCase() === status.toLowerCase());
      sent = sent.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    }

    const pendingCount = received.filter((r) => r.status === "Pending").length;

    return res.status(200).json({
      success: true,
      pendingCount,
      received,
      sent,
      all: allReferrals
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createReferral = (req, res) => {
  try {
    const referringDoctor = req.doctor;
    const {
      patientId,
      targetDepartment,
      targetDoctorId,
      reason,
      additionalNotes,
      urgency
    } = req.body;

    if (!patientId || !targetDepartment || !targetDoctorId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Patient, Target Department, Target Doctor, and Reason for Referral are required."
      });
    }

    if (targetDoctorId === referringDoctor.doctorId) {
      return res.status(400).json({
        success: false,
        message: "You cannot refer a patient to yourself. Please select another specialist."
      });
    }

    const patient = db.findOne("patients", (p) => p.patientId === patientId || p.id === patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Selected patient was not found." });
    }

    const targetDoctor = db.findOne("doctors", (d) => d.doctorId === targetDoctorId);
    if (!targetDoctor) {
      return res.status(404).json({ success: false, message: "Target specialist doctor was not found." });
    }

    const referralNumber = Math.floor(1000 + Math.random() * 9000);
    const newReferral = {
      id: `ref-${Date.now()}`,
      referralId: `REF-2026-${referralNumber}`,
      patientId: patient.patientId,
      patientName: patient.name,
      referringDoctorId: referringDoctor.doctorId,
      referringDoctorName: referringDoctor.name,
      referringDepartment: referringDoctor.department,
      targetDoctorId: targetDoctor.doctorId,
      targetDoctorName: targetDoctor.name,
      targetDepartment: targetDepartment,
      reason: reason.trim(),
      additionalNotes: additionalNotes ? additionalNotes.trim() : "",
      urgency: urgency || "Priority",
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.insert("referrals", newReferral);

    // Create notification for target doctor
    db.insert("notifications", {
      id: `notif-${Date.now()}`,
      doctorId: targetDoctor.doctorId,
      title: "New Patient Referral Received",
      message: `${referringDoctor.name} (${referringDoctor.department}) referred patient ${patient.name} (${patient.patientId}) to you.`,
      type: "referral",
      isRead: false,
      timestamp: new Date().toISOString(),
      link: "/doctor/referrals"
    });

    return res.status(201).json({
      success: true,
      message: `Patient referral ${newReferral.referralId} sent successfully to ${targetDoctor.name}.`,
      referral: newReferral
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReferralStatus = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ["Pending", "Accepted", "Declined", "Completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid referral status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const referral = db.findOne("referrals", (r) => r.id === id || r.referralId === id);
    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral record not found." });
    }

    // Only target doctor or referring doctor can update
    if (referral.targetDoctorId !== doctorId && referral.referringDoctorId !== doctorId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this referral."
      });
    }

    const updated = db.update(
      "referrals",
      (r) => r.id === referral.id,
      (existing) => ({
        ...existing,
        status,
        remarks: remarks || existing.remarks,
        updatedAt: new Date().toISOString()
      })
    );

    // Notify the referring doctor about status update
    db.insert("notifications", {
      id: `notif-${Date.now()}`,
      doctorId: referral.referringDoctorId,
      title: `Referral ${status}: ${referral.patientName}`,
      message: `${req.doctor.name} has ${status.toLowerCase()} the referral for ${referral.patientName}.${remarks ? ` Notes: ${remarks}` : ""}`,
      type: status === "Accepted" ? "referral_accepted" : "referral",
      isRead: false,
      timestamp: new Date().toISOString(),
      link: "/doctor/referrals"
    });

    return res.status(200).json({
      success: true,
      message: `Referral status successfully updated to ${status}.`,
      referral: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

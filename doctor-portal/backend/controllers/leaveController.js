import db from "../config/db.js";

export const getLeaves = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const leaves = db
      .find("leaves", (l) => l.doctorId === doctorId)
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    const counts = {
      total: leaves.length,
      pending: leaves.filter((l) => l.status === "Pending").length,
      approved: leaves.filter((l) => l.status === "Approved").length,
      rejected: leaves.filter((l) => l.status === "Rejected").length
    };

    return res.status(200).json({
      success: true,
      counts,
      leaves
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const applyLeave = (req, res) => {
  try {
    const doctor = req.doctor;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Leave Type, Start Date, End Date, Reason)."
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date."
      });
    }

    const validTypes = ["Casual Leave", "Sick Leave", "Emergency Leave", "Personal Leave", "Other"];
    if (!validTypes.includes(leaveType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid leave type. Choose from: ${validTypes.join(", ")}`
      });
    }

    const newLeave = {
      id: `leave-${Date.now()}`,
      doctorId: doctor.doctorId,
      doctorName: doctor.name,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending",
      appliedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewNotes: null
    };

    db.insert("leaves", newLeave);

    // Also create a notification for the doctor
    db.insert("notifications", {
      id: `notif-${Date.now()}`,
      doctorId: doctor.doctorId,
      title: "Leave Request Submitted",
      message: `Your ${leaveType} application for ${startDate} to ${endDate} has been submitted to Hospital Administration.`,
      type: "leave",
      isRead: false,
      timestamp: new Date().toISOString(),
      link: "/doctor/leaves"
    });

    return res.status(201).json({
      success: true,
      message: "Leave application submitted successfully for administrative review.",
      leave: newLeave
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

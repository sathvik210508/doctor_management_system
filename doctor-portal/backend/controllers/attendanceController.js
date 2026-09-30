import db from "../config/db.js";

const formatTime = (dateObj) => {
  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

export const getTodayAttendance = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const today = new Date().toISOString().split("T")[0];

    let todayRecord = db.findOne("attendance", (a) => a.doctorId === doctorId && a.date === today);

    // If not found for today date, check for fallback date
    if (!todayRecord) {
      todayRecord = db.findOne("attendance", (a) => a.doctorId === doctorId && a.id === "att-today");
    }

    return res.status(200).json({
      success: true,
      attendance: todayRecord || null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAttendance = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const { action } = req.body; // "check-in" or "check-out"
    const today = new Date().toISOString().split("T")[0];
    const nowTime = formatTime(new Date());

    const existing = db.findOne("attendance", (a) => a.doctorId === doctorId && a.date === today);

    if (action === "check-out") {
      if (!existing) {
        return res.status(400).json({
          success: false,
          message: "You must check-in first before checking out."
        });
      }
      if (existing.checkOutTime) {
        return res.status(400).json({
          success: false,
          message: `Already checked out today at ${existing.checkOutTime}.`
        });
      }

      const updated = db.update(
        "attendance",
        (a) => a.id === existing.id,
        (prev) => ({
          ...prev,
          checkOutTime: nowTime,
          notes: `${prev.notes ? prev.notes + " | " : ""}Checked out at ${nowTime}`
        })
      );

      return res.status(200).json({
        success: true,
        message: `Successfully checked out at ${nowTime}. Have a restful evening!`,
        attendance: updated
      });
    }

    // Default action: Check-in / Mark Present
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Attendance already recorded for today at ${existing.checkInTime}. Duplicate check-ins are prevented.`
      });
    }

    const newRecord = {
      id: `att-${Date.now()}`,
      doctorId,
      date: today,
      status: "Present",
      checkInTime: nowTime,
      checkOutTime: null,
      notes: "Daily OPD duty check-in via Doctor Portal."
    };

    db.insert("attendance", newRecord);

    return res.status(201).json({
      success: true,
      message: `Marked Present for today at ${nowTime}.`,
      attendance: newRecord
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceHistory = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const records = db
      .find("attendance", (a) => a.doctorId === doctorId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate metrics
    const totalWorkingDays = records.length;
    const presentDays = records.filter((r) => r.status === "Present").length;
    const leaveDays = records.filter((r) => r.status === "Leave").length;
    const absentDays = records.filter((r) => r.status === "Absent").length;

    return res.status(200).json({
      success: true,
      metrics: {
        totalWorkingDays,
        presentDays,
        leaveDays,
        absentDays,
        attendanceRate: totalWorkingDays > 0 ? `${Math.round((presentDays / totalWorkingDays) * 100)}%` : "100%"
      },
      history: records
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

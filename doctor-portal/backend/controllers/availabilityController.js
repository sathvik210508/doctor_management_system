import db from "../config/db.js";

const defaultSchedule = {
  Monday: { startTime: "09:00", endTime: "16:30", isAvailable: true },
  Tuesday: { startTime: "09:00", endTime: "16:30", isAvailable: true },
  Wednesday: { startTime: "09:00", endTime: "13:30", isAvailable: true },
  Thursday: { startTime: "09:00", endTime: "16:30", isAvailable: true },
  Friday: { startTime: "09:00", endTime: "16:30", isAvailable: true },
  Saturday: { startTime: "09:00", endTime: "13:00", isAvailable: true },
  Sunday: { startTime: "10:00", endTime: "12:00", isAvailable: false }
};

export const getAvailability = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    let avail = db.findOne("availability", (a) => a.doctorId === doctorId);

    if (!avail) {
      avail = {
        doctorId,
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        schedule: defaultSchedule,
        breakTime: "01:00 PM – 02:00 PM",
        consultationDuration: "20 mins",
        maxPatientsPerSlot: 1,
        emergencyOnCall: true,
        lastUpdated: new Date().toISOString()
      };
      db.insert("availability", avail);
    }

    return res.status(200).json({
      success: true,
      availability: avail
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAvailability = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const {
      workingDays,
      schedule,
      breakTime,
      consultationDuration,
      maxPatientsPerSlot,
      emergencyOnCall
    } = req.body;

    const existing = db.findOne("availability", (a) => a.doctorId === doctorId);

    const updatedData = {
      doctorId,
      workingDays: workingDays || existing?.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      schedule: schedule || existing?.schedule || defaultSchedule,
      breakTime: breakTime || existing?.breakTime || "01:00 PM – 02:00 PM",
      consultationDuration: consultationDuration || existing?.consultationDuration || "20 mins",
      maxPatientsPerSlot: maxPatientsPerSlot || existing?.maxPatientsPerSlot || 1,
      emergencyOnCall: emergencyOnCall !== undefined ? emergencyOnCall : (existing?.emergencyOnCall ?? true),
      lastUpdated: new Date().toISOString()
    };

    if (existing) {
      db.update("availability", (a) => a.doctorId === doctorId, updatedData);
    } else {
      db.insert("availability", updatedData);
    }

    return res.status(200).json({
      success: true,
      message: "Doctor clinical availability and clinic hours saved successfully.",
      availability: updatedData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

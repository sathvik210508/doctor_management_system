import db from "../config/db.js";

export const getMeetings = (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const meetings = db.find("meetings");

    const todayMeetings = meetings.filter((m) => m.date === today || m.isToday);
    const upcomingMeetings = meetings.filter((m) => m.date >= today && !m.isToday);

    return res.status(200).json({
      success: true,
      count: meetings.length,
      todayMeetings,
      upcomingMeetings,
      allMeetings: meetings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMeetingICS = (req, res) => {
  try {
    const { id } = req.params;
    const meeting = db.findOne("meetings", (m) => m.id === id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    // Generate standard iCalendar file format
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Liora Hospitals//Doctor Portal Calendar//EN",
      "BEGIN:VEVENT",
      `UID:${meeting.id}@liorahospitals.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `SUMMARY:${meeting.title}`,
      `DESCRIPTION:${meeting.description} (Organizer: ${meeting.organizer})`,
      `LOCATION:${meeting.location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${meeting.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics"`);
    return res.send(icsContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

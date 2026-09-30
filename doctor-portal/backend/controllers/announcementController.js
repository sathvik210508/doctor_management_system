import db from "../config/db.js";

export const getAnnouncements = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const announcements = db.find("announcements").map((a) => {
      const readByList = a.readBy || [];
      const isReadForThisDoctor = readByList.includes(doctorId) || a.isRead;
      return {
        ...a,
        isRead: isReadForThisDoctor
      };
    });

    const unreadCount = announcements.filter((a) => !a.isRead).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      announcements
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAnnouncementRead = (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor.doctorId;

    const updated = db.update(
      "announcements",
      (a) => a.id === id,
      (existing) => {
        const readBy = existing.readBy || [];
        if (!readBy.includes(doctorId)) {
          readBy.push(doctorId);
        }
        return {
          ...existing,
          readBy,
          isRead: true
        };
      }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Announcement not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement marked as read.",
      announcement: { ...updated, isRead: true }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

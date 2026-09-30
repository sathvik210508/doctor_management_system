import db from "../config/db.js";

export const getNotifications = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const notifs = db
      .find("notifications", (n) => n.doctorId === doctorId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const unreadCount = notifs.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications: notifs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor.doctorId;

    const updated = db.update(
      "notifications",
      (n) => n.id === id && n.doctorId === doctorId,
      { isRead: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = (req, res) => {
  try {
    const doctorId = req.doctor.doctorId;
    const allNotifs = db.getDB().notifications || [];
    let count = 0;

    allNotifs.forEach((n) => {
      if (n.doctorId === doctorId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    });

    if (count > 0) {
      db.saveDB();
    }

    return res.status(200).json({
      success: true,
      message: `Marked ${count} notifications as read.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

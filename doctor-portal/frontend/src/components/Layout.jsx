import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import { appointmentApi, referralApi, announcementApi, messageApi, notificationApi } from "../api/client.js";

export const Layout = ({ activeTab, onSelectTab, children }) => {
  const [badgeCounts, setBadgeCounts] = useState({
    appointments: 0,
    referrals: 0,
    announcements: 0,
    messages: 0,
    notifications: 0
  });

  const refreshBadges = async () => {
    try {
      const [aptRes, refRes, annRes, msgRes, notifRes] = await Promise.allSettled([
        appointmentApi.getToday(),
        referralApi.getReferrals({ type: "received" }),
        announcementApi.getAnnouncements(),
        messageApi.getConversations(),
        notificationApi.getNotifications()
      ]);

      const counts = {
        appointments: aptRes.status === "fulfilled" && aptRes.value.success ? aptRes.value.count : 0,
        referrals: refRes.status === "fulfilled" && refRes.value.success ? refRes.value.pendingCount : 0,
        announcements: annRes.status === "fulfilled" && annRes.value.success ? annRes.value.unreadCount : 0,
        messages:
          msgRes.status === "fulfilled" && msgRes.value.success
            ? msgRes.value.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
            : 0,
        notifications: notifRes.status === "fulfilled" && notifRes.value.success ? notifRes.value.unreadCount : 0
      };

      setBadgeCounts(counts);
    } catch (e) {
      console.error("Badge update error:", e);
    }
  };

  useEffect(() => {
    refreshBadges();
  }, [activeTab]);

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} badgeCounts={badgeCounts} />
      <div className="main-content">
        <Header onNavigate={onSelectTab} />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

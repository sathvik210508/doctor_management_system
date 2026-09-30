import React, { useState, useEffect } from "react";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  Bell,
  CheckCircle2,
  Share2,
  MessageSquare,
  Megaphone,
  Video,
  CalendarOff,
  CalendarCheck,
  CheckCheck
} from "lucide-react";
import { notificationApi } from "../api/client.js";

export const Notifications = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" or "unread"

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "referral":
      case "referral_accepted":
        return <Share2 size={18} color="var(--rose-600)" />;
      case "message":
        return <MessageSquare size={18} color="var(--primary-700)" />;
      case "announcement":
        return <Megaphone size={18} color="var(--amber-600)" />;
      case "meeting":
        return <Video size={18} color="var(--sky-600)" />;
      case "leave":
        return <CalendarOff size={18} color="var(--emerald-600)" />;
      default:
        return <CalendarCheck size={18} color="var(--primary-600)" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
            Clinical & Hospital Notifications
          </h2>
          <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
            Real-time activity alerts for patient appointments, specialist referrals, messages, and administrative memos.
          </p>
        </div>

        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
            <CheckCheck size={15} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #E9D5FF" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "8px 16px",
            background: "none",
            border: "none",
            borderBottom: filter === "all" ? "2px solid #7C3AED" : "2px solid transparent",
            color: filter === "all" ? "#5B21B6" : "#6B6472",
            fontWeight: filter === "all" ? 700 : 500,
            fontSize: "0.85rem",
            cursor: "pointer",
            marginBottom: -1,
            transition: "all 0.15s ease"
          }}
        >
          All Notifications ({notifications.length})
        </button>

        <button
          onClick={() => setFilter("unread")}
          style={{
            padding: "8px 16px",
            background: "none",
            border: "none",
            borderBottom: filter === "unread" ? "2px solid #7C3AED" : "2px solid transparent",
            color: filter === "unread" ? "#5B21B6" : "#6B6472",
            fontWeight: filter === "unread" ? 700 : 500,
            fontSize: "0.85rem",
            cursor: "pointer",
            marginBottom: -1,
            transition: "all 0.15s ease"
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications to display"
          message="You're all caught up with your clinical updates."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) handleMarkRead(n.id);
                if (n.link && onNavigate) onNavigate(n.link.replace("/doctor/", ""));
              }}
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                border: "1px solid #E9D5FF",
                backgroundColor: n.isRead ? "#ffffff" : "#FAF5FF",
                boxShadow: "0 2px 10px rgba(76, 29, 149, 0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "9999px",
                    backgroundColor: n.isRead ? "#FAF5FF" : "#ffffff",
                    border: "1px solid #E9D5FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  {getIconForType(n.type)}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#4C1D95" }}>
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "9999px",
                          backgroundColor: "#7C3AED"
                        }}
                      />
                    )}
                  </div>

                  <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0", lineHeight: 1.4 }}>
                    {n.message}
                  </p>

                  <div style={{ fontSize: "0.725rem", color: "#8B5CF6", marginTop: 6, fontWeight: 500 }}>
                    {new Date(n.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(n.id);
                  }}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

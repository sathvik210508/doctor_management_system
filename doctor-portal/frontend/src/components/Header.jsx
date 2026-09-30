import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Bell,
  LogOut,
  User,
  Clock,
  CheckCircle2,
  ChevronDown,
  Shield
} from "lucide-react";
import { notificationApi, attendanceApi } from "../api/client.js";

export const Header = ({ onNavigate }) => {
  const { doctor, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadTodayAttendance();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.error("Error loading notifications:", e);
    }
  };

  const loadTodayAttendance = async () => {
    try {
      const res = await attendanceApi.getToday();
      if (res.success) {
        setTodayAttendance(res.attendance);
      }
    } catch (e) {
      console.error("Error loading attendance:", e);
    }
  };

  const handleQuickCheckIn = async () => {
    try {
      setMarkingAttendance(true);
      const res = await attendanceApi.mark("check-in");
      if (res.success) {
        setTodayAttendance(res.attendance);
      }
    } catch (e) {
      alert(e.message || "Failed to mark attendance");
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header
      style={{
        height: 68,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E9D5FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 90,
        boxShadow: "0 2px 10px rgba(139, 92, 246, 0.04)"
      }}
    >
      {/* Left: Greeting & Current Department */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: "1.08rem",
                fontWeight: 800,
                color: "#4C1D95",
                fontFamily: "var(--font-family)"
              }}
            >
              Good Morning, {doctor?.name || "Doctor"}
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: "#FAF5FF",
                color: "#7C3AED",
                border: "1px solid #E9D5FF",
                fontWeight: 700
              }}
            >
              {doctor?.doctorId}
            </span>
          </div>
          <div
            style={{
              fontSize: "0.775rem",
              color: "#64748B",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span>{doctor?.department}</span>
            <span>•</span>
            <span style={{ color: "#7C3AED", fontWeight: 600 }}>{doctor?.cabin}</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Attendance, Notifications & Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Attendance Status Badge / Quick Check-In */}
        {todayAttendance ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0.35rem 0.85rem",
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "18px",
              fontSize: "0.78rem",
              color: "#15803D",
              fontWeight: 700
            }}
          >
            <CheckCircle2 size={15} />
            <span>Present ({todayAttendance.checkInTime})</span>
          </div>
        ) : (
          <button
            onClick={handleQuickCheckIn}
            disabled={markingAttendance}
            className="btn btn-sm btn-outline"
            style={{ borderRadius: "18px", fontSize: "0.78rem" }}
          >
            <Clock size={14} />
            <span>{markingAttendance ? "Marking..." : "Mark Today's Attendance"}</span>
          </button>
        )}

        {/* Notifications Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{
              width: 38,
              height: 38,
              borderRadius: "12px",
              backgroundColor: showNotifDropdown ? "#F3F0FF" : "#FAF5FF",
              border: "1px solid #E9D5FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              color: "#7C3AED",
              transition: "all 0.2s ease"
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 18,
                  height: 18,
                  backgroundColor: "#7C3AED",
                  color: "#FFFFFF",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  border: "2px solid #FFFFFF"
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 48,
                width: 360,
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                boxShadow: "0 14px 30px rgba(124, 58, 237, 0.12)",
                border: "1px solid #E9D5FF",
                zIndex: 200,
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  padding: "13px 18px",
                  borderBottom: "1px solid #E9D5FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#FAF5FF"
                }}
              >
                <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#4C1D95" }}>
                  Hospital Notifications
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#7C3AED",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "#64748B", fontSize: "0.825rem" }}>
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifDropdown(false);
                        if (n.link) onNavigate(n.link.replace("/doctor/", ""));
                      }}
                      style={{
                        padding: "12px 18px",
                        borderBottom: "1px solid #FAF5FF",
                        cursor: "pointer",
                        backgroundColor: n.isRead ? "#FFFFFF" : "#FAF5FF",
                        transition: "background-color 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.825rem", color: "#1E293B" }}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#7C3AED" }} />
                        )}
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#64748B", margin: 0, lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: "10px 18px",
                  borderTop: "1px solid #E9D5FF",
                  textAlign: "center",
                  backgroundColor: "#FAF5FF"
                }}
              >
                <button
                  onClick={() => {
                    setShowNotifDropdown(false);
                    onNavigate("notifications");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#7C3AED",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Doctor Profile Pill matching Patient Portal */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              backgroundColor: "#FAF5FF",
              padding: "0.35rem 0.75rem",
              borderRadius: "18px",
              border: "1px solid #E9D5FF",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <img
              src={doctor?.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120"}
              alt={doctor?.name}
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1.5px solid #7C3AED"
              }}
            />
            <span
              style={{
                fontSize: "0.85rem",
                color: "#5B21B6",
                fontWeight: "600"
              }}
            >
              {doctor?.name?.split(" ")[1] ? `Dr. ${doctor?.name?.split(" ")[1]}` : (doctor?.name || "Doctor")}
            </span>
            <ChevronDown size={14} color="#7C3AED" />
          </button>

          {showProfileDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 46,
                width: 230,
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                boxShadow: "0 14px 30px rgba(124, 58, 237, 0.12)",
                border: "1px solid #E9D5FF",
                zIndex: 200,
                overflow: "hidden"
              }}
            >
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #E9D5FF", backgroundColor: "#FAF5FF" }}>
                <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#4C1D95" }}>{doctor?.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{doctor?.doctorId}</div>
                <div style={{ fontSize: "0.74rem", color: "#7C3AED", fontWeight: 700, marginTop: 4 }}>
                  {doctor?.specialization}
                </div>
              </div>

              <div style={{ padding: "6px" }}>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onNavigate("profile");
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    background: "none",
                    border: "none",
                    borderRadius: "8px",
                    color: "#1E293B",
                    fontSize: "0.835rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FAF5FF";
                    e.currentTarget.style.color = "#7C3AED";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#1E293B";
                  }}
                >
                  <User size={15} color="#7C3AED" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onNavigate("settings");
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    background: "none",
                    border: "none",
                    borderRadius: "8px",
                    color: "#1E293B",
                    fontSize: "0.835rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FAF5FF";
                    e.currentTarget.style.color = "#7C3AED";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#1E293B";
                  }}
                >
                  <Clock size={15} color="#7C3AED" />
                  <span>Security & Settings</span>
                </button>

                <div style={{ height: 1, backgroundColor: "#E9D5FF", margin: "4px 0" }} />

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    background: "none",
                    border: "none",
                    borderRadius: "8px",
                    color: "#BE123C",
                    fontSize: "0.835rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFF1F2")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

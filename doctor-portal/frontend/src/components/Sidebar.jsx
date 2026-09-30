import React from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClockCheck,
  CalendarOff,
  Video,
  Megaphone,
  MessageSquare,
  Share2,
  FileText,
  Pill,
  CalendarClock,
  Bell,
  UserCheck,
  Settings,
  LogOut,
  Hospital
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export const Sidebar = ({ activeTab, onSelectTab, badgeCounts = {} }) => {
  const { doctor, logout } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
    { id: "patients", label: "My Patients", icon: Users, section: "Patient Care" },
    { id: "appointments", label: "Today's Appointments", icon: CalendarCheck, section: "Patient Care", badge: badgeCounts.appointments },
    { id: "consultations", label: "Consultation Notes", icon: FileText, section: "Patient Care" },
    { id: "prescriptions", label: "Prescriptions", icon: Pill, section: "Patient Care" },
    { id: "referrals", label: "Patient Referrals", icon: Share2, section: "Patient Care", badge: badgeCounts.referrals, badgeColor: "rose" },
    
    { id: "attendance", label: "Attendance", icon: ClockCheck, section: "Hospital Operations" },
    { id: "leaves", label: "Leave Management", icon: CalendarOff, section: "Hospital Operations" },
    { id: "meetings", label: "Meetings", icon: Video, section: "Hospital Operations" },
    { id: "announcements", label: "Announcements", icon: Megaphone, section: "Hospital Operations", badge: badgeCounts.announcements },
    { id: "messages", label: "Doctor Messages", icon: MessageSquare, section: "Hospital Operations", badge: badgeCounts.messages, badgeColor: "primary" },
    
    { id: "availability", label: "Doctor Availability", icon: CalendarClock, section: "Account & Profile" },
    { id: "notifications", label: "Notifications", icon: Bell, section: "Account & Profile", badge: badgeCounts.notifications },
    { id: "profile", label: "My Profile", icon: UserCheck, section: "Account & Profile" },
    { id: "settings", label: "Settings", icon: Settings, section: "Account & Profile" }
  ];

  const sections = ["Overview", "Patient Care", "Hospital Operations", "Account & Profile"];

  return (
    <aside
      className="app-sidebar"
      style={{
        width: 268,
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #E9D5FF",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0
      }}
    >
      {/* Hospital Identity Header matching Patient Portal brand */}
      <div
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid #E9D5FF",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "12px",
            backgroundColor: "#FAF5FF",
            border: "1px solid #E9D5FF",
            color: "#7C3AED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(124, 58, 237, 0.08)"
          }}
        >
          <Hospital size={20} color="#7C3AED" />
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-family)",
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "#5B21B6",
              letterSpacing: "-0.4px",
              lineHeight: 1.2
            }}
          >
            LIORA HOSPITALS
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#7C3AED",
              textTransform: "uppercase",
              letterSpacing: "0.06em"
            }}
          >
            Doctor Portal
          </div>
        </div>
      </div>

      {/* Navigation Links Scrollable Body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 18
        }}
      >
        {sections.map((sec) => {
          const items = navItems.filter((i) => i.section === sec);
          return (
            <div key={sec}>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#8B5CF6",
                  padding: "0 10px 6px"
                }}
              >
                {sec}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "none",
                        backgroundColor: isActive ? "#FAF5FF" : "transparent",
                        color: isActive ? "#5B21B6" : "#64748B",
                        fontWeight: isActive ? 700 : 500,
                        fontSize: "0.855rem",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        textAlign: "left",
                        borderLeft: isActive ? "3px solid #7C3AED" : "3px solid transparent"
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "#FAF5FF";
                          e.currentTarget.style.color = "#5B21B6";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#64748B";
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Icon
                          size={17}
                          color={isActive ? "#7C3AED" : "#64748B"}
                          strokeWidth={isActive ? 2.3 : 1.8}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge ? (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: "10px",
                            backgroundColor: item.badgeColor === "rose" ? "#BE123C" : "#7C3AED",
                            color: "#FFFFFF"
                          }}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Doctor Info & Logout Footer */}
      <div
        style={{
          padding: "14px",
          borderTop: "1px solid #E9D5FF",
          backgroundColor: "#FAF5FF"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10
          }}
        >
          <img
            src={doctor?.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120"}
            alt={doctor?.name}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1.5px solid #7C3AED"
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "#4C1D95", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {doctor?.name || "Doctor"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748B" }}>
              {doctor?.doctorId}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "7px",
            borderRadius: "8px",
            border: "1px solid #FECDD3",
            backgroundColor: "#FFF1F2",
            color: "#BE123C",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FFE4E6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFF1F2";
          }}
        >
          <LogOut size={14} />
          <span>Doctor Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

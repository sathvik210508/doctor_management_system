import React, { useState, useEffect } from "react";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  Megaphone,
  CheckCircle2,
  Clock,
  Filter,
  AlertTriangle,
  Info
} from "lucide-react";
import { announcementApi } from "../api/client.js";

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementApi.getAnnouncements();
      if (res.success) {
        setAnnouncements(res.announcements || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const res = await announcementApi.markRead(id);
      if (res.success) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (priorityFilter === "All") return true;
    if (priorityFilter === "Unread") return !a.isRead;
    return a.priority.toLowerCase() === priorityFilter.toLowerCase();
  });

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
            Hospital Announcements & Directives
          </h2>
          <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
            Official notices issued by Hospital Administration, Chief Medical Officer, and Facilities Directorate.
          </p>
        </div>

        {unreadCount > 0 && (
          <span
            style={{
              fontSize: "0.825rem",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "#FAF5FF",
              color: "#5B21B6",
              border: "1px solid #E9D5FF",
              fontWeight: 700
            }}
          >
            {unreadCount} Unread Directives
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          backgroundColor: "#ffffff",
          padding: "6px",
          borderRadius: "14px",
          border: "1px solid #E9D5FF"
        }}
      >
        {["All", "Unread", "Urgent", "Important", "Normal"].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            style={{
              padding: "6px 14px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: priorityFilter === p ? "#7C3AED" : "transparent",
              color: priorityFilter === p ? "#ffffff" : "#6B6472",
              fontWeight: priorityFilter === p ? 700 : 500,
              fontSize: "0.825rem",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Announcement Cards */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements found"
          message="No hospital notices matching the selected filter."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="card"
              style={{
                backgroundColor: ann.isRead ? "#ffffff" : "#FAF5FF",
                border: "1px solid #E9D5FF",
                borderLeft: !ann.isRead
                  ? "4px solid #7C3AED"
                  : "1px solid #E9D5FF",
                borderRadius: "16px",
                boxShadow: "0 4px 16px rgba(76, 29, 149, 0.04)",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge variant={ann.priority}>{ann.priority}</Badge>
                  <span style={{ fontSize: "0.775rem", color: "#6B6472", fontWeight: 600 }}>
                    {ann.department}
                  </span>
                  <span style={{ fontSize: "0.775rem", color: "#E9D5FF" }}>•</span>
                  <span style={{ fontSize: "0.775rem", color: "#6B6472" }}>{ann.date}</span>
                </div>

                {!ann.isRead ? (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleMarkRead(ann.id)}
                    style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                  >
                    Mark as Read
                  </button>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={13} />
                    Read
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#4C1D95", marginBottom: 8 }}>
                {ann.title}
              </h3>

              <p style={{ fontSize: "0.85rem", color: "#6B6472", lineHeight: 1.5, margin: 0 }}>
                {ann.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;

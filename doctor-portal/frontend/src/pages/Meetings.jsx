import React, { useState, useEffect } from "react";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  Video,
  Calendar,
  Clock,
  MapPin,
  User,
  Download,
  CalendarPlus,
  ExternalLink
} from "lucide-react";
import { meetingApi } from "../api/client.js";

export const Meetings = () => {
  const [meetingsData, setMeetingsData] = useState({
    todayMeetings: [],
    upcomingMeetings: [],
    allMeetings: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const res = await meetingApi.getMeetings();
      if (res.success) {
        setMeetingsData({
          todayMeetings: res.todayMeetings || [],
          upcomingMeetings: res.upcomingMeetings || [],
          allMeetings: res.allMeetings || []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCalendar = (meeting) => {
    // Generate clean .ics string client-side or call backend endpoint
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Liora Hospitals//Doctor Portal//EN",
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

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${meeting.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedMeetings =
    activeTab === "today"
      ? meetingsData.todayMeetings
      : activeTab === "upcoming"
      ? meetingsData.upcomingMeetings
      : meetingsData.allMeetings;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
          Hospital Meetings & Clinical Grand Rounds
        </h2>
        <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
          Schedule for interdepartmental case conferences, infection control reviews, and academic symposiums.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 10,
          borderBottom: "1px solid #E9D5FF"
        }}
      >
        {[
          { id: "all", label: `All Meetings (${meetingsData.allMeetings.length})` },
          { id: "today", label: `Today's Meetings (${meetingsData.todayMeetings.length})` },
          { id: "upcoming", label: `Upcoming Sessions (${meetingsData.upcomingMeetings.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "9px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #7C3AED" : "2px solid transparent",
              color: activeTab === tab.id ? "#5B21B6" : "#6B6472",
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: "0.875rem",
              cursor: "pointer",
              marginBottom: -1,
              transition: "all 0.15s ease"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Meetings Grid */}
      {displayedMeetings.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No meetings found"
          message="There are no scheduled clinical meetings matching this filter."
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          {displayedMeetings.map((meet) => (
            <div
              key={meet.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                border: "1px solid #E9D5FF",
                borderRadius: "16px",
                boxShadow: "0 4px 18px rgba(76, 29, 149, 0.04)"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <span className="badge badge-normal" style={{ marginBottom: 6 }}>
                      {meet.department}
                    </span>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#4C1D95", marginTop: 4 }}>
                      {meet.title}
                    </h3>
                  </div>
                  <Badge status={meet.meetingStatus} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "14px 0", fontSize: "0.825rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#5B21B6", fontWeight: 600 }}>
                    <Calendar size={15} color="#7C3AED" />
                    <span>{meet.date}</span>
                    <span>•</span>
                    <Clock size={15} color="#7C3AED" />
                    <span>{meet.time}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6B6472" }}>
                    <MapPin size={15} color="#E11D48" />
                    <span>{meet.location}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6B6472" }}>
                    <User size={15} color="#8B5CF6" />
                    <span>Organizer: {meet.organizer}</span>
                  </div>
                </div>

                <p style={{ fontSize: "0.8rem", color: "#6B6472", lineHeight: 1.5, margin: "12px 0" }}>
                  {meet.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 14,
                  borderTop: "1px solid #E9D5FF",
                  marginTop: 10
                }}
              >
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleDownloadCalendar(meet)}
                  title="Download .ics event file to add to Apple Calendar, Google Calendar, or Outlook"
                >
                  <CalendarPlus size={14} />
                  <span>Add to Calendar (.ics)</span>
                </button>

                <span style={{ fontSize: "0.75rem", color: "#8B5CF6", fontWeight: 600 }}>
                  Hospital Verified Event
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Meetings;

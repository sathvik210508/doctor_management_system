import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import StatCard from "../components/StatCard.jsx";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  Users,
  CalendarCheck,
  ClockCheck,
  CalendarOff,
  Video,
  Megaphone,
  MessageSquare,
  Share2,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";
import {
  appointmentApi,
  attendanceApi,
  leaveApi,
  meetingApi,
  announcementApi,
  messageApi,
  referralApi
} from "../api/client.js";

export const Dashboard = ({
  onNavigate,
  onOpenPatient,
  onOpenConsultation,
  onOpenPrescription,
  onOpenReferral
}) => {
  const { doctor } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayPatients: 0,
    upcomingAppointments: 0,
    attendanceStatus: "Not Marked",
    checkInTime: null,
    leaveStatus: "Normal Working",
    todayMeetings: 0,
    announcementsCount: 0,
    unreadMessages: 0,
    pendingReferrals: 0
  });

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingReferralsList, setPendingReferralsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [todayMeetingsList, setTodayMeetingsList] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [aptRes, attRes, leaveRes, meetRes, annRes, msgRes, refRes] = await Promise.allSettled([
        appointmentApi.getToday(),
        attendanceApi.getToday(),
        leaveApi.getLeaves(),
        meetingApi.getMeetings(),
        announcementApi.getAnnouncements(),
        messageApi.getConversations(),
        referralApi.getReferrals({ type: "received" })
      ]);

      // Process appointments
      const appointments = aptRes.status === "fulfilled" && aptRes.value.success ? aptRes.value.appointments : [];
      setTodayAppointments(appointments);

      // Process attendance
      let attStatus = "Not Marked";
      let attTime = null;
      if (attRes.status === "fulfilled" && attRes.value.success && attRes.value.attendance) {
        attStatus = attRes.value.attendance.status || "Present";
        attTime = attRes.value.attendance.checkInTime;
      }

      // Process leaves
      let lStatus = "Active Duty";
      if (leaveRes.status === "fulfilled" && leaveRes.value.success) {
        const pending = leaveRes.value.counts?.pending || 0;
        if (pending > 0) lStatus = `${pending} Pending Request`;
      }

      // Process meetings
      const meetings = meetRes.status === "fulfilled" && meetRes.value.success ? meetRes.value.todayMeetings : [];
      setTodayMeetingsList(meetings);

      // Process announcements
      const announcements = annRes.status === "fulfilled" && annRes.value.success ? annRes.value.announcements : [];
      setAnnouncementsList(announcements);

      // Process messages
      let unreadMsgs = 0;
      if (msgRes.status === "fulfilled" && msgRes.value.success) {
        unreadMsgs = msgRes.value.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      }

      // Process referrals
      const referrals = refRes.status === "fulfilled" && refRes.value.success ? refRes.value.received : [];
      const pendingRefs = referrals.filter((r) => r.status === "Pending");
      setPendingReferralsList(pendingRefs);

      setStats({
        todayPatients: appointments.length,
        upcomingAppointments: appointments.filter((a) => a.status === "Scheduled" || a.status === "Waiting").length,
        attendanceStatus: attStatus,
        checkInTime: attTime,
        leaveStatus: lStatus,
        todayMeetings: meetings.length,
        announcementsCount: annRes.status === "fulfilled" && annRes.value.success ? annRes.value.unreadCount : 0,
        unreadMessages: unreadMsgs,
        pendingReferrals: pendingRefs.length
      });
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (id, newStatus) => {
    try {
      const res = await appointmentApi.updateStatus(id, newStatus);
      if (res.success) {
        setTodayAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      }
    } catch (e) {
      alert(e.message || "Failed to update appointment status");
    }
  };

  const handleReferralAction = async (id, status) => {
    try {
      const res = await referralApi.updateStatus(id, status);
      if (res.success) {
        setPendingReferralsList((prev) => prev.filter((r) => r.id !== id));
        setStats((prev) => ({ ...prev, pendingReferrals: Math.max(0, prev.pendingReferrals - 1) }));
      }
    } catch (e) {
      alert(e.message || "Failed to update referral");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Overview Top Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E9D5FF",
          boxShadow: "0 4px 15px rgba(139, 92, 246, 0.04)"
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#4C1D95" }}>
            Clinical Practitioner Dashboard
          </h2>
          <p style={{ fontSize: "0.825rem", color: "#64748B", margin: "4px 0 0" }}>
            Liora Hospitals Main Facility • OPD Timings: 08:30 AM – 05:00 PM
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("attendance")}>
            <ClockCheck size={14} color="#7C3AED" />
            <span>Attendance Logs</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate("referrals")}>
            <Share2 size={14} />
            <span>New Patient Referral</span>
          </button>
        </div>
      </div>

      {/* 8 Main Dashboard Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <StatCard
          title="Today's Patients"
          value={stats.todayPatients}
          subtitle="Scheduled across all slots"
          icon={Users}
          color="primary"
          onClick={() => onNavigate("patients")}
        />
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingAppointments}
          subtitle="Awaiting consultation"
          icon={CalendarCheck}
          color="sky"
          onClick={() => onNavigate("appointments")}
        />
        <StatCard
          title="Attendance Status"
          value={stats.attendanceStatus}
          subtitle={stats.checkInTime ? `Checked in at ${stats.checkInTime}` : "Action required"}
          icon={ClockCheck}
          color={stats.attendanceStatus === "Present" ? "emerald" : "amber"}
          onClick={() => onNavigate("attendance")}
        />
        <StatCard
          title="Leave Status"
          value={stats.leaveStatus}
          subtitle="Annual entitlement: 18 days"
          icon={CalendarOff}
          color="primary"
          onClick={() => onNavigate("leaves")}
        />
        <StatCard
          title="Today's Meetings"
          value={stats.todayMeetings}
          subtitle="Hospital clinical rounds"
          icon={Video}
          color="sky"
          onClick={() => onNavigate("meetings")}
        />
        <StatCard
          title="Hospital Announcements"
          value={stats.announcementsCount}
          subtitle="Important directives"
          icon={Megaphone}
          color="amber"
          onClick={() => onNavigate("announcements")}
        />
        <StatCard
          title="Unread Messages"
          value={stats.unreadMessages}
          subtitle="Doctor private chat"
          icon={MessageSquare}
          color="primary"
          onClick={() => onNavigate("messages")}
        />
        <StatCard
          title="Pending Referrals"
          value={stats.pendingReferrals}
          subtitle="Specialist review required"
          icon={Share2}
          color="rose"
          onClick={() => onNavigate("referrals")}
        />
      </div>

      {/* Split Section: Today's Appointments & Pending Referrals */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Today's Appointments */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <CalendarCheck size={18} color="#7C3AED" />
              <span>Today's Appointments Schedule</span>
            </div>
            <button
              onClick={() => onNavigate("appointments")}
              className="btn btn-outline btn-sm"
            >
              View Full Schedule →
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No appointments scheduled for today"
              message="Patients with scheduled consultations will appear here."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  style={{
                    padding: "14px 16px",
                    border: "1px solid #E9D5FF",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#FFFFFF",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#FAF5FF",
                        border: "1px solid #E9D5FF",
                        borderRadius: "8px",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        color: "#5B21B6",
                        textAlign: "center",
                        minWidth: 78
                      }}
                    >
                      {apt.time}
                    </div>

                    <div>
                      <div
                        onClick={() => onOpenPatient(apt.patientId)}
                        style={{
                          fontWeight: 700,
                          fontSize: "0.92rem",
                          color: "#4C1D95",
                          cursor: "pointer",
                          textDecoration: "underline",
                          textUnderlineOffset: 3
                        }}
                      >
                        {apt.patientName} ({apt.patientId})
                      </div>
                      <div style={{ fontSize: "0.775rem", color: "#64748B", marginTop: 2 }}>
                        {apt.appointmentType} • {apt.reasonForVisit}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Badge status={apt.status} />

                    {/* Quick status cycle button */}
                    {apt.status === "Scheduled" && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleUpdateAppointmentStatus(apt.id, "Waiting")}
                      >
                        Patient Arrived
                      </button>
                    )}
                    {apt.status === "Waiting" && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUpdateAppointmentStatus(apt.id, "In Consultation")}
                      >
                        Start Call
                      </button>
                    )}
                    {apt.status === "In Consultation" && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => {
                          onOpenConsultation({ patientId: apt.patientId, appointmentId: apt.id });
                        }}
                      >
                        Complete Notes
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Referrals Box */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Share2 size={18} color="#7C3AED" />
              <span>Pending Specialist Referrals</span>
            </div>
            <button
              onClick={() => onNavigate("referrals")}
              className="btn btn-outline btn-sm"
            >
              All Referrals →
            </button>
          </div>

          {pendingReferralsList.length === 0 ? (
            <EmptyState
              icon={Share2}
              title="No pending referrals"
              message="When colleagues refer patients to your department, they will be listed here for immediate action."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pendingReferralsList.map((ref) => (
                <div
                  key={ref.id}
                  style={{
                    padding: "14px",
                    border: "1px solid #E9D5FF",
                    borderRadius: "12px",
                    backgroundColor: "#FFFFFF"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <span
                        onClick={() => onOpenPatient(ref.patientId)}
                        style={{
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          color: "#4C1D95",
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                      >
                        {ref.patientName}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#64748B", marginLeft: 6 }}>
                        ({ref.patientId})
                      </span>
                    </div>
                    <Badge variant={ref.urgency}>{ref.urgency}</Badge>
                  </div>

                  <div style={{ fontSize: "0.775rem", color: "#5B21B6", marginBottom: 8, fontWeight: 600 }}>
                    <strong>Referred By:</strong> {ref.referringDoctorName} ({ref.referringDepartment})
                  </div>

                  <p style={{ fontSize: "0.775rem", color: "#64748B", margin: "0 0 12px", lineHeight: 1.4 }}>
                    {ref.reason}
                  </p>

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => onOpenPatient(ref.patientId)}
                    >
                      View Dossier
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleReferralAction(ref.id, "Declined")}
                    >
                      Decline
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleReferralAction(ref.id, "Accepted")}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Split Section: Hospital Announcements & Today's Meetings */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        {/* Hospital Announcements */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Megaphone size={18} color="#7C3AED" />
              <span>Hospital Directives & Announcements</span>
            </div>
            <button
              onClick={() => onNavigate("announcements")}
              className="btn btn-outline btn-sm"
            >
              View All →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {announcementsList.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                style={{
                  padding: "13px 15px",
                  border: "1px solid #E9D5FF",
                  borderRadius: "12px",
                  backgroundColor: ann.isRead ? "#FFFFFF" : "#FAF5FF"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#4C1D95" }}>
                    {ann.title}
                  </div>
                  <Badge variant={ann.priority}>{ann.priority}</Badge>
                </div>
                <div style={{ fontSize: "0.74rem", color: "#7C3AED", fontWeight: 600, marginBottom: 6 }}>
                  {ann.department} • {ann.date}
                </div>
                <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0, lineHeight: 1.45 }}>
                  {ann.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Video size={18} color="#7C3AED" />
              <span>Today's Clinical Meetings</span>
            </div>
            <button
              onClick={() => onNavigate("meetings")}
              className="btn btn-outline btn-sm"
            >
              Calendar →
            </button>
          </div>

          {todayMeetingsList.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No meetings today"
              message="No clinical rounds or case conferences scheduled for today."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {todayMeetingsList.map((meet) => (
                <div
                  key={meet.id}
                  style={{
                    padding: "13px 15px",
                    border: "1px solid #E9D5FF",
                    borderRadius: "12px",
                    backgroundColor: "#FFFFFF"
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#4C1D95" }}>
                    {meet.title}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#7C3AED", fontWeight: 700, marginTop: 2 }}>
                    {meet.time} • {meet.location}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 4 }}>
                    Organizer: {meet.organizer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

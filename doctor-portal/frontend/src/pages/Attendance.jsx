import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard.jsx";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  ClockCheck,
  CheckCircle2,
  LogOut,
  Calendar,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { attendanceApi } from "../api/client.js";

export const Attendance = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState({
    totalWorkingDays: 0,
    presentDays: 0,
    leaveDays: 0,
    absentDays: 0,
    attendanceRate: "100%"
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const [todayRes, histRes] = await Promise.all([
        attendanceApi.getToday(),
        attendanceApi.getHistory()
      ]);

      if (todayRes.success) setTodayAttendance(todayRes.attendance);
      if (histRes.success) {
        setHistory(histRes.history || []);
        setMetrics(histRes.metrics || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMark = async (action) => {
    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });
      const res = await attendanceApi.mark(action);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        setTodayAttendance(res.attendance);
        // Refresh history
        const histRes = await attendanceApi.getHistory();
        if (histRes.success) {
          setHistory(histRes.history || []);
          setMetrics(histRes.metrics || {});
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to record attendance." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
          Doctor Duty Attendance & Biometric Logs
        </h2>
        <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
          Mark clinical duty check-in/check-out and track monthly attendance performance compliance.
        </p>
      </div>

      {message.text && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: message.type === "success" ? "#F0FDF4" : "#FFF1F2",
            border: `1px solid ${message.type === "success" ? "#BBF7D0" : "#FECDD3"}`,
            color: message.type === "success" ? "#166534" : "#9F1239",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Today's Duty Status Card */}
      <div
        className="card"
        style={{
          border: "1px solid #E9D5FF",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #ffffff 0%, #FAF5FF 100%)",
          boxShadow: "0 4px 20px rgba(76, 29, 149, 0.05)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "14px",
                backgroundColor: todayAttendance ? "#F0FDF4" : "#FAF5FF",
                color: todayAttendance ? "#166534" : "#7C3AED",
                border: `1px solid ${todayAttendance ? "#BBF7D0" : "#E9D5FF"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {todayAttendance ? <CheckCircle2 size={32} /> : <Clock size={32} />}
            </div>

            <div>
              <div style={{ fontSize: "0.8rem", color: "#6B6472", fontWeight: 700, textTransform: "uppercase" }}>
                TODAY'S CLINICAL ATTENDANCE
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#4C1D95", marginTop: 2 }}>
                {todayAttendance ? (
                  <span style={{ color: "#059669" }}>
                    Present • {todayAttendance.checkInTime}
                  </span>
                ) : (
                  <span style={{ color: "#D97706" }}>
                    Not Checked In Yet
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#6B6472", marginTop: 2 }}>
                Date: {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                {todayAttendance?.checkOutTime && ` • Checked out at ${todayAttendance.checkOutTime}`}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            {!todayAttendance ? (
              <button
                disabled={submitting}
                className="btn btn-primary"
                onClick={() => handleMark("check-in")}
                style={{ padding: "10px 22px", fontSize: "0.9rem" }}
              >
                <CheckCircle2 size={18} />
                <span>{submitting ? "Recording Check-in..." : "Mark Present (Check-in)"}</span>
              </button>
            ) : !todayAttendance.checkOutTime ? (
              <button
                disabled={submitting}
                className="btn btn-secondary"
                onClick={() => handleMark("check-out")}
                style={{ padding: "10px 22px", fontSize: "0.9rem" }}
              >
                <LogOut size={18} />
                <span>{submitting ? "Recording Check-out..." : "End Duty (Check-out)"}</span>
              </button>
            ) : (
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#FAF5FF",
                  border: "1px solid #E9D5FF",
                  color: "#5B21B6",
                  fontWeight: 600,
                  fontSize: "0.825rem"
                }}
              >
                ✓ Today's Duty Shift Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <StatCard
          title="Total Working Days"
          value={metrics.totalWorkingDays}
          subtitle="Past 30 days duty roster"
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Present Days"
          value={metrics.presentDays}
          subtitle="Full day attendance logged"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Leave Days"
          value={metrics.leaveDays}
          subtitle="Approved institutional leave"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Absent Days"
          value={metrics.absentDays}
          subtitle="Unexcused non-attendance"
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="Attendance Rate"
          value={metrics.attendanceRate}
          subtitle="Regulatory compliance rating"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Attendance History Table */}
      <div className="card" style={{ padding: 0, border: "1px solid #E9D5FF", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E9D5FF", backgroundColor: "#FAF5FF" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#4C1D95" }}>
            Chronological Attendance & Check-in History
          </h3>
          <p style={{ fontSize: "0.775rem", color: "#6B6472", margin: "4px 0 0" }}>
            Biometric and portal log records for hospital audit and payroll compliance.
          </p>
        </div>

        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          {history.length === 0 ? (
            <EmptyState
              icon={ClockCheck}
              title="No attendance records found"
              message="Check in using the button above to begin tracking attendance."
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check-in Time</th>
                  <th>Check-out Time</th>
                  <th>Verification Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong style={{ color: "#2D2438" }}>{record.date}</strong>
                    </td>
                    <td>
                      <Badge status={record.status} />
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#059669" }}>
                        {record.checkInTime || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#6B6472" }}>
                        {record.checkOutTime || "Active / Open"}
                      </span>
                    </td>
                    <td style={{ color: "#6B6472", fontSize: "0.8rem" }}>
                      {record.notes || "Verified by System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;

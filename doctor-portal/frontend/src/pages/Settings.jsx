import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Settings as SettingsIcon,
  Lock,
  Bell,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save
} from "lucide-react";

export const Settings = () => {
  const { doctor, changePassword, logout } = useAuth();
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailAlerts: true,
    patientBookingAlerts: true,
    specialistReferralAlerts: true,
    emergencyBroadcasts: true
  });
  const [prefSaved, setPrefSaved] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!passData.currentPassword || !passData.newPassword || !passData.confirmPassword) {
      setPassError("Please fill in all password fields.");
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError("New password and confirmation do not match.");
      return;
    }

    try {
      setPassLoading(true);
      const res = await changePassword(passData.currentPassword, passData.newPassword);
      if (res.success) {
        setPassSuccess(res.message);
        setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setPassError(err.message || "Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  const handleTogglePref = (key) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 840 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
          Security & Account Settings
        </h2>
        <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
          Manage your Doctor Portal authentication credentials, notification preferences, and session controls.
        </p>
      </div>

      {/* Change Password Card */}
      <div className="card" style={{ border: "1px solid #E9D5FF", borderRadius: "16px", boxShadow: "0 4px 18px rgba(76, 29, 149, 0.04)" }}>
        <div className="card-header" style={{ borderBottom: "1px solid #E9D5FF" }}>
          <div className="card-title" style={{ color: "#4C1D95" }}>
            <Lock size={18} color="#7C3AED" />
            <span>Change Practitioner Password</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#6B6472" }}>
            Bcrypt Hashed & Salted Storage
          </span>
        </div>

        {passSuccess && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              color: "#166534",
              fontSize: "0.825rem",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <CheckCircle2 size={16} />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: "#FFF1F2",
              border: "1px solid #FECDD3",
              color: "#9F1239",
              fontSize: "0.825rem",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <AlertCircle size={16} />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 480 }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={passData.confirmPassword}
              onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="btn btn-primary"
            style={{ marginTop: 8 }}
          >
            <Lock size={15} />
            <span>{passLoading ? "Updating Password..." : "Update Password"}</span>
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="card" style={{ border: "1px solid #E9D5FF", borderRadius: "16px", boxShadow: "0 4px 18px rgba(76, 29, 149, 0.04)" }}>
        <div className="card-header" style={{ borderBottom: "1px solid #E9D5FF" }}>
          <div className="card-title" style={{ color: "#4C1D95" }}>
            <Bell size={18} color="#7C3AED" />
            <span>Notification & Alert Preferences</span>
          </div>
          {prefSaved && (
            <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>
              ✓ Preferences saved
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            {
              id: "specialistReferralAlerts",
              label: "Specialist Patient Referrals",
              desc: "Receive instant high-priority alerts when a patient is referred to your clinic"
            },
            {
              id: "patientBookingAlerts",
              label: "New Appointment Bookings",
              desc: "Alerts when patients are scheduled or check in at the hospital triage desk"
            },
            {
              id: "emergencyBroadcasts",
              label: "Emergency & Code Blue Broadcasts",
              desc: "Hospital-wide urgent directives and administrative emergency safety notices"
            },
            {
              id: "emailAlerts",
              label: "Institutional Email Digest",
              desc: "Daily morning briefing of scheduled patient appointments and departmental meetings"
            }
          ].map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                backgroundColor: "#FAF5FF",
                borderRadius: "12px",
                border: "1px solid #E9D5FF"
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#4C1D95" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "0.775rem", color: "#6B6472", marginTop: 2 }}>
                  {item.desc}
                </div>
              </div>

              <input
                type="checkbox"
                checked={notificationPrefs[item.id]}
                onChange={() => handleTogglePref(item.id)}
                style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#7C3AED" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Session & Logout */}
      <div className="card" style={{ borderColor: "#FECDD3", backgroundColor: "#FFF1F2", borderRadius: "16px" }}>
        <div className="card-header" style={{ borderColor: "#FECDD3" }}>
          <div className="card-title" style={{ color: "#9F1239" }}>
            <LogOut size={18} />
            <span>Session Management & Doctor Logout</span>
          </div>
        </div>

        <p style={{ fontSize: "0.825rem", color: "#6B6472", marginBottom: 16 }}>
          Logging out terminates your current active session token and secures patient medical dossiers from unauthorized workstation access.
        </p>

        <div>
          <button className="btn btn-danger" onClick={logout}>
            <LogOut size={15} />
            <span>Terminate Session & Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

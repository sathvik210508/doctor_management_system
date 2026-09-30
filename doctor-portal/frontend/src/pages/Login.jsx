import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Hospital, Lock, User, AlertCircle, ShieldCheck } from "lucide-react";
import Modal from "../components/Modal.jsx";

export const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [doctorId, setDoctorId] = useState("DOC1001");
  const [password, setPassword] = useState("Doctor@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  const demoAccounts = [
    { id: "DOC1001", name: "Dr. Sarah Jenkins", dept: "Cardiology" },
    { id: "DOC1002", name: "Dr. Rajesh Patel", dept: "Dermatology" },
    { id: "DOC1003", name: "Dr. Vikram Rao", dept: "Orthopedics" },
    { id: "DOC1004", name: "Dr. Alisha Sharma", dept: "Neurology" },
    { id: "DOC1005", name: "Dr. Ananya Reddy", dept: "Gynecology" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!doctorId.trim() || !password) {
      setError("Please enter both Doctor ID and Password.");
      return;
    }

    try {
      setLoading(true);
      await login(doctorId.trim(), password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (docId) => {
    setDoctorId(docId);
    setPassword("Doctor@123");
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FAFAFF",
        padding: "24px 16px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 12px 32px rgba(124, 58, 237, 0.08)",
          border: "1px solid #E9D5FF",
          overflow: "hidden"
        }}
      >
        {/* Brand Header matching Patient Portal */}
        <div
          style={{
            backgroundColor: "#FAF5FF",
            borderBottom: "1px solid #E9D5FF",
            padding: "28px 24px",
            textAlign: "center"
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "14px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E9D5FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 4px 12px rgba(124, 58, 237, 0.1)"
            }}
          >
            <Hospital size={26} color="#7C3AED" />
          </div>
          <h1
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "#5B21B6",
              letterSpacing: "-0.4px",
              margin: 0
            }}
          >
            LIORA HOSPITALS
          </h1>
          <p
            style={{
              fontSize: "0.8rem",
              color: "#7C3AED",
              fontWeight: 700,
              marginTop: 4,
              letterSpacing: "0.06em",
              textTransform: "uppercase"
            }}
          >
            Doctor Portal
          </p>
        </div>

        {/* Login Form Body */}
        <div style={{ padding: "28px 26px" }}>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                backgroundColor: "#FFF1F2",
                border: "1px solid #FECDD3",
                borderRadius: "10px",
                color: "#BE123C",
                fontSize: "0.825rem",
                marginBottom: 20
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="doctorId" style={{ color: "#4C1D95" }}>
                Doctor ID
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={16}
                  color="#8B5CF6"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  id="doctorId"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="e.g. DOC1001"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value.toUpperCase())}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label className="form-label" htmlFor="password" style={{ margin: 0, color: "#4C1D95" }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#7C3AED",
                    fontSize: "0.775rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  color="#8B5CF6"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", padding: "11px", fontSize: "0.925rem" }}
            >
              {loading ? "Authenticating..." : "Login to Doctor Portal"}
            </button>
          </form>

          {/* Demo Accounts Quick Selection */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: "1px solid #E9D5FF"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10
              }}
            >
              <span
                style={{
                  fontSize: "0.725rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#8B5CF6"
                }}
              >
                Quick Demo Accounts (Click to Fill)
              </span>
              <span style={{ fontSize: "0.72rem", color: "#15803D", fontWeight: 700 }}>
                Default: Doctor@123
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectDemo(acc.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "7px 10px",
                    borderRadius: "10px",
                    border: doctorId === acc.id ? "1.5px solid #7C3AED" : "1px solid #E9D5FF",
                    backgroundColor: doctorId === acc.id ? "#F3F0FF" : "#FAF5FF",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s"
                  }}
                >
                  <span style={{ fontSize: "0.775rem", fontWeight: 800, color: "#4C1D95" }}>
                    {acc.id}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#7C3AED", fontWeight: 600 }}>
                    {acc.dept}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div
          style={{
            padding: "12px 24px",
            backgroundColor: "#FAF5FF",
            borderTop: "1px solid #E9D5FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: "0.75rem",
            color: "#64748B"
          }}
        >
          <ShieldCheck size={15} color="#15803D" />
          <span>NABH Compliant Encrypted Medical Portal</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Doctor Password Assistance"
        footer={
          <button className="btn btn-primary" onClick={() => setShowForgotModal(false)}>
            Understood
          </button>
        }
      >
        <div style={{ lineHeight: 1.6, color: "#1E293B" }}>
          <p style={{ marginBottom: 12 }}>
            In accordance with Liora Hospitals Information Security Policies, doctor credential resets require institutional verification.
          </p>
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "#FAF5FF",
              border: "1px solid #E9D5FF",
              borderRadius: "12px",
              marginBottom: 12
            }}
          >
            <strong style={{ color: "#4C1D95" }}>Hospital IT Helpdesk:</strong> Ext. 4401 / 4402<br />
            <strong style={{ color: "#4C1D95" }}>Direct Email:</strong> it-support@liorahospitals.com<br />
            <strong style={{ color: "#4C1D95" }}>Office:</strong> Medical Superintendent Block, Level 1
          </div>
          <p style={{ fontSize: "0.825rem", color: "#64748B" }}>
            For local evaluation, you can use any demo account (<strong>DOC1001</strong> to <strong>DOC1005</strong>) with the standard password <code>Doctor@123</code>.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Login;

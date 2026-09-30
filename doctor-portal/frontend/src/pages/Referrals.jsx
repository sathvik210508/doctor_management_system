import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Modal from "../components/Modal.jsx";
import {
  Share2,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ArrowRight,
  AlertTriangle,
  FileText
} from "lucide-react";
import { referralApi, doctorApi, patientApi } from "../api/client.js";

export const Referrals = ({ onSelectPatient, initialReferralData }) => {
  const { doctor } = useAuth();
  const [activeTab, setActiveTab] = useState("received"); // "received" or "sent"
  const [referrals, setReferrals] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [showReferModal, setShowReferModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    patientId: "",
    targetDepartment: "Dermatology",
    targetDoctorId: "",
    reason: "",
    additionalNotes: "",
    urgency: "Priority"
  });

  useEffect(() => {
    loadReferrals();
    loadPrerequisites();
  }, []);

  useEffect(() => {
    if (initialReferralData) {
      setFormData((prev) => ({
        ...prev,
        patientId: initialReferralData.patientId || "",
        reason: initialReferralData.reason || ""
      }));
      setShowReferModal(true);
    }
  }, [initialReferralData]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const res = await referralApi.getReferrals();
      if (res.success) {
        setReferrals({
          received: res.received || [],
          sent: res.sent || []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPrerequisites = async () => {
    try {
      const [docsRes, patsRes] = await Promise.all([
        doctorApi.getAllDoctors(),
        patientApi.getAll()
      ]);

      if (docsRes.success) {
        // Exclude current doctor
        const otherDocs = (docsRes.doctors || []).filter((d) => d.doctorId !== doctor?.doctorId);
        setDoctorsList(otherDocs);
        if (otherDocs.length > 0 && !formData.targetDoctorId) {
          setFormData((prev) => ({
            ...prev,
            targetDoctorId: otherDocs[0].doctorId,
            targetDepartment: otherDocs[0].department
          }));
        }
      }
      if (patsRes.success) {
        setPatientsList(patsRes.patients || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDepartmentChange = (dept) => {
    const matchedDoc = doctorsList.find((d) => d.department.toLowerCase().includes(dept.toLowerCase()) || d.specialization.toLowerCase().includes(dept.toLowerCase()));
    setFormData((prev) => ({
      ...prev,
      targetDepartment: dept,
      targetDoctorId: matchedDoc ? matchedDoc.doctorId : prev.targetDoctorId
    }));
  };

  const handleDoctorChange = (docId) => {
    const doc = doctorsList.find((d) => d.doctorId === docId);
    setFormData((prev) => ({
      ...prev,
      targetDoctorId: docId,
      targetDepartment: doc ? doc.department : prev.targetDepartment
    }));
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.patientId || !formData.targetDoctorId || !formData.reason.trim()) {
      setError("Please select patient, target specialist doctor, and provide a clinical reason.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await referralApi.createReferral(formData);
      if (res.success) {
        setSuccessMsg(res.message);
        setShowReferModal(false);
        setFormData({
          patientId: "",
          targetDepartment: "Dermatology",
          targetDoctorId: doctorsList[0]?.doctorId || "",
          reason: "",
          additionalNotes: "",
          urgency: "Priority"
        });
        loadReferrals();
        setActiveTab("sent");
      }
    } catch (err) {
      setError(err.message || "Failed to create patient referral.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await referralApi.updateStatus(id, status);
      if (res.success) {
        setSuccessMsg(`Referral marked as ${status}.`);
        loadReferrals();
      }
    } catch (e) {
      alert(e.message || "Failed to update referral.");
    }
  };

  const displayedReferrals = activeTab === "received" ? referrals.received : referrals.sent;
  const pendingReceivedCount = referrals.received.filter((r) => r.status === "Pending").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Title & Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
            Patient Inter-Specialty Referral Network
          </h2>
          <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
            Refer patients across departments for specialized evaluation and accept specialist consultations.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowReferModal(true)}>
          <Plus size={16} />
          <span>Refer New Patient</span>
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            color: "#166534",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs: Received vs Sent */}
      <div style={{ display: "flex", gap: 10, borderBottom: "1px solid #E9D5FF" }}>
        <button
          onClick={() => setActiveTab("received")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "received" ? "2px solid #7C3AED" : "2px solid transparent",
            color: activeTab === "received" ? "#5B21B6" : "#6B6472",
            fontWeight: activeTab === "received" ? 700 : 500,
            fontSize: "0.9rem",
            cursor: "pointer",
            marginBottom: -2,
            transition: "all 0.15s ease"
          }}
        >
          <span>Incoming Referrals ({referrals.received.length})</span>
          {pendingReceivedCount > 0 && (
            <span
              style={{
                backgroundColor: "#FFF1F2",
                color: "#9F1239",
                border: "1px solid #FECDD3",
                fontSize: "0.68rem",
                fontWeight: 700,
                borderRadius: "9999px",
                padding: "2px 8px"
              }}
            >
              {pendingReceivedCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("sent")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "sent" ? "2px solid #7C3AED" : "2px solid transparent",
            color: activeTab === "sent" ? "#5B21B6" : "#6B6472",
            fontWeight: activeTab === "sent" ? 700 : 500,
            fontSize: "0.9rem",
            cursor: "pointer",
            marginBottom: -2,
            transition: "all 0.15s ease"
          }}
        >
          <span>Referrals I Issued ({referrals.sent.length})</span>
        </button>
      </div>

      {/* Referrals Cards Grid */}
      {displayedReferrals.length === 0 ? (
        <EmptyState
          icon={Share2}
          title={activeTab === "received" ? "No incoming referrals" : "No referrals sent yet"}
          message={
            activeTab === "received"
              ? "Patients referred to you by colleagues will appear in this inbox."
              : "Click 'Refer New Patient' to refer a patient to another specialist."
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {displayedReferrals.map((ref) => (
            <div
              key={ref.id}
              className="card"
              style={{
                backgroundColor: ref.status === "Pending" && activeTab === "received" ? "#FAF5FF" : "#ffffff",
                border: "1px solid #E9D5FF",
                borderLeft: ref.status === "Pending" && activeTab === "received" ? "4px solid #7C3AED" : "1px solid #E9D5FF",
                borderRadius: "16px",
                boxShadow: "0 4px 18px rgba(76, 29, 149, 0.04)"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#5B21B6" }}>
                      {ref.referralId}
                    </span>
                    <Badge variant={ref.urgency}>{ref.urgency} Urgency</Badge>
                    <Badge status={ref.status} />
                  </div>

                  <h3
                    onClick={() => onSelectPatient(ref.patientId)}
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: "#4C1D95",
                      marginTop: 6,
                      cursor: "pointer",
                      textDecoration: "underline",
                      textUnderlineOffset: 3
                    }}
                  >
                    Patient: {ref.patientName} ({ref.patientId})
                  </h3>
                </div>

                <div style={{ fontSize: "0.775rem", color: "#6B6472", textAlign: "right" }}>
                  <div>Created: {new Date(ref.createdAt).toLocaleDateString()}</div>
                  <div style={{ color: "#7C3AED", fontWeight: 600 }}>{ref.targetDepartment}</div>
                </div>
              </div>

              {/* Doctors flow */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  backgroundColor: "#FAF5FF",
                  border: "1px solid #E9D5FF",
                  borderRadius: "10px",
                  fontSize: "0.825rem",
                  marginBottom: 12
                }}
              >
                <div>
                  <span style={{ color: "#6B6472" }}>Referring Doctor: </span>
                  <strong style={{ color: "#2D2438" }}>{ref.referringDoctorName}</strong> ({ref.referringDepartment})
                </div>
                <ArrowRight size={14} color="#7C3AED" />
                <div>
                  <span style={{ color: "#6B6472" }}>Target Specialist: </span>
                  <strong style={{ color: "#2D2438" }}>{ref.targetDoctorName}</strong> ({ref.targetDepartment})
                </div>
              </div>

              {/* Clinical Justification */}
              <div style={{ marginBottom: 14 }}>
                <strong style={{ fontSize: "0.825rem", color: "#4C1D95" }}>Clinical Reason: </strong>
                <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0", lineHeight: 1.5 }}>
                  {ref.reason}
                </p>
                {ref.additionalNotes && (
                  <p style={{ fontSize: "0.775rem", color: "#8B5CF6", margin: "6px 0 0", fontStyle: "italic" }}>
                    Notes: {ref.additionalNotes}
                  </p>
                )}
              </div>

              {/* Action Buttons for Receiving Doctor */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #E9D5FF" }}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onSelectPatient(ref.patientId)}
                >
                  <User size={13} />
                  <span>View Patient Dossier</span>
                </button>

                {activeTab === "received" && ref.status === "Pending" && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleUpdateStatus(ref.id, "Declined")}
                    >
                      <XCircle size={14} />
                      <span>Decline Referral</span>
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleUpdateStatus(ref.id, "Accepted")}
                    >
                      <CheckCircle2 size={14} />
                      <span>Accept Referral</span>
                    </button>
                  </div>
                )}

                {ref.status === "Accepted" && (
                  <span style={{ fontSize: "0.8rem", color: "#059669", fontWeight: 700 }}>
                    ✓ Referral Accepted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refer Patient Modal */}
      <Modal
        isOpen={showReferModal}
        onClose={() => setShowReferModal(false)}
        title="Create Patient Referral to Specialist"
        size="lg"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={() => setShowReferModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateReferral} disabled={submitting}>
              {submitting ? "Sending Referral..." : "Send Referral"}
            </button>
          </div>
        }
      >
        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              backgroundColor: "#FFF1F2",
              border: "1px solid #FECDD3",
              color: "#9F1239",
              fontSize: "0.825rem",
              marginBottom: 16
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleCreateReferral}>
          <div className="form-group">
            <label className="form-label">Select Patient</label>
            <select
              className="form-select"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              required
            >
              <option value="">-- Choose Patient --</option>
              {patientsList.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.name} ({p.patientId}) - {p.currentCondition}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Target Specialty Department</label>
              <select
                className="form-select"
                value={formData.targetDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
              >
                <option value="Dermatology & Cutaneous Surgery">Dermatology</option>
                <option value="Orthopedics & Joint Reconstruction">Orthopedics</option>
                <option value="Neurology & Neurosciences">Neurology</option>
                <option value="Obstetrics & Gynecology">Gynecology</option>
                <option value="Cardiology & Vascular Medicine">Cardiology</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Specialist Doctor</label>
              <select
                className="form-select"
                value={formData.targetDoctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                required
              >
                <option value="">-- Choose Doctor --</option>
                {doctorsList.map((d) => (
                  <option key={d.doctorId} value={d.doctorId}>
                    {d.name} ({d.specialization} - {d.doctorId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Urgency</label>
            <select
              className="form-select"
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            >
              <option value="Routine">Routine</option>
              <option value="Priority">Priority</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Referral</label>
            <textarea
              className="form-textarea"
              placeholder="Explain why specialist evaluation or co-management is indicated..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Clinical Notes (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Lab investigations, recent scans, current medication intolerance..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Referrals;

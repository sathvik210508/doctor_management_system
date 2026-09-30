import React, { useState, useEffect } from "react";
import Modal from "../components/Modal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Search,
  Pill,
  Share2
} from "lucide-react";
import { consultationApi, patientApi } from "../api/client.js";

export const Consultations = ({
  initialData,
  onSelectPatient,
  onWritePrescription
}) => {
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: "",
    symptoms: "",
    diagnosis: "",
    observations: "",
    treatmentPlan: "",
    doctorNotes: "",
    followUpDate: ""
  });

  useEffect(() => {
    loadConsultations();
    loadPatients();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        patientId: initialData.patientId || "",
        appointmentId: initialData.appointmentId || ""
      }));
      setShowAddModal(true);
    }
  }, [initialData]);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const res = await consultationApi.getConsultations();
      if (res.success) {
        setConsultations(res.consultations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await patientApi.getAll();
      if (res.success) {
        setPatients(res.patients || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.patientId || !formData.symptoms.trim() || !formData.diagnosis.trim()) {
      setError("Patient selection, symptoms, and formal diagnosis are mandatory.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await consultationApi.create(formData);
      if (res.success) {
        setSuccessMsg(res.message);
        setShowAddModal(false);
        setFormData({
          patientId: "",
          appointmentId: "",
          symptoms: "",
          diagnosis: "",
          observations: "",
          treatmentPlan: "",
          doctorNotes: "",
          followUpDate: ""
        });
        loadConsultations();
      }
    } catch (err) {
      setError(err.message || "Failed to record consultation.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredConsultations = consultations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.patientName.toLowerCase().includes(q) ||
      c.patientId.toLowerCase().includes(q) ||
      c.diagnosis.toLowerCase().includes(q) ||
      c.consultationId.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
            Clinical Consultation Notes
          </h2>
          <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
            Document medical observations, clinical diagnoses, management plans, and follow-up schedules.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative", width: 240 }}>
            <Search
              size={15}
              color="#8B5CF6"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 32, fontSize: "0.825rem", backgroundColor: "#FAF5FF", borderColor: "#E9D5FF" }}
              placeholder="Search diagnosis or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Record Consultation</span>
          </button>
        </div>
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

      {/* Consultations List */}
      {filteredConsultations.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No consultation notes found"
          message="Document a clinical encounter by clicking 'Record Consultation'."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredConsultations.map((con) => (
            <div
              key={con.id}
              className="card"
              style={{
                border: "1px solid #E9D5FF",
                borderRadius: "16px",
                boxShadow: "0 4px 18px rgba(76, 29, 149, 0.04)"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#5B21B6" }}>
                      {con.consultationId}
                    </span>
                    <span style={{ fontSize: "0.775rem", color: "#6B6472" }}>
                      Date: {con.date}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectPatient(con.patientId)}
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#4C1D95",
                      marginTop: 4,
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    {con.patientName} ({con.patientId})
                  </h3>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => onWritePrescription({ patientId: con.patientId, name: con.patientName })}
                  >
                    <Pill size={13} />
                    <span>Prescribe</span>
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => onSelectPatient(con.patientId)}
                  >
                    <User size={13} />
                    <span>View Dossier</span>
                  </button>
                </div>
              </div>

              {/* Clinical Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, backgroundColor: "#FAF5FF", padding: "14px", borderRadius: "12px", border: "1px solid #E9D5FF" }}>
                <div>
                  <strong style={{ fontSize: "0.75rem", color: "#6B6472", textTransform: "uppercase" }}>SYMPTOMS PRESENTED</strong>
                  <div style={{ fontSize: "0.85rem", color: "#2D2438", marginTop: 2 }}>{con.symptoms}</div>
                </div>

                <div>
                  <strong style={{ fontSize: "0.75rem", color: "#7C3AED", textTransform: "uppercase" }}>CLINICAL DIAGNOSIS</strong>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#4C1D95", marginTop: 2 }}>{con.diagnosis}</div>
                </div>

                {con.observations && (
                  <div>
                    <strong style={{ fontSize: "0.75rem", color: "#6B6472", textTransform: "uppercase" }}>CLINICAL OBSERVATIONS & VITALS</strong>
                    <div style={{ fontSize: "0.825rem", color: "#2D2438", marginTop: 2 }}>{con.observations}</div>
                  </div>
                )}

                {con.treatmentPlan && (
                  <div>
                    <strong style={{ fontSize: "0.75rem", color: "#6B6472", textTransform: "uppercase" }}>TREATMENT PLAN</strong>
                    <div style={{ fontSize: "0.825rem", color: "#2D2438", marginTop: 2, whiteSpace: "pre-line" }}>{con.treatmentPlan}</div>
                  </div>
                )}
              </div>

              {con.doctorNotes && (
                <div style={{ marginTop: 12, fontSize: "0.8rem", color: "#6B6472" }}>
                  <strong style={{ color: "#4C1D95" }}>Doctor Remarks:</strong> {con.doctorNotes}
                </div>
              )}

              {con.followUpDate && (
                <div style={{ marginTop: 8, fontSize: "0.775rem", color: "#059669", fontWeight: 700 }}>
                  Scheduled Follow-up Date: {con.followUpDate}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Record Consultation Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record Clinical Consultation Note"
        size="lg"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>
              {submitting ? "Saving Note..." : "Save Consultation Note"}
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

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Select Patient</label>
            <select
              className="form-select"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              required
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.name} ({p.patientId}) - {p.currentCondition}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Presented Symptoms</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Exertional breathlessness, evening ankle edema, intermittent palpitations..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Diagnosis</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Stage 1 Essential Hypertension with Sinus Tachycardia"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Observations & Examination Findings</label>
            <textarea
              className="form-textarea"
              placeholder="BP: 142/90 mmHg, HR: 82 bpm, S1/S2 heard, chest clear..."
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Treatment Plan & Dietary Directives</label>
            <textarea
              className="form-textarea"
              placeholder="Lifestyle modifications, sodium restriction, prescribed pharmacological regimen..."
              value={formData.treatmentPlan}
              onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Doctor's Confidential Remarks</label>
              <input
                type="text"
                className="form-input"
                placeholder="Compliance noted, advised warning signs..."
                value={formData.doctorNotes}
                onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scheduled Follow-up Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Consultations;

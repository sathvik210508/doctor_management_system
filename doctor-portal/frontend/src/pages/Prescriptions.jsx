import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Modal from "../components/Modal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  Pill,
  Plus,
  Trash2,
  Printer,
  Calendar,
  User,
  CheckCircle2,
  Hospital,
  AlertCircle
} from "lucide-react";
import { prescriptionApi, patientApi } from "../api/client.js";

export const Prescriptions = ({ initialData, onSelectPatient }) => {
  const { doctor } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [printRx, setPrintRx] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    patientId: "",
    generalAdvice: "",
    followUpDate: "",
    medicines: [
      { name: "Tab. Amlodipine", dosage: "5 mg", frequency: "Once daily (1-0-0)", duration: "30 days", instructions: "After breakfast" }
    ]
  });

  useEffect(() => {
    loadPrescriptions();
    loadPatients();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        patientId: initialData.patientId || ""
      }));
      setShowCreateModal(true);
    }
  }, [initialData]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await prescriptionApi.getPrescriptions();
      if (res.success) {
        setPrescriptions(res.prescriptions || []);
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

  const handleAddMedicineRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: "", dosage: "", frequency: "Once daily", duration: "5 days", instructions: "After food" }
      ]
    }));
  };

  const handleRemoveMedicineRow = (index) => {
    if (formData.medicines.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.medicines];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medicines: updated };
    });
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.patientId) {
      setError("Please select a patient.");
      return;
    }

    for (const med of formData.medicines) {
      if (!med.name.trim() || !med.dosage.trim()) {
        setError("All medicine entries must have a name and dosage specified.");
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await prescriptionApi.create(formData);
      if (res.success) {
        setSuccessMsg(res.message);
        setShowCreateModal(false);
        setFormData({
          patientId: "",
          generalAdvice: "",
          followUpDate: "",
          medicines: [
            { name: "", dosage: "", frequency: "Once daily", duration: "5 days", instructions: "After food" }
          ]
        });
        loadPrescriptions();
      }
    } catch (err) {
      setError(err.message || "Failed to create prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
            Prescriptions & Pharmacotherapy Records
          </h2>
          <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
            Generate electronic prescriptions, drug dosages, frequencies, instructions, and official hospital slips.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          <span>New Prescription</span>
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

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No prescriptions written yet"
          message="Click 'New Prescription' to formulate medication orders for patients."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="card"
              style={{
                border: "1px solid #E9D5FF",
                borderRadius: "16px",
                boxShadow: "0 4px 18px rgba(76, 29, 149, 0.04)"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#5B21B6" }}>
                      {rx.prescriptionId}
                    </span>
                    <span style={{ fontSize: "0.775rem", color: "#6B6472" }}>
                      Issued: {rx.date}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectPatient(rx.patientId)}
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#4C1D95",
                      marginTop: 4,
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    {rx.patientName} ({rx.patientId})
                  </h3>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setPrintRx(rx)}
                  >
                    <Printer size={14} />
                    <span>Print Slip</span>
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => onSelectPatient(rx.patientId)}
                  >
                    <User size={14} />
                    <span>Patient Dossier</span>
                  </button>
                </div>
              </div>

              {/* Medicines Table */}
              <div className="table-container" style={{ marginBottom: 12, borderRadius: "12px", border: "1px solid #E9D5FF" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rx.medicines?.map((med, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong style={{ color: "#4C1D95" }}>{med.name}</strong>
                        </td>
                        <td>{med.dosage}</td>
                        <td>{med.frequency}</td>
                        <td>{med.duration}</td>
                        <td style={{ color: "#6B6472" }}>{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rx.generalAdvice && (
                <div style={{ fontSize: "0.8rem", color: "#6B6472", fontStyle: "italic" }}>
                  <strong style={{ color: "#4C1D95" }}>General Dietary & Clinical Advice:</strong> {rx.generalAdvice}
                </div>
              )}

              {rx.followUpDate && (
                <div style={{ marginTop: 6, fontSize: "0.775rem", color: "#059669", fontWeight: 700 }}>
                  Review Follow-up Date: {rx.followUpDate}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Prescription Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Formulate Clinical Prescription"
        size="lg"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSavePrescription} disabled={submitting}>
              {submitting ? "Saving Prescription..." : "Save Prescription"}
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

        <form onSubmit={handleSavePrescription}>
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

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>
                Prescribed Medicines
              </label>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={handleAddMedicineRow}
              >
                <Plus size={13} />
                <span>Add Medicine</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {formData.medicines.map((med, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr auto",
                    gap: 8,
                    alignItems: "center",
                    padding: "10px",
                    backgroundColor: "#FAF5FF",
                    borderRadius: "10px",
                    border: "1px solid #E9D5FF"
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Medicine Name (e.g. Paracetamol)"
                    value={med.name}
                    onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                    required
                  />

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Dosage (500 mg)"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                    required
                  />

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Freq (1-0-1)"
                    value={med.frequency}
                    onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                  />

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Duration (5 days)"
                    value={med.duration}
                    onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                  />

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Instructions (After food)"
                    value={med.instructions}
                    onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveMedicineRow(index)}
                    disabled={formData.medicines.length === 1}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: formData.medicines.length === 1 ? "not-allowed" : "pointer",
                      color: "#E11D48",
                      padding: 6
                    }}
                    title="Remove medicine"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">General Advice / Instructions</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Low sodium diet, maintain adequate hydration, avoid sudden exertion..."
              value={formData.generalAdvice}
              onChange={(e) => setFormData({ ...formData, generalAdvice: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Scheduled Review Follow-up Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Printable Prescription Modal */}
      {printRx && (
        <Modal
          isOpen={true}
          onClose={() => setPrintRx(null)}
          title={`Official Prescription Slip: ${printRx.prescriptionId}`}
          size="lg"
          footer={
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setPrintRx(null)}>
                Close Preview
              </button>
              <button
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <Printer size={15} />
                <span>Print Official Slip</span>
              </button>
            </div>
          }
        >
          <div style={{ padding: "16px", backgroundColor: "#ffffff", borderRadius: "14px" }}>
            {/* Header */}
            <div
              style={{
                borderBottom: "2px solid #7C3AED",
                paddingBottom: "14px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#4C1D95", margin: 0 }}>
                  LIORA HOSPITALS
                </h2>
                <div style={{ fontSize: "0.8rem", color: "#5B21B6", fontWeight: 600 }}>
                  Super-Speciality Healthcare & Research Institute
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6B6472" }}>
                  NABH Accredited • Bengaluru, Karnataka
                </div>
              </div>

              <div style={{ textAlign: "right", fontSize: "0.8rem" }}>
                <div style={{ fontWeight: 700, color: "#2D2438" }}>{printRx.doctorName}</div>
                <div style={{ color: "#7C3AED", fontWeight: 600 }}>{printRx.doctorDepartment}</div>
                <div style={{ color: "#6B6472" }}>ID: {printRx.doctorId}</div>
              </div>
            </div>

            {/* Patient & Date Strip */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                backgroundColor: "#FAF5FF",
                borderRadius: "10px",
                border: "1px solid #E9D5FF",
                marginBottom: "20px",
                fontSize: "0.85rem"
              }}
            >
              <div>
                <strong style={{ color: "#4C1D95" }}>Patient: </strong> {printRx.patientName} ({printRx.patientId})
              </div>
              <div>
                <strong style={{ color: "#4C1D95" }}>Prescription No: </strong> {printRx.prescriptionId}
              </div>
              <div>
                <strong style={{ color: "#4C1D95" }}>Date: </strong> {printRx.date}
              </div>
            </div>

            {/* Rx Symbol */}
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#7C3AED", marginBottom: 12 }}>
              ℞
            </div>

            {/* Medicines List */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E9D5FF", textAlign: "left", backgroundColor: "#FAF5FF" }}>
                  <th style={{ padding: "8px 10px", color: "#5B21B6" }}>#</th>
                  <th style={{ padding: "8px 10px", color: "#5B21B6" }}>Medication & Formulation</th>
                  <th style={{ padding: "8px 10px", color: "#5B21B6" }}>Dosage</th>
                  <th style={{ padding: "8px 10px", color: "#5B21B6" }}>Frequency</th>
                  <th style={{ padding: "8px 10px", color: "#5B21B6" }}>Duration</th>
                  <th style={{ padding: "8px 10px", color: "#5B21B6" }}>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {printRx.medicines?.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #F5EEFF" }}>
                    <td style={{ padding: "10px", color: "#6B6472" }}>{idx + 1}</td>
                    <td style={{ padding: "10px", fontWeight: 700, color: "#4C1D95" }}>{m.name}</td>
                    <td style={{ padding: "10px", color: "#2D2438" }}>{m.dosage}</td>
                    <td style={{ padding: "10px", color: "#2D2438" }}>{m.frequency}</td>
                    <td style={{ padding: "10px", color: "#2D2438" }}>{m.duration}</td>
                    <td style={{ padding: "10px", color: "#6B6472" }}>{m.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {printRx.generalAdvice && (
              <div style={{ marginBottom: "20px", fontSize: "0.85rem", color: "#6B6472" }}>
                <strong style={{ color: "#4C1D95" }}>Clinical Advice:</strong> {printRx.generalAdvice}
              </div>
            )}

            {printRx.followUpDate && (
              <div style={{ marginBottom: "30px", fontSize: "0.85rem", color: "#059669", fontWeight: 700 }}>
                Next Follow-up Consultation: {printRx.followUpDate}
              </div>
            )}

            {/* Doctor Signature Block */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 40 }}>
              <div style={{ textAlign: "center", width: 220, borderTop: "1px solid #E9D5FF", paddingTop: 8 }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#4C1D95" }}>{printRx.doctorName}</div>
                <div style={{ fontSize: "0.75rem", color: "#8B5CF6" }}>Digital Signature Authenticated</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Prescriptions;

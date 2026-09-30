import React, { useState, useEffect } from "react";
import Modal from "../components/Modal.jsx";
import Badge from "../components/Badge.jsx";
import { patientApi } from "../api/client.js";
import {
  User,
  Heart,
  Calendar,
  AlertTriangle,
  Pill,
  FileText,
  Share2,
  Clock,
  Phone,
  Mail,
  ShieldAlert
} from "lucide-react";

export const PatientDetailModal = ({
  isOpen,
  onClose,
  patientId,
  onStartConsultation,
  onWritePrescription,
  onReferPatient
}) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isOpen && patientId) {
      loadPatientDetails();
    }
  }, [isOpen, patientId]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);
      const res = await patientApi.getById(patientId);
      if (res.success) {
        setPatientData(res.patient);
      }
    } catch (err) {
      console.error("Error loading patient details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patientData ? `Medical Dossier: ${patientData.name} (${patientData.patientId})` : "Patient Clinical Records"}
      size="lg"
      footer={
        <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.775rem", color: "#64748B" }}>
            Hospital Record • Liora Health Information Network
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose();
                if (onReferPatient) onReferPatient(patientData);
              }}
            >
              <Share2 size={14} />
              <span>Refer Specialist</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose();
                if (onWritePrescription) onWritePrescription(patientData);
              }}
            >
              <Pill size={14} />
              <span>Prescribe</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                if (onStartConsultation) onStartConsultation(patientData);
              }}
            >
              <FileText size={14} />
              <span>Consultation Note</span>
            </button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
          Loading complete patient clinical dossier...
        </div>
      ) : !patientData ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#BE123C" }}>
          Patient clinical dossier could not be retrieved.
        </div>
      ) : (
        <div>
          {/* Top Patient Summary Banner */}
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "#FAF5FF",
              border: "1px solid #E9D5FF",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  backgroundColor: "#7C3AED",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)"
                }}
              >
                {patientData.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#4C1D95" }}>
                  {patientData.name}
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: "0.8rem", color: "#64748B", marginTop: 2 }}>
                  <span>{patientData.age} Years</span>
                  <span>•</span>
                  <span>{patientData.gender}</span>
                  <span>•</span>
                  <span style={{ fontWeight: 800, color: "#BE123C" }}>Blood: {patientData.bloodGroup}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span className="badge badge-normal" style={{ fontSize: "0.8rem" }}>
                {patientData.patientId}
              </span>
              <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 4 }}>
                Registered: {new Date(patientData.registeredAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              borderBottom: "1px solid #E9D5FF",
              marginBottom: 20
            }}
          >
            {[
              { id: "overview", label: "Patient & Medical Profile" },
              { id: "history", label: `Visit History (${patientData.visitHistory?.length || 0})` },
              { id: "prescriptions", label: `Prescriptions (${patientData.prescriptions?.length || 0})` },
              { id: "upcoming", label: `Upcoming Appointments (${patientData.upcomingAppointments?.length || 0})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 14px",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "2px solid #7C3AED" : "2px solid transparent",
                  color: activeTab === tab.id ? "#5B21B6" : "#64748B",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  marginBottom: -1,
                  transition: "all 0.15s ease"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Medical Information */}
              <div
                style={{
                  border: "1px solid #E9D5FF",
                  borderRadius: "16px",
                  padding: "18px",
                  backgroundColor: "#FFFFFF"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Heart size={18} color="#7C3AED" />
                  <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#4C1D95" }}>Medical Information</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>CURRENT CONDITION</label>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1E293B", marginTop: 2 }}>
                      {patientData.currentCondition || "None reported"}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#BE123C", fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                      <AlertTriangle size={13} />
                      KNOWN ALLERGIES
                    </label>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: patientData.allergies?.toLowerCase().includes("none") ? "#64748B" : "#BE123C",
                        marginTop: 2,
                        backgroundColor: patientData.allergies?.toLowerCase().includes("none") ? "transparent" : "#FFF1F2",
                        padding: patientData.allergies?.toLowerCase().includes("none") ? 0 : "4px 8px",
                        borderRadius: "6px"
                      }}
                    >
                      {patientData.allergies || "No documented drug allergies"}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>EXISTING CONDITIONS</label>
                    <div style={{ fontSize: "0.85rem", color: "#1E293B", marginTop: 2 }}>
                      {patientData.existingConditions || "None"}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>PREVIOUS DIAGNOSIS</label>
                    <div style={{ fontSize: "0.85rem", color: "#1E293B", marginTop: 2 }}>
                      {patientData.previousDiagnosis || "None recorded"}
                    </div>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>CURRENT ACTIVE MEDICATIONS</label>
                    <div style={{ fontSize: "0.85rem", color: "#1E293B", marginTop: 2, backgroundColor: "#FAF5FF", padding: "8px 12px", borderRadius: "10px", border: "1px solid #E9D5FF" }}>
                      {patientData.currentMedications || "None"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Information & Demographics */}
              <div
                style={{
                  border: "1px solid #E9D5FF",
                  borderRadius: "16px",
                  padding: "18px",
                  backgroundColor: "#FFFFFF"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <User size={18} color="#7C3AED" />
                  <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#4C1D95" }}>Demographics & Contact Information</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>CONTACT PHONE</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", marginTop: 2, color: "#1E293B" }}>
                      <Phone size={14} color="#7C3AED" />
                      <span>{patientData.phone}</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>EMAIL ADDRESS</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", marginTop: 2, color: "#1E293B" }}>
                      <Mail size={14} color="#7C3AED" />
                      <span>{patientData.email}</span>
                    </div>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>EMERGENCY CONTACT</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", marginTop: 2, color: "#BE123C", fontWeight: 700 }}>
                      <ShieldAlert size={14} />
                      <span>{patientData.emergencyContact}</span>
                    </div>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>RESIDENTIAL ADDRESS</label>
                    <div style={{ fontSize: "0.85rem", color: "#1E293B", marginTop: 2 }}>
                      {patientData.address || "Bengaluru, Karnataka"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Visit History */}
          {activeTab === "history" && (
            <div>
              {patientData.visitHistory?.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#64748B" }}>
                  No previous consultation history recorded.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {patientData.visitHistory?.map((visit, index) => (
                    <div
                      key={visit.id || index}
                      style={{
                        padding: "16px",
                        border: "1px solid #E9D5FF",
                        borderRadius: "14px",
                        backgroundColor: "#FFFFFF"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#4C1D95" }}>{visit.date}</span>
                          <span className="badge badge-normal">{visit.department}</span>
                          <span className="badge badge-scheduled">{visit.type}</span>
                        </div>
                        <span style={{ fontSize: "0.775rem", color: "#64748B", fontWeight: 600 }}>
                          Doctor: {visit.doctorName}
                        </span>
                      </div>

                      <div style={{ marginTop: 6 }}>
                        <strong style={{ fontSize: "0.825rem", color: "#4C1D95" }}>Diagnosis: </strong>
                        <span style={{ fontSize: "0.825rem", color: "#1E293B" }}>{visit.diagnosis}</span>
                      </div>

                      {visit.treatmentPlan && (
                        <div style={{ marginTop: 6, fontSize: "0.8rem", color: "#64748B", whiteSpace: "pre-line", backgroundColor: "#FAF5FF", padding: "8px 12px", borderRadius: "8px", border: "1px solid #E9D5FF" }}>
                          <strong style={{ color: "#4C1D95" }}>Treatment Plan:</strong> {visit.treatmentPlan}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Prescriptions */}
          {activeTab === "prescriptions" && (
            <div>
              {patientData.prescriptions?.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#64748B" }}>
                  No prior prescriptions documented for this patient.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {patientData.prescriptions?.map((rx) => (
                    <div
                      key={rx.id}
                      style={{
                        padding: "16px",
                        border: "1px solid #E9D5FF",
                        borderRadius: "14px",
                        backgroundColor: "#FFFFFF"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#7C3AED" }}>{rx.prescriptionId}</span>
                          <span style={{ fontSize: "0.8rem", color: "#64748B", marginLeft: 8 }}>Issued: {rx.date}</span>
                        </div>
                        <span style={{ fontSize: "0.775rem", color: "#64748B" }}>By: {rx.doctorName}</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                        {rx.medicines?.map((m, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                              backgroundColor: "#FAF5FF",
                              borderRadius: "8px",
                              fontSize: "0.825rem",
                              border: "1px solid #E9D5FF"
                            }}
                          >
                            <span style={{ fontWeight: 700, color: "#1E293B" }}>{m.name} ({m.dosage})</span>
                            <div style={{ display: "flex", gap: 14, color: "#64748B", fontSize: "0.775rem" }}>
                              <span>Freq: {m.frequency}</span>
                              <span>Duration: {m.duration}</span>
                              <span>{m.instructions}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {rx.generalAdvice && (
                        <div style={{ fontSize: "0.775rem", color: "#64748B", marginTop: 8, fontStyle: "italic" }}>
                          Advice: {rx.generalAdvice}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Upcoming Appointments */}
          {activeTab === "upcoming" && (
            <div>
              {patientData.upcomingAppointments?.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "#64748B" }}>
                  No future appointments scheduled for this patient.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {patientData.upcomingAppointments?.map((apt) => (
                    <div
                      key={apt.id}
                      style={{
                        padding: "14px 16px",
                        border: "1px solid #E9D5FF",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#FFFFFF"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Calendar size={18} color="#7C3AED" />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#4C1D95" }}>
                            {apt.date} at {apt.time}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                            {apt.department} • {apt.appointmentType}
                          </div>
                        </div>
                      </div>
                      <Badge status={apt.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PatientDetailModal;

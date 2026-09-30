import React, { useState, useEffect } from "react";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { Search, UserCheck, CalendarCheck, FileText, Pill, Share2 } from "lucide-react";
import { patientApi, appointmentApi } from "../api/client.js";

export const Patients = ({
  onSelectPatient,
  onStartConsultation,
  onWritePrescription,
  onReferPatient
}) => {
  const [activeTab, setActiveTab] = useState("today"); // "today" or "all"
  const [patients, setPatients] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allPatRes, todayAptRes] = await Promise.all([
        patientApi.getAll(),
        appointmentApi.getToday()
      ]);

      if (allPatRes.success) setPatients(allPatRes.patients || []);
      if (todayAptRes.success) setTodayAppointments(todayAptRes.appointments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Today's Patients
  const filteredTodayPatients = todayAppointments.filter((apt) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      apt.patientName.toLowerCase().includes(q) ||
      apt.patientId.toLowerCase().includes(q) ||
      apt.department.toLowerCase().includes(q) ||
      apt.reasonForVisit.toLowerCase().includes(q)
    );
  });

  // Filtered All Patients
  const filteredAllPatients = patients.filter((pat) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      pat.name.toLowerCase().includes(q) ||
      pat.patientId.toLowerCase().includes(q) ||
      (pat.currentCondition && pat.currentCondition.toLowerCase().includes(q)) ||
      (pat.phone && pat.phone.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page Title & Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95" }}>
            Patient Management & Clinical Records
          </h2>
          <p style={{ fontSize: "0.825rem", color: "#64748B", margin: "4px 0 0" }}>
            Review inpatient and outpatient demographic dossiers, medical history, and clinical appointments.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", width: 320 }}>
          <Search
            size={16}
            color="#8B5CF6"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by patient name, ID, diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs: Today's Patients vs All My Patients */}
      <div
        style={{
          display: "flex",
          gap: 10,
          borderBottom: "1px solid #E9D5FF",
          paddingBottom: 2
        }}
      >
        <button
          onClick={() => setActiveTab("today")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "today" ? "2px solid #7C3AED" : "2px solid transparent",
            color: activeTab === "today" ? "#5B21B6" : "#64748B",
            fontWeight: activeTab === "today" ? 700 : 500,
            fontSize: "0.92rem",
            cursor: "pointer",
            marginBottom: -3,
            transition: "all 0.2s ease"
          }}
        >
          <CalendarCheck size={16} color={activeTab === "today" ? "#7C3AED" : "currentColor"} />
          <span>Today's Patients ({todayAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("all")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "all" ? "2px solid #7C3AED" : "2px solid transparent",
            color: activeTab === "all" ? "#5B21B6" : "#64748B",
            fontWeight: activeTab === "all" ? 700 : 500,
            fontSize: "0.92rem",
            cursor: "pointer",
            marginBottom: -3,
            transition: "all 0.2s ease"
          }}
        >
          <UserCheck size={16} color={activeTab === "all" ? "#7C3AED" : "currentColor"} />
          <span>All Registered Patients ({patients.length})</span>
        </button>
      </div>

      {/* Content for Today's Patients */}
      {activeTab === "today" && (
        <div className="table-container">
          {filteredTodayPatients.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No patients found for today"
              message="No consultations scheduled matching the search criteria."
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Patient ID</th>
                  <th>Appointment Time</th>
                  <th>Department</th>
                  <th>Reason for Visit</th>
                  <th>Appointment Status</th>
                  <th>Consultation</th>
                  <th style={{ textAlign: "right" }}>Clinical Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTodayPatients.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <div
                        onClick={() => onSelectPatient(apt.patientId)}
                        style={{
                          fontWeight: 700,
                          color: "#4C1D95",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontSize: "0.88rem"
                        }}
                      >
                        {apt.patientName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                        {apt.appointmentType}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-normal">{apt.patientId}</span>
                    </td>
                    <td>
                      <strong style={{ color: "#1E293B" }}>{apt.time}</strong>
                    </td>
                    <td>{apt.department}</td>
                    <td style={{ maxWidth: 220, color: "#64748B" }}>
                      {apt.reasonForVisit}
                    </td>
                    <td>
                      <Badge status={apt.status} />
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: apt.consultationStatus === "Completed" ? "#15803D" : "#B45309"
                        }}
                      >
                        {apt.consultationStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-sm btn-primary"
                          title="Open Consultation Note"
                          onClick={() => onStartConsultation({ patientId: apt.patientId, appointmentId: apt.id })}
                        >
                          <FileText size={13} />
                          <span>Note</span>
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          title="Write Prescription"
                          onClick={() => onWritePrescription({ patientId: apt.patientId, name: apt.patientName })}
                        >
                          <Pill size={13} />
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          title="Refer to Specialist"
                          onClick={() => onReferPatient({ patientId: apt.patientId, name: apt.patientName })}
                        >
                          <Share2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Content for All Patients */}
      {activeTab === "all" && (
        <div className="table-container">
          {filteredAllPatients.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No patients match the filter"
              message="Try searching with a different patient name or ID."
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Patient ID</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Current Condition</th>
                  <th>Known Allergies</th>
                  <th>Contact</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllPatients.map((pat) => (
                  <tr key={pat.id}>
                    <td>
                      <div
                        onClick={() => onSelectPatient(pat.patientId)}
                        style={{
                          fontWeight: 700,
                          color: "#4C1D95",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontSize: "0.88rem"
                        }}
                      >
                        {pat.name}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-normal">{pat.patientId}</span>
                    </td>
                    <td>
                      {pat.age} yrs • {pat.gender}
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: "#BE123C" }}>{pat.bloodGroup}</span>
                    </td>
                    <td style={{ maxWidth: 240, color: "#64748B" }}>
                      {pat.currentCondition}
                    </td>
                    <td>
                      <span
                        style={{
                          color: pat.allergies?.toLowerCase().includes("none") ? "#64748B" : "#BE123C",
                          fontWeight: pat.allergies?.toLowerCase().includes("none") ? 500 : 700
                        }}
                      >
                        {pat.allergies}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                        <div>{pat.phone}</div>
                        <div>{pat.email}</div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onSelectPatient(pat.patientId)}
                        >
                          View Dossier
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => onReferPatient(pat)}
                        >
                          Refer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Patients;

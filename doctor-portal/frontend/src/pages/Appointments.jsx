import React, { useState, useEffect } from "react";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  Pill,
  Share2,
  AlertCircle
} from "lucide-react";
import { appointmentApi } from "../api/client.js";

export const Appointments = ({
  onSelectPatient,
  onStartConsultation,
  onWritePrescription,
  onReferPatient
}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentApi.getAll({ status: statusFilter });
      if (res.success) {
        setAppointments(res.appointments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await appointmentApi.updateStatus(id, newStatus);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus, consultationStatus: res.appointment.consultationStatus } : a))
        );
      }
    } catch (err) {
      alert(err.message || "Failed to update appointment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      apt.patientName.toLowerCase().includes(q) ||
      apt.patientId.toLowerCase().includes(q) ||
      apt.appointmentId.toLowerCase().includes(q) ||
      apt.reasonForVisit.toLowerCase().includes(q)
    );
  });

  const statuses = ["All", "Scheduled", "Waiting", "In Consultation", "Completed", "Cancelled", "No Show"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header and Controls */}
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
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
            Today's Appointments Management
          </h2>
          <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
            Track patient waiting queue, conduct live consultations, and advance consultation statuses.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", width: 260 }}>
            <Search
              size={15}
              color="#8B5CF6"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 34, fontSize: "0.825rem", backgroundColor: "#FAF5FF", borderColor: "#E9D5FF" }}
              placeholder="Search patient, ID, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          backgroundColor: "#ffffff",
          padding: "6px",
          borderRadius: "14px",
          border: "1px solid #E9D5FF"
        }}
      >
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: "6px 14px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: statusFilter === st ? "#7C3AED" : "transparent",
              color: statusFilter === st ? "#ffffff" : "#6B6472",
              fontWeight: statusFilter === st ? 700 : 500,
              fontSize: "0.825rem",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Appointments List / Table */}
      <div className="table-container">
        {filteredAppointments.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No appointments match the criteria"
            message="No consultation records were found under this status filter."
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient Details</th>
                <th>Time & Date</th>
                <th>Department</th>
                <th>Consultation Type</th>
                <th>Status</th>
                <th>Advance Workflow</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#5B21B6" }}>
                      {apt.appointmentId}
                    </span>
                  </td>
                  <td>
                    <div
                      onClick={() => onSelectPatient(apt.patientId)}
                      style={{
                        fontWeight: 700,
                        color: "#5B21B6",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: "0.875rem"
                      }}
                    >
                      {apt.patientName}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6B6472" }}>
                      ID: {apt.patientId} • {apt.reasonForVisit}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "#2D2438" }}>{apt.time}</div>
                    <div style={{ fontSize: "0.725rem", color: "#6B6472" }}>{apt.date}</div>
                  </td>
                  <td>{apt.department}</td>
                  <td>
                    <span className="badge badge-normal">{apt.appointmentType}</span>
                  </td>
                  <td>
                    <Badge status={apt.status} />
                  </td>
                  <td>
                    {/* Status Advance Controls */}
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {apt.status === "Scheduled" && (
                        <button
                          disabled={updatingId === apt.id}
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleUpdateStatus(apt.id, "Waiting")}
                          title="Mark patient as arrived at triage/waiting lounge"
                        >
                          Mark Waiting
                        </button>
                      )}
                      {apt.status === "Waiting" && (
                        <button
                          disabled={updatingId === apt.id}
                          className="btn btn-sm btn-primary"
                          onClick={() => handleUpdateStatus(apt.id, "In Consultation")}
                          title="Call patient into cabin and begin active consultation"
                        >
                          Start Consultation
                        </button>
                      )}
                      {apt.status === "In Consultation" && (
                        <button
                          disabled={updatingId === apt.id}
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            onStartConsultation({ patientId: apt.patientId, appointmentId: apt.id });
                          }}
                          title="Finish consultation and save notes"
                        >
                          Record Notes & Complete
                        </button>
                      )}
                      {apt.status === "Completed" && (
                        <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>
                          ✓ Completed
                        </span>
                      )}
                      {["Cancelled", "No Show"].includes(apt.status) && (
                        <span style={{ fontSize: "0.75rem", color: "#6B6472" }}>
                          Closed
                        </span>
                      )}

                      {/* Dropdown status changer for custom status */}
                      <select
                        style={{
                          fontSize: "0.725rem",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          border: "1px solid #E9D5FF",
                          backgroundColor: "#FAF5FF",
                          color: "#4C1D95",
                          fontWeight: 600
                        }}
                        value={apt.status}
                        onChange={(e) => handleUpdateStatus(apt.id, e.target.value)}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Waiting">Waiting</option>
                        <option value="In Consultation">In Consultation</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No Show">No Show</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => onStartConsultation({ patientId: apt.patientId, appointmentId: apt.id })}
                        title="Add Consultation Note"
                      >
                        <FileText size={13} />
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => onWritePrescription({ patientId: apt.patientId, name: apt.patientName })}
                        title="Add Prescription"
                      >
                        <Pill size={13} />
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => onReferPatient({ patientId: apt.patientId, name: apt.patientName })}
                        title="Refer Specialist"
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
    </div>
  );
};

export default Appointments;

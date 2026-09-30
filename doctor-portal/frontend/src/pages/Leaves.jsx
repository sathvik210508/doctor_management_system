import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard.jsx";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Modal from "../components/Modal.jsx";
import {
  CalendarOff,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { leaveApi } from "../api/client.js";

export const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    reason: ""
  });

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveApi.getLeaves();
      if (res.success) {
        setLeaves(res.leaves || []);
        setCounts(res.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setError("Please provide start date, end date, and justification reason.");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await leaveApi.apply(formData);
      if (res.success) {
        setSuccessMsg(res.message);
        setShowApplyModal(false);
        setFormData({ leaveType: "Casual Leave", startDate: "", endDate: "", reason: "" });
        loadLeaves();
      }
    } catch (err) {
      setError(err.message || "Failed to submit leave application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header & Apply Button */}
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
            Leave Management & Absence Requests
          </h2>
          <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
            Submit formal duty absence requests and track medical superintendent approval status.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
          <Plus size={16} />
          <span>Apply for Leave</span>
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

      {/* Leave Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard
          title="Total Applications"
          value={counts.total}
          subtitle="All-time leave requests"
          icon={CalendarOff}
          color="primary"
        />
        <StatCard
          title="Pending Approval"
          value={counts.pending}
          subtitle="Awaiting administrative review"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved Leaves"
          value={counts.approved}
          subtitle="Authorized by Medical Board"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Rejected Requests"
          value={counts.rejected}
          subtitle="Non-sanctioned applications"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Leave History Table */}
      <div className="card" style={{ padding: 0, border: "1px solid #E9D5FF", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E9D5FF", backgroundColor: "#FAF5FF" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#4C1D95" }}>
            Leave Application History & Audit Trail
          </h3>
        </div>

        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          {leaves.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="No leave requests filed"
              message="Click 'Apply for Leave' to submit a new absence request."
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration (From – To)</th>
                  <th>Reason / Justification</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Reviewed By</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong style={{ color: "#2D2438" }}>{l.leaveType}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#5B21B6" }}>
                        {l.startDate} → {l.endDate}
                      </span>
                    </td>
                    <td style={{ maxWidth: 280, color: "#6B6472" }}>
                      {l.reason}
                    </td>
                    <td style={{ fontSize: "0.775rem", color: "#6B6472" }}>
                      {new Date(l.appliedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Badge status={l.status} />
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#6B6472" }}>
                      {l.reviewedBy ? (
                        <div>
                          <div style={{ color: "#2D2438", fontWeight: 600 }}>{l.reviewedBy}</div>
                          {l.reviewNotes && <div style={{ fontSize: "0.72rem", color: "#6B6472", fontStyle: "italic" }}>{l.reviewNotes}</div>}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Submit Clinical Leave Request"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleApply} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Application"}
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

        <form onSubmit={handleApply}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select
              className="form-select"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Justification</label>
            <textarea
              className="form-textarea"
              placeholder="State clinical reason, conference details, or personal circumstances..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;

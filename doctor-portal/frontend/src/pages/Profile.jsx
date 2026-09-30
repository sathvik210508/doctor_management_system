import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  User,
  Mail,
  Phone,
  Building,
  Award,
  Clock,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock
} from "lucide-react";

export const Profile = () => {
  const { doctor, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: doctor?.name || "",
    phone: doctor?.phone || "",
    email: doctor?.email || "",
    specialization: doctor?.specialization || "",
    department: doctor?.department || "",
    qualification: doctor?.qualification || "",
    experienceYears: doctor?.experienceYears || 0,
    cabin: doctor?.cabin || "",
    bio: doctor?.bio || "",
    avatar: doctor?.avatar || ""
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");
      await updateProfile(formData);
      setSuccessMsg("Doctor profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 880 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
          Doctor Practitioner Profile
        </h2>
        <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
          Hospital clinical credentials, institutional room allocation, contact data, and professional summary.
        </p>
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

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: "#FFF1F2",
            border: "1px solid #FECDD3",
            color: "#9F1239",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Card Banner */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "24px",
          border: "1px solid #E9D5FF",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #ffffff 0%, #FAF5FF 100%)",
          boxShadow: "0 4px 20px rgba(76, 29, 149, 0.05)"
        }}
      >
        <img
          src={formData.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=240"}
          alt={formData.name}
          style={{
            width: 96,
            height: 96,
            borderRadius: "9999px",
            objectFit: "cover",
            border: "3px solid #7C3AED",
            boxShadow: "0 4px 16px rgba(124, 58, 237, 0.2)"
          }}
        />

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#4C1D95", margin: 0 }}>
              {formData.name}
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: "9999px",
                backgroundColor: "#FAF5FF",
                border: "1px solid #E9D5FF",
                color: "#5B21B6",
                fontSize: "0.75rem",
                fontWeight: 700
              }}
            >
              <Lock size={12} color="#7C3AED" />
              {doctor?.doctorId} (Locked)
            </span>
          </div>

          <div style={{ fontSize: "0.9rem", color: "#7C3AED", fontWeight: 600, marginTop: 4 }}>
            {formData.specialization} • {formData.department}
          </div>

          <div style={{ fontSize: "0.8rem", color: "#6B6472", marginTop: 6, display: "flex", gap: 16 }}>
            <span>{formData.qualification}</span>
            <span>•</span>
            <span>{formData.experienceYears} Years Clinical Experience</span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 20, border: "1px solid #E9D5FF", borderRadius: "16px", boxShadow: "0 4px 18px rgba(76, 29, 149, 0.04)" }}>
        <div className="card-header" style={{ borderBottom: "1px solid #E9D5FF" }}>
          <div className="card-title" style={{ color: "#4C1D95" }}>
            <User size={18} color="#7C3AED" />
            <span>Edit Profile & Clinical Details</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#6B6472" }}>
            Institutional ID is protected by hospital administration
          </span>
        </div>

        {/* Read-Only Doctor ID Notice */}
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: "#FAF5FF",
            border: "1px solid #E9D5FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <strong style={{ fontSize: "0.8rem", color: "#4C1D95" }}>Doctor Hospital ID:</strong>
            <span style={{ marginLeft: 8, fontWeight: 700, color: "#5B21B6" }}>{doctor?.doctorId}</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#6B6472", display: "flex", alignItems: "center", gap: 4 }}>
            <Lock size={12} color="#7C3AED" /> Institutional Primary Key (Immutable)
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Doctor Full Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Specialization</label>
            <input
              type="text"
              className="form-input"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Qualifications & Fellowships</label>
            <input
              type="text"
              className="form-input"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Years of Experience</label>
            <input
              type="number"
              className="form-input"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hospital Cabin / Room Allocation</label>
            <input
              type="text"
              className="form-input"
              value={formData.cabin}
              onChange={(e) => setFormData({ ...formData, cabin: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Institutional Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Profile Avatar Image URL</label>
          <input
            type="text"
            className="form-input"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Professional Summary & Clinical Interests</label>
          <textarea
            className="form-textarea"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: "10px 24px", fontSize: "0.9rem" }}
          >
            <Save size={16} />
            <span>{saving ? "Saving Changes..." : "Save Profile Information"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

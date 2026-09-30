import React, { useState, useEffect } from "react";
import {
  CalendarClock,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { availabilityApi } from "../api/client.js";

export const Availability = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [availability, setAvailability] = useState({
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    schedule: {
      Monday: { startTime: "09:00", endTime: "16:30", isAvailable: true },
      Tuesday: { startTime: "09:00", endTime: "16:30", isAvailable: true },
      Wednesday: { startTime: "09:00", endTime: "13:30", isAvailable: true },
      Thursday: { startTime: "09:00", endTime: "16:30", isAvailable: true },
      Friday: { startTime: "09:00", endTime: "16:30", isAvailable: true },
      Saturday: { startTime: "09:00", endTime: "13:00", isAvailable: true },
      Sunday: { startTime: "10:00", endTime: "12:00", isAvailable: false }
    },
    breakTime: "01:00 PM – 02:00 PM",
    consultationDuration: "20 mins",
    maxPatientsPerSlot: 1,
    emergencyOnCall: true
  });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const res = await availabilityApi.get();
      if (res.success && res.availability) {
        setAvailability(res.availability);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setAvailability((prev) => {
      const currentSchedule = prev.schedule[day] || { startTime: "09:00", endTime: "16:30", isAvailable: false };
      const updatedAvailable = !currentSchedule.isAvailable;

      const newSchedule = {
        ...prev.schedule,
        [day]: { ...currentSchedule, isAvailable: updatedAvailable }
      };

      const newWorkingDays = updatedAvailable
        ? [...new Set([...prev.workingDays, day])]
        : prev.workingDays.filter((d) => d !== day);

      return {
        ...prev,
        schedule: newSchedule,
        workingDays: newWorkingDays
      };
    });
  };

  const handleTimeChange = (day, field, val) => {
    setAvailability((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: val
        }
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");
      const res = await availabilityApi.update(availability);
      if (res.success) {
        setSuccessMsg(res.message);
      }
    } catch (err) {
      setError(err.message || "Failed to update availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
          Clinical Availability & Practice Hours
        </h2>
        <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
          Configure your working days, morning and evening OPD consultation hours, and consultation slot intervals.
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

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Weekly Day-by-Day Schedule */}
        <div className="card" style={{ border: "1px solid #E9D5FF", borderRadius: "16px", boxShadow: "0 4px 18px rgba(76, 29, 149, 0.04)" }}>
          <div className="card-header" style={{ borderBottom: "1px solid #E9D5FF" }}>
            <div className="card-title" style={{ color: "#4C1D95" }}>
              <CalendarClock size={18} color="#7C3AED" />
              <span>Weekly OPD Consultation Schedule</span>
            </div>
            <span style={{ fontSize: "0.775rem", color: "#6B6472" }}>
              Toggle active clinic days
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {daysOfWeek.map((day) => {
              const dayConfig = availability.schedule?.[day] || {
                startTime: "09:00",
                endTime: "16:30",
                isAvailable: false
              };

              return (
                <div
                  key={day}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #E9D5FF",
                    backgroundColor: dayConfig.isAvailable ? "#ffffff" : "#FAF5FF"
                  }}
                >
                  {/* Left: Day & Toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 160 }}>
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={dayConfig.isAvailable}
                      onChange={() => handleDayToggle(day)}
                      style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#7C3AED" }}
                    />
                    <label
                      htmlFor={`day-${day}`}
                      style={{
                        fontWeight: dayConfig.isAvailable ? 700 : 500,
                        color: dayConfig.isAvailable ? "#4C1D95" : "#6B6472",
                        cursor: "pointer",
                        fontSize: "0.9rem"
                      }}
                    >
                      {day}
                    </label>
                  </div>

                  {/* Right: Time Range */}
                  {dayConfig.isAvailable ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "0.8rem", color: "#6B6472" }}>From:</span>
                      <input
                        type="time"
                        className="form-input"
                        style={{ width: 130, padding: "6px 10px", fontSize: "0.825rem", backgroundColor: "#FAF5FF", borderColor: "#E9D5FF" }}
                        value={dayConfig.startTime}
                        onChange={(e) => handleTimeChange(day, "startTime", e.target.value)}
                      />
                      <span style={{ fontSize: "0.8rem", color: "#6B6472" }}>To:</span>
                      <input
                        type="time"
                        className="form-input"
                        style={{ width: 130, padding: "6px 10px", fontSize: "0.825rem", backgroundColor: "#FAF5FF", borderColor: "#E9D5FF" }}
                        value={dayConfig.endTime}
                        onChange={(e) => handleTimeChange(day, "endTime", e.target.value)}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.825rem", color: "#6B6472", fontStyle: "italic" }}>
                      Clinic Closed / Non-Working Day
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Clinic Preferences */}
        <div className="card" style={{ border: "1px solid #E9D5FF", borderRadius: "16px", boxShadow: "0 4px 18px rgba(76, 29, 149, 0.04)" }}>
          <div className="card-header" style={{ borderBottom: "1px solid #E9D5FF" }}>
            <div className="card-title" style={{ color: "#4C1D95" }}>
              <Clock size={18} color="#7C3AED" />
              <span>Consultation Intervals & Break Timings</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Lunch & Hospital Ward Break Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 01:00 PM – 02:00 PM"
                value={availability.breakTime}
                onChange={(e) => setAvailability({ ...availability, breakTime: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Consultation Duration Per Slot</label>
              <select
                className="form-select"
                value={availability.consultationDuration}
                onChange={(e) => setAvailability({ ...availability, consultationDuration: e.target.value })}
              >
                <option value="15 mins">15 mins</option>
                <option value="20 mins">20 mins (Recommended)</option>
                <option value="30 mins">30 mins</option>
                <option value="45 mins">45 mins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: "10px 24px", fontSize: "0.925rem" }}
          >
            <Save size={16} />
            <span>{saving ? "Saving Changes..." : "Save Availability Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Availability;

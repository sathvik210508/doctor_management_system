import React from "react";

export const Badge = ({ status, variant, children, className = "" }) => {
  const normalized = (variant || status || "").toLowerCase().replace(/\s+/g, "-");

  let badgeClass = "badge-normal";
  if (["scheduled", "upcoming"].includes(normalized)) badgeClass = "badge-scheduled";
  if (["waiting", "pending"].includes(normalized)) badgeClass = "badge-waiting";
  if (["in-consultation", "in-progress"].includes(normalized)) badgeClass = "badge-in-consultation";
  if (["completed", "approved", "present"].includes(normalized)) badgeClass = "badge-completed";
  if (["cancelled", "rejected", "declined", "absent"].includes(normalized)) badgeClass = "badge-cancelled";
  if (["urgent", "emergency"].includes(normalized)) badgeClass = "badge-urgent";
  if (["important", "priority"].includes(normalized)) badgeClass = "badge-important";

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {children || status}
    </span>
  );
};

export default Badge;

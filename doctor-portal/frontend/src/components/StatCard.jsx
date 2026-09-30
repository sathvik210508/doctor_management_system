import React from "react";

export const StatCard = ({ title, value, subtitle, icon: Icon, badge, color = "primary", onClick }) => {
  const colorMap = {
    primary: { bg: "#FAF5FF", text: "#7C3AED", border: "#E9D5FF" },
    emerald: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    amber: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
    sky: { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
    rose: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div
      onClick={onClick}
      className={`card interactive-card ${onClick ? "clickable" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E9D5FF",
        borderRadius: "16px",
        padding: "1.3rem",
        boxShadow: "0 4px 15px rgba(139, 92, 246, 0.04)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {title}
          </span>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#4C1D95", marginTop: 4, fontFamily: "var(--font-family)" }}>
            {value}
          </div>
        </div>
        {Icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              backgroundColor: scheme.bg,
              color: scheme.text,
              border: `1px solid ${scheme.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Icon size={22} color={scheme.text} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, fontSize: "0.775rem" }}>
        {subtitle && <span style={{ color: "#64748B" }}>{subtitle}</span>}
        {badge && <span>{badge}</span>}
      </div>
    </div>
  );
};

export default StatCard;

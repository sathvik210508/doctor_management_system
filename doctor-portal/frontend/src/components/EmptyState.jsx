import React from "react";
import { FolderOpen } from "lucide-react";

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No records found",
  message = "There are no entries available to display right now.",
  action
}) => {
  return (
    <div
      style={{
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        border: "1px dashed #E9D5FF",
        borderRadius: "16px",
        margin: "16px 0"
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: "14px",
          backgroundColor: "#FAF5FF",
          border: "1px solid #E9D5FF",
          color: "#7C3AED",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16
        }}
      >
        <Icon size={26} color="#7C3AED" />
      </div>
      <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#4C1D95", marginBottom: 6 }}>
        {title}
      </h4>
      <p style={{ fontSize: "0.85rem", color: "#64748B", maxWidth: 380, marginBottom: action ? 20 : 0 }}>
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

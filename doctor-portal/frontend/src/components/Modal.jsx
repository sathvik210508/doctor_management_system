import React, { useEffect } from "react";
import { X } from "lucide-react";

export const Modal = ({ isOpen, onClose, title, children, size = "md", footer }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px"
      }}
    >
      <div
        className={`modal-dialog ${size === "lg" ? "modal-dialog-lg" : ""}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          border: "1px solid #E9D5FF",
          boxShadow: "0 16px 36px rgba(76, 29, 149, 0.16)",
          width: "100%",
          maxWidth: size === "lg" ? 880 : 660,
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative"
        }}
      >
        <div
          className="modal-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #E9D5FF",
            backgroundColor: "#FFFFFF"
          }}
        >
          <h3 className="modal-title" style={{ color: "#4C1D95", fontWeight: 800, margin: 0, fontSize: "1.15rem" }}>
            {title}
          </h3>
          <button
            className="modal-close-btn"
            onClick={onClose}
            title="Close"
            style={{
              background: "none",
              border: "none",
              color: "#64748B",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "24px" }}>
          {children}
        </div>

        {footer && (
          <div
            className="modal-footer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 12,
              padding: "16px 24px",
              borderTop: "1px solid #E9D5FF",
              backgroundColor: "#FAF5FF",
              borderRadius: "0 0 20px 20px"
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

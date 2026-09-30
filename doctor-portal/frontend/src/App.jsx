import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Patients from "./pages/Patients.jsx";
import PatientDetailModal from "./pages/PatientDetailModal.jsx";
import Appointments from "./pages/Appointments.jsx";
import Attendance from "./pages/Attendance.jsx";
import Leaves from "./pages/Leaves.jsx";
import Meetings from "./pages/Meetings.jsx";
import Announcements from "./pages/Announcements.jsx";
import Messages from "./pages/Messages.jsx";
import Referrals from "./pages/Referrals.jsx";
import Consultations from "./pages/Consultations.jsx";
import Prescriptions from "./pages/Prescriptions.jsx";
import Availability from "./pages/Availability.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";

const DoctorPortalApp = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [consultationPreFill, setConsultationPreFill] = useState(null);
  const [prescriptionPreFill, setPrescriptionPreFill] = useState(null);
  const [referralPreFill, setReferralPreFill] = useState(null);

  // Sync route from URL on initial mount and popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/^\/doctor\/?/, "").replace(/^\//, "");
      const validTabs = [
        "dashboard",
        "patients",
        "appointments",
        "attendance",
        "leaves",
        "meetings",
        "announcements",
        "messages",
        "referrals",
        "consultations",
        "prescriptions",
        "availability",
        "notifications",
        "profile",
        "settings"
      ];
      if (validTabs.includes(path)) {
        setActiveTab(path);
      }
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState({}, "", `/doctor/${tabId}`);
  };

  const handleOpenPatient = (patientId) => {
    setSelectedPatientId(patientId);
  };

  const handleStartConsultation = (data) => {
    setConsultationPreFill(data);
    handleSelectTab("consultations");
  };

  const handleWritePrescription = (data) => {
    setPrescriptionPreFill(data);
    handleSelectTab("prescriptions");
  };

  const handleReferPatient = (data) => {
    setReferralPreFill(data);
    handleSelectTab("referrals");
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-page)",
          fontFamily: "var(--font-heading)",
          fontSize: "1.1rem",
          color: "var(--primary-800)"
        }}
      >
        Initializing Liora Hospitals Doctor Portal...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={() => {
          handleSelectTab("dashboard");
        }}
      />
    );
  }

  return (
    <Layout activeTab={activeTab} onSelectTab={handleSelectTab}>
      {activeTab === "dashboard" && (
        <Dashboard
          onNavigate={handleSelectTab}
          onOpenPatient={handleOpenPatient}
          onOpenConsultation={handleStartConsultation}
          onOpenPrescription={handleWritePrescription}
          onOpenReferral={handleReferPatient}
        />
      )}

      {activeTab === "patients" && (
        <Patients
          onSelectPatient={handleOpenPatient}
          onStartConsultation={handleStartConsultation}
          onWritePrescription={handleWritePrescription}
          onReferPatient={handleReferPatient}
        />
      )}

      {activeTab === "appointments" && (
        <Appointments
          onSelectPatient={handleOpenPatient}
          onStartConsultation={handleStartConsultation}
          onWritePrescription={handleWritePrescription}
          onReferPatient={handleReferPatient}
        />
      )}

      {activeTab === "attendance" && <Attendance />}

      {activeTab === "leaves" && <Leaves />}

      {activeTab === "meetings" && <Meetings />}

      {activeTab === "announcements" && <Announcements />}

      {activeTab === "messages" && <Messages />}

      {activeTab === "referrals" && (
        <Referrals
          onSelectPatient={handleOpenPatient}
          initialReferralData={referralPreFill}
        />
      )}

      {activeTab === "consultations" && (
        <Consultations
          initialData={consultationPreFill}
          onSelectPatient={handleOpenPatient}
          onWritePrescription={handleWritePrescription}
        />
      )}

      {activeTab === "prescriptions" && (
        <Prescriptions
          initialData={prescriptionPreFill}
          onSelectPatient={handleOpenPatient}
        />
      )}

      {activeTab === "availability" && <Availability />}

      {activeTab === "notifications" && <Notifications onNavigate={handleSelectTab} />}

      {activeTab === "profile" && <Profile />}

      {activeTab === "settings" && <Settings />}

      {/* Global Patient Details Modal */}
      <PatientDetailModal
        isOpen={!!selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
        patientId={selectedPatientId}
        onStartConsultation={handleStartConsultation}
        onWritePrescription={handleWritePrescription}
        onReferPatient={handleReferPatient}
      />
    </Layout>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <DoctorPortalApp />
    </AuthProvider>
  );
};

export default App;

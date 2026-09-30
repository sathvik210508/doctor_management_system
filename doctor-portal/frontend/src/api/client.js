// HTTP client for Liora Hospitals Doctor Portal API
const BASE_URL = "http://localhost:5001/api";

const getToken = () => localStorage.getItem("liora_doctor_token");

export const api = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes("/auth/login")) {
        localStorage.removeItem("liora_doctor_token");
        localStorage.removeItem("liora_doctor_user");
        window.location.href = "/doctor/login?session_expired=true";
      }
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
};

// Auth APIs
export const authApi = {
  login: (doctorId, password) => api("/auth/login", { method: "POST", body: { doctorId, password } }),
  changePassword: (currentPassword, newPassword) =>
    api("/auth/change-password", { method: "PUT", body: { currentPassword, newPassword } })
};

// Doctor Profile APIs
export const doctorApi = {
  getMe: () => api("/doctors/me"),
  updateProfile: (data) => api("/doctors/profile", { method: "PUT", body: data }),
  getAllDoctors: () => api("/doctors")
};

// Patient APIs
export const patientApi = {
  getAll: (search = "", doctorOnly = false) =>
    api(`/patients?search=${encodeURIComponent(search)}&doctorOnly=${doctorOnly}`),
  getById: (id) => api(`/patients/${id}`)
};

// Appointment APIs
export const appointmentApi = {
  getToday: () => api("/appointments/today"),
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/appointments${q ? `?${q}` : ""}`);
  },
  updateStatus: (id, status, notes) =>
    api(`/appointments/${id}/status`, { method: "PATCH", body: { status, notes } })
};

// Attendance APIs
export const attendanceApi = {
  getToday: () => api("/attendance/today"),
  mark: (action) => api("/attendance", { method: "POST", body: { action } }),
  getHistory: () => api("/attendance/history")
};

// Leave APIs
export const leaveApi = {
  getLeaves: () => api("/leaves"),
  apply: (leaveData) => api("/leaves", { method: "POST", body: leaveData })
};

// Meeting APIs
export const meetingApi = {
  getMeetings: () => api("/meetings"),
  downloadICS: (id) => {
    window.open(`${BASE_URL}/meetings/${id}/calendar`, "_blank");
  }
};

// Announcement APIs
export const announcementApi = {
  getAnnouncements: () => api("/announcements"),
  markRead: (id) => api(`/announcements/${id}/read`, { method: "PATCH" })
};

// 1-to-1 Private Message APIs (Deterministic Conversation + E2EE)
export const messageApi = {
  getConversations: (options = {}) => api("/messages/conversations", options),
  getConversationMessages: (conversationId, options = {}) =>
    api(`/messages/conversations/${conversationId}`, options),
  getMessages: (conversationIdOrDoctorId, options = {}) =>
    api(`/messages/${conversationIdOrDoctorId}`, options),
  sendEncryptedMessage: ({ conversationId, recipientDoctorId, ciphertext, nonce, algorithm }, options = {}) =>
    api("/messages", {
      method: "POST",
      body: { conversationId, recipientDoctorId, ciphertext, nonce, algorithm },
      ...options
    }),
  getPublicKey: (doctorId, options = {}) => api(`/messages/keys/${doctorId}`, options),
  setPublicKey: (publicKey, options = {}) =>
    api("/messages/keys", { method: "POST", body: { publicKey }, ...options })
};

// Patient Referral APIs
export const referralApi = {
  getReferrals: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/referrals${q ? `?${q}` : ""}`);
  },
  createReferral: (referralData) => api("/referrals", { method: "POST", body: referralData }),
  updateStatus: (id, status, remarks) =>
    api(`/referrals/${id}/status`, { method: "PATCH", body: { status, remarks } })
};

// Consultation Notes APIs
export const consultationApi = {
  getConsultations: (patientId = "") =>
    api(`/consultations${patientId ? `?patientId=${patientId}` : ""}`),
  getPatientConsultations: (patientId) => api(`/consultations/patient/${patientId}`),
  create: (data) => api("/consultations", { method: "POST", body: data })
};

// Prescription APIs
export const prescriptionApi = {
  getPrescriptions: (patientId = "") =>
    api(`/prescriptions${patientId ? `?patientId=${patientId}` : ""}`),
  getPatientPrescriptions: (patientId) => api(`/prescriptions/patient/${patientId}`),
  create: (data) => api("/prescriptions", { method: "POST", body: data })
};

// Availability APIs
export const availabilityApi = {
  get: () => api("/availability"),
  update: (data) => api("/availability", { method: "PUT", body: data })
};

// Notification APIs
export const notificationApi = {
  getNotifications: () => api("/notifications"),
  markRead: (id) => api(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => api("/notifications/read-all", { method: "PATCH" })
};

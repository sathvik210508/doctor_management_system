import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, doctorApi } from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("liora_doctor_token");
    const storedDoctor = localStorage.getItem("liora_doctor_user");

    if (storedToken && storedDoctor) {
      try {
        setToken(storedToken);
        setDoctor(JSON.parse(storedDoctor));
        // Verify with backend to get fresh data
        doctorApi
          .getMe()
          .then((res) => {
            if (res.success && res.doctor) {
              setDoctor(res.doctor);
              localStorage.setItem("liora_doctor_user", JSON.stringify(res.doctor));
            }
          })
          .catch(() => {
            // If token invalid, clear
            localStorage.removeItem("liora_doctor_token");
            localStorage.removeItem("liora_doctor_user");
            setToken(null);
            setDoctor(null);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (err) {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (doctorId, password) => {
    const res = await authApi.login(doctorId, password);
    if (res.success && res.token && res.doctor) {
      localStorage.setItem("liora_doctor_token", res.token);
      localStorage.setItem("liora_doctor_user", JSON.stringify(res.doctor));
      setToken(res.token);
      setDoctor(res.doctor);
      return res;
    }
    throw new Error(res.message || "Authentication failed");
  };

  const logout = () => {
    localStorage.removeItem("liora_doctor_token");
    localStorage.removeItem("liora_doctor_user");
    setToken(null);
    setDoctor(null);
  };

  const updateProfile = async (profileData) => {
    const res = await doctorApi.updateProfile(profileData);
    if (res.success && res.doctor) {
      setDoctor(res.doctor);
      localStorage.setItem("liora_doctor_user", JSON.stringify(res.doctor));
      return res.doctor;
    }
    throw new Error(res.message || "Failed to update profile");
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await authApi.changePassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        doctor,
        token,
        isAuthenticated: !!token && !!doctor,
        isLoading,
        login,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

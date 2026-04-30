import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      }
    } catch {
      // Corrupted localStorage — clear it and start fresh
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await apiService.login({ username, password });

      const studentUser = {
        ...response.user,
        token: response.token,
        isAdmin: response.user.role === "admin" || response.user.isAdmin,
      };

      localStorage.setItem("user", JSON.stringify(studentUser));
      setUser(studentUser);

      // If the backend says this user is restricted, redirect immediately
      if (studentUser.isRestricted) {
        window.location.href = "/blocked";
        return;
      }

      return studentUser;
    } catch (error) {
      // Handle restricted account — blocked at login
      if (error.response?.data?.isRestricted || error.status === 403) {
        const reason = error.response?.data?.reason || "Violation of community guidelines";
        // Store minimal info for the blocked page to display the reason
        localStorage.setItem("user", JSON.stringify({ isRestricted: true, restrictionReason: reason }));
        window.location.href = "/blocked";
        return;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (username, password) => {
    try {
      setLoading(true);
      const response = await apiService.adminLogin({ username, password });

      if (!response.user.isAdmin && response.user.role !== "admin") {
        throw new Error("You do not have admin privileges");
      }

      const adminUser = {
        ...response.user,
        token: response.token,
        isAdmin: true,
      };

      localStorage.setItem("user", JSON.stringify(adminUser));
      setUser(adminUser);

      return adminUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.register(userData);

      const newUser = {
        ...response.user,
        token: response.token,
        isAdmin: false,
      };

      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);

      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

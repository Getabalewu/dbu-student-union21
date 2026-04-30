import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { apiService } from "../services/api";

const NotificationContext = createContext();

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    posts: 0,
    complaints: 0,
    clubs: 0,
    elections: 0,
  });
  const [lastSeen, setLastSeen] = useState(() => {
    try {
      const saved = localStorage.getItem("lastSeenNotifications");
      const parsed = saved ? JSON.parse(saved) : null;
      return (parsed && typeof parsed === 'object') ? parsed : {
        posts: Date.now(),
        complaints: Date.now(),
        clubs: Date.now(),
        elections: Date.now(),
      };
    } catch {
      return {
        posts: Date.now(),
        complaints: Date.now(),
        clubs: Date.now(),
        elections: Date.now(),
      };
    }
  });

  const [newItems, setNewItems] = useState({
    posts: [],
    complaints: [],
    clubs: [],
    elections: [],
  });

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const [postsData, complaintsData, clubsData, electionsData] = await Promise.all([
        apiService.getPosts().catch(() => ({ posts: [] })),
        apiService.getComplaints().catch(() => []),
        apiService.getClubs().catch(() => []),
        apiService.getElections().catch(() => ({ elections: [] })),
      ]);

      const posts = Array.isArray(postsData) ? postsData : (postsData.posts || []);
      const complaints = Array.isArray(complaintsData) ? complaintsData : [];
      const clubs = Array.isArray(clubsData) ? clubsData : [];
      const elections = Array.isArray(electionsData) ? electionsData : (electionsData.elections || []);

      const filteredPosts = posts.filter(p =>
        new Date(p.createdAt || p.date).getTime() > lastSeen.posts
      );

      const filteredComplaints = complaints.filter(c =>
        new Date(c.createdAt || c.submittedAt).getTime() > lastSeen.complaints
      );

      const filteredClubs = clubs.filter(c =>
        new Date(c.createdAt).getTime() > lastSeen.clubs
      );

      const filteredElections = elections.filter(e =>
        new Date(e.createdAt).getTime() > lastSeen.elections
      );

      // Role-based filtering
      const isAdmin = user.isAdmin || user.role === 'admin';

      if (isAdmin) {
        // Admins see new complaints and potentially club join requests 
        // For now, let's focus on complaints and new clubs/elections if they need to manage them
        setNotifications({
          posts: 0, // Admins don't need notifications for their own posts
          complaints: filteredComplaints.length,
          clubs: 0,
          elections: 0,
        });

        setNewItems({
          posts: [],
          complaints: filteredComplaints,
          clubs: [],
          elections: [],
        });
      } else {
        // Students see new posts, active/upcoming elections, and new clubs
        setNotifications({
          posts: filteredPosts.length,
          complaints: 0, // Students don't see all complaints
          clubs: filteredClubs.length,
          elections: filteredElections.length,
        });

        setNewItems({
          posts: filteredPosts,
          complaints: [],
          clubs: filteredClubs,
          elections: filteredElections,
        });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsSeen = (type) => {
    const newLastSeen = {
      ...lastSeen,
      [type]: Date.now(),
    };
    setLastSeen(newLastSeen);
    localStorage.setItem("lastSeenNotifications", JSON.stringify(newLastSeen));

    setNotifications(prev => ({
      ...prev,
      [type]: 0,
    }));

    setNewItems(prev => ({
      ...prev,
      [type]: [],
    }));
  };

  const value = {
    notifications,
    newItems,
    markAsSeen,
    refreshNotifications: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

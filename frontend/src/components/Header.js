"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  FiUser,
  FiMenu,
  FiX,
  FiSearch,
  FiBell,
  FiMessageCircle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useUser } from "@/context/UserContext";
import { fetchUnreadMessagesApi, markMessagesAsReadApi, isAuthenticated } from "@/utils/api";

const navLinks = [
  { name: "Home", href: "/dashboard/user/homepage" },
  { name: "Room", href: "/dashboard/user/rooms" },
  { name: "Messages", href: "/dashboard/user/messages" },
];

// Helper function to get correct avatar URL
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "/users/default-avatar.svg";
  
  // If it's already a full URL
  if (avatarPath.startsWith('http')) return avatarPath;
  
  // If it's a path from storage (avatars/filename.png)
  if (avatarPath.includes('avatars/')) {
    return `http://127.0.0.1:8000/storage/${avatarPath}`;
  }
  
  // If it's just the filename
  if (avatarPath && !avatarPath.includes('/')) {
    return `http://127.0.0.1:8000/storage/avatars/${avatarPath}`;
  }
  
  // Default fallback
  return "/users/default-avatar.svg";
};

export default function Header() {
  const [sticky, setSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastUnreadCount, setLastUnreadCount] = useState(0);

  const notificationRef = useRef(null);
  const { user, setUser } = useUser();

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch unread messages - FIXED WITH BETTER ERROR HANDLING
  const fetchUnreadMessages = async () => {
    // Skip if not authenticated OR if user is admin
    if (!isAuthenticated()) return;
    if (user?.role === 'admin') {
      console.log("Admin user - skipping message notifications");
      return;
    }

    try {
      setLoading(true);
      
      const data = await fetchUnreadMessagesApi();
      
      console.log("📨 Unread messages API response:", data);

      // If data is null or undefined, just return
      if (!data) {
        setNotifications([]);
        setUnreadCount(0);
        setLastUnreadCount(0);
        return;
      }

      // Handle both response formats (array or object with count)
      let unreadData = [];
      if (Array.isArray(data)) {
        unreadData = data;
      } else if (data.unread_messages) {
        unreadData = data.unread_messages;
      } else if (data.messages) {
        unreadData = data.messages;
      } else if (data.data) {
        unreadData = data.data;
      } else if (typeof data === 'object' && data.count !== undefined) {
        // If API returns just a count, show no notifications
        setUnreadCount(data.count || 0);
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Process notifications if we have an array
      if (Array.isArray(unreadData) && unreadData.length > 0) {
        const newNotifications = unreadData.map((item) => ({
          id: item.sender_id || item.id,
          message: `${item.sender_name || item.name}: ${item.latest_message || item.message || "New message"}`,
          fullMessage: item.latest_message || item.message,
          senderId: item.sender_id || item.id,
          senderName: item.sender_name || item.name,
          timestamp: item.created_at || item.timestamp,
          unreadCount: item.count || 1,
        }));

        const totalUnread = newNotifications.reduce((sum, n) => sum + (n.unreadCount || 1), 0);
        
        // Show toast for new messages
        if (totalUnread > lastUnreadCount && lastUnreadCount !== 0) {
          const latest = newNotifications[0];
          if (latest) {
            setToast({
              id: Date.now(),
              senderName: latest.senderName,
              message: latest.fullMessage,
              senderId: latest.senderId,
            });
            
            try {
              const audio = new Audio("/sounds/notification.mp3");
              audio.play().catch(() => console.log("Audio play failed"));
            } catch(e) {
              console.log("Audio not available");
            }
          }
        }
        
        setNotifications(newNotifications);
        setUnreadCount(totalUnread);
        setLastUnreadCount(totalUnread);
      } else {
        // No unread messages
        setNotifications([]);
        setUnreadCount(0);
        setLastUnreadCount(0);
      }
    } catch (err) {
      console.warn("Error fetching notifications:", err.message);
      // Don't show error to user, just log it quietly
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Poll for messages every 5 seconds (only for non-admin users)
  useEffect(() => {
    if (!isAuthenticated()) return;
    if (user?.role === 'admin') return;
    
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 5000);
    return () => clearInterval(interval);
  }, [user?.role]); // Re-run when user role changes

  // Handle notification click
  const handleNotificationClick = async (notificationId, senderId) => {
    try {
      await markMessagesAsReadApi(senderId);
      
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === notificationId);
        setUnreadCount((count) => Math.max(0, count - (removed?.unreadCount || 1)));
        return prev.filter((n) => n.id !== notificationId);
      });
      
      setShowNotifications(false);
      window.location.href = `/dashboard/user/messages?user=${senderId}`;
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!isAuthenticated() || notifications.length === 0) return;

    try {
      for (const note of notifications) {
        await markMessagesAsReadApi(note.senderId);
      }
      setNotifications([]);
      setUnreadCount(0);
      setLastUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  };

  // FIXED: Use the helper function to get avatar URL
  const avatarUrl = user ? getAvatarUrl(user.avatar) : "/users/default-avatar.svg";

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("✅ Notifications enabled", {
        body: "You will receive message notifications",
      });
    }
  };

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      const timer = setTimeout(() => setShowPermissionPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-[#163832]/60 ${
          sticky ? "shadow-lg py-2" : "py-4"
        }`}
        style={{
          background:
            "linear-gradient(90deg, rgba(5,31,32,0.85), rgba(11,43,38,0.85), rgba(22,56,50,0.85))",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard/user/homepage">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-10 md:h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 items-center justify-between mx-4 space-x-6">
            {/* Search */}
            <div className="relative w-80">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-[#8EB69B]" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#0B2B26] border border-[#235347] text-[#DAF1DE] placeholder:text-[#8EB69B] focus:outline-none focus:ring-2 focus:ring-[#8EB69B]/60 transition"
              />
            </div>

            {/* Nav Links */}
            <nav className="flex space-x-6 items-center text-[#DAF1DE]">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative hover:text-[#8EB69B] transition group"
                >
                  {link.name}
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#8EB69B] transition-all group-hover:w-full"></span>
                </Link>
              ))}

              {/* Notification Bell - Hide for admin users */}
              {user && user.role !== 'admin' && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-1 rounded-full hover:bg-[#0B2B26] transition"
                  >
                    <FiBell className="w-[18px] h-[18px] text-[#DAF1DE] hover:text-[#8EB69B] transition" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#051F20] border border-[#163832] rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="flex items-center justify-between p-3 border-b border-[#163832]">
                        <h3 className="text-[#DAF1DE] font-semibold">Messages</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-[#8EB69B] hover:text-[#DAF1DE] transition"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {loading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8EB69B]"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                          <FiBell className="w-12 h-12 text-[#235347] mb-3" />
                          <p className="text-[#8EB69B] text-sm">No new messages</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((note) => (
                            <div
                              key={note.id}
                              onClick={() => handleNotificationClick(note.id, note.senderId)}
                              className="p-3 border-b border-[#163832] hover:bg-[#0B2B26] cursor-pointer transition bg-[#0B2B26]/30"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-[#235347] flex items-center justify-center">
                                    <FiMessageCircle className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-[#DAF1DE] font-medium">
                                    {note.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-[#235347]">
                                      {formatTime(note.timestamp)}
                                    </p>
                                    {note.unreadCount > 1 && (
                                      <span className="text-xs bg-red-500 px-1.5 py-0.5 rounded-full text-white">
                                        {note.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <FiCheckCircle className="w-4 h-4 text-[#8EB69B] flex-shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <Link href={user.role === 'admin' ? "/dashboard/admin/profile" : "/dashboard/user/profile"} className="flex items-center space-x-2 hover:opacity-80 transition">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-[#235347] object-cover"
                    onError={(e) => {
                      console.error("Avatar failed to load:", avatarUrl);
                      e.currentTarget.src = "/users/default-avatar.svg";
                    }}
                  />
                  {unreadCount > 0 && user.role !== 'admin' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#051F20] animate-pulse"></span>
                  )}
                </div>
                <span className="text-[#DAF1DE] hidden sm:inline">{user.name}</span>
              </Link>
            ) : (
              <Link href="/login" className="hidden md:flex items-center space-x-1 text-[#DAF1DE] hover:text-[#8EB69B] transition">
                <FiUser className="w-6 h-6" />
                <span>Login</span>
              </Link>
            )}

            <button className="md:hidden text-[#DAF1DE]" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#051F20] px-4 py-4 border-t border-[#163832]">
            <div className="mb-4 relative">
              <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-[#8EB69B]" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#0B2B26] border border-[#235347] text-[#DAF1DE]"
              />
            </div>
            <nav className="flex flex-col space-y-3 text-[#DAF1DE]">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="hover:text-[#8EB69B] transition py-1" onClick={() => setMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
              {user && user.role !== 'admin' && (
                <>
                  {notifications.slice(0, 2).map((note) => (
                    <Link
                      key={note.id}
                      href={`/dashboard/user/messages?user=${note.senderId}`}
                      className="text-sm py-1 pl-2 border-l-2 border-[#235347] text-[#8EB69B]"
                      onClick={() => setMenuOpen(false)}
                    >
                      {note.message.substring(0, 40)}...
                    </Link>
                  ))}
                </>
              )}
              {user && (
                <button onClick={handleLogout} className="text-left hover:text-[#8EB69B] transition py-1">
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Toast Notification - Only for non-admin users */}
      {toast && user?.role !== 'admin' && (
        <div className="fixed bottom-6 right-6 z-[100] animate-slide-up-right">
          <div
            onClick={() => {
              window.location.href = `/dashboard/user/messages?user=${toast.senderId}`;
            }}
            className="bg-[#051F20] border-l-4 border-[#235347] rounded-lg shadow-2xl w-80 cursor-pointer hover:scale-105 transition-transform duration-200 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#235347] to-[#1a3f35] flex items-center justify-center text-white font-bold text-lg">
                    {toast.senderName?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-white">{toast.senderName}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setToast(null);
                      }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <FiXCircle size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-[#8EB69B] mt-1 line-clamp-2">{toast.message}</p>
                  <p className="text-[10px] text-[#235347] mt-2">Just now</p>
                </div>
              </div>
            </div>
            <div className="h-0.5 bg-[#235347] animate-progress"></div>
          </div>
        </div>
      )}

      {/* Permission Prompt - Only for non-admin users */}
      {showPermissionPrompt && user?.role !== 'admin' && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#051F20] border border-[#235347] rounded-lg shadow-xl p-4 max-w-sm animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#235347] rounded-full flex items-center justify-center flex-shrink-0">
              <FiBell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-[#DAF1DE]">Enable Notifications</h4>
              <p className="text-xs text-gray-400 mt-1">
                Get notified when you receive new messages.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={requestNotificationPermission}
                  className="px-3 py-1.5 bg-[#235347] text-white text-xs rounded-lg hover:bg-[#1a3f35] transition"
                >
                  Allow
                </button>
                <button
                  onClick={() => setShowPermissionPrompt(false)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded-lg hover:bg-gray-600 transition"
                >
                  No thanks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up-right {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-slide-up-right {
          animation: slide-up-right 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}
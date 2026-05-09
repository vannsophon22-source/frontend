"use client";

import React, { useState } from "react";
import { Bell, Search, ChevronDown, LogOut, Menu, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminHeader({
  onSearch,
  onMenuClick,
  adminName = "Admin User",
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  const notifications = [
    { id: 1, text: "New user registered", time: "5 min ago" },
    { id: 2, text: "Payment received", time: "1 hour ago" },
    { id: 3, text: "Room booking request", time: "3 hours ago" },
  ];

  const unreadCount = 2;

  return (
    <header className="bg-gradient-to-r from-[#051F20] to-[#0a2a2b] border-b border-[#235347]/30 px-4 py-2 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left - Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-[#0a2a2b] rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full bg-[#051F20] border border-[#235347]/40 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-[#0a2a2b] rounded-lg text-gray-400 hover:text-white transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0a2a2b] border border-[#235347]/30 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-[#235347]/30">
                  <h3 className="text-white font-medium">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 hover:bg-[#051F20] border-b border-[#235347]/20 last:border-0 transition-colors"
                    >
                      <p className="text-sm text-white">{n.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 hover:bg-[#0a2a2b] rounded-lg transition-colors"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-[#235347] to-[#1a3f35] rounded-lg flex items-center justify-center shadow-lg shadow-[#235347]/30">
                <span className="text-white text-xs font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-white hidden sm:block">
                {adminName}
              </span>
              <ChevronDown
                size={14}
                className="text-gray-500 hidden sm:block"
              />
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0a2a2b] border border-[#235347]/30 rounded-lg shadow-xl z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      router.push("/dashboard/admin/profile");
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#051F20] rounded-lg transition-colors"
                  >
                    Profile
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#051F20] rounded-lg transition-colors">
                    Settings
                  </button>
                  <div className="border-t border-[#235347]/30 my-1"></div>
                  <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors">
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

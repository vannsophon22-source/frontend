"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  fetchChatUsers,
  fetchMessages,
  sendMessageApi,
  markMessagesAsRead,
} from "@/utils/api";
import {
  FaArrowLeft,
  FaSearch,
  FaPaperPlane,
  FaUser,
  FaSpinner,
  FaCircle,
  FaCheckCircle,
} from "react-icons/fa";

/* ---------------- HELPERS ---------------- */
const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getCurrentUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error("Error parsing user:", error);
    return null;
  }
};

export default function ChatSidebar() {
  /* ---------------- STATE ---------------- */
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const primaryColor = "#235347";
  const primaryDark = "#1a4036";

  /* ---------------- LOAD CURRENT USER ON MOUNT ---------------- */
  useEffect(() => {
    const user = getCurrentUser();
    console.log("Current user loaded:", user); // Debug log
    setCurrentUser(user);
  }, []);

  /* ---------------- LOAD USERS ---------------- */
  const loadUsers = async () => {
    if (!currentUser) {
      console.log("No current user, skipping loadUsers");
      return;
    }

    try {
      setLoadingUsers(true);
      setError(null);

      const token = getToken();
      if (!token) {
        console.log("No token found");
        return;
      }

      console.log("Fetching users with search:", search);
      const res = await fetchChatUsers(search);
      console.log("Users response:", res);

      const list = res?.users || [];

      if (!Array.isArray(list)) {
        setUsers([]);
        return;
      }

      const filtered = currentUser?.id
        ? list.filter((u) => u.id !== currentUser.id)
        : list;

      setUsers(filtered);
    } catch (err) {
      console.error("LOAD USERS ERROR:", err);
      setUsers([]);
      setError("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  /* ---------------- LOAD USERS WHEN CURRENT USER OR SEARCH CHANGES ---------------- */
  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser, search]);

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setError(null);

        console.log("Loading messages for user:", selectedUser.id);
        const data = await fetchMessages(selectedUser.id);
        console.log("Messages loaded:", data);

        setMessages(Array.isArray(data) ? data : []);

        await markMessagesAsRead(selectedUser.id);
        scrollToBottom();
      } catch (err) {
        console.error("Load messages error:", err);
        setError("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedUser, currentUser]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    if (!input.trim() || !selectedUser || sending || !currentUser) return;

    const text = input.trim();

    setInput("");
    setSending(true);

    const tempMsg = {
      id: Date.now(),
      message: text,
      sender_id: currentUser?.id,
      receiver_id: selectedUser.id,
      created_at: new Date().toISOString(),
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    try {
      await sendMessageApi(selectedUser.id, text);

      const updated = await fetchMessages(selectedUser.id);
      setMessages(Array.isArray(updated) ? updated : []);
      scrollToBottom();
    } catch (err) {
      console.error("Send message error:", err);
      setError("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  };

  /* ---------------- SCROLL ---------------- */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ---------------- KEY HANDLER ---------------- */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ---------------- RENDER LOADING STATE ---------------- */
  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a2a2b]">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#235347] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading user session...</p>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR DISPLAY ---------------- */
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a2a2b]">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
          <button
            onClick={() => loadUsers()}
            className="px-4 py-2 bg-[#235347] text-white rounded-lg hover:bg-[#2d6b5a]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="h-screen flex bg-[#0a2a2b] text-white">
      {/* LEFT SIDE - Users List */}
      <div className="w-80 border-r border-[#235347]/30 flex flex-col bg-[#051F20]">
        {/* Header */}
        <div
          className="p-4 flex items-center gap-3 border-b border-[#235347]/30"
          style={{ backgroundColor: primaryDark }}
        >
          <button
            onClick={() => window.history.back()}
            className="text-gray-300 hover:text-[#235347] transition-colors"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold text-white">Messages</h1>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-[#235347]/30">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-[#235347]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="flex items-center justify-center p-8">
              <FaSpinner className="w-6 h-6 text-[#235347] animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="p-4 text-gray-400 text-center">No users found</p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-4 cursor-pointer transition-all duration-200 border-b border-[#235347]/20 hover:bg-[#235347]/10 ${
                  selectedUser?.id === u.id
                    ? "bg-[#235347]/20 border-l-4 border-l-[#235347]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#235347] to-[#1a3f35] flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{u.name}</div>
                    <div className="text-xs text-gray-400 truncate">
  {u.last_message || "Start conversation"}
</div>
                  </div>
                  {u.online && <FaCircle className="text-green-400 text-xs" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDE - Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0a2a2b]">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#235347]/30 bg-[#051F20]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#235347] to-[#1a3f35] flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">
                    {selectedUser.name}
                  </h2>
                  <p className="text-xs text-gray-400">Online</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <FaSpinner className="w-6 h-6 text-[#235347] animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                messages.map((m) => {
                  const isOwnMessage = m.sender_id === currentUser?.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          isOwnMessage
                            ? "bg-gradient-to-r from-[#235347] to-[#1a3f35] text-white"
                            : "bg-gray-800 text-gray-200"
                        }`}
                      >
                        <p className="text-sm">{m.message}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {m.created_at
                            ? new Date(m.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#235347]/30 bg-[#051F20]/50">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 px-4 py-2.5 bg-gray-900/50 border border-[#235347]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  disabled={sending}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#235347] to-[#1a3f35] text-white rounded-lg hover:from-[#2a7a64] hover:to-[#235347] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                >
                  {sending ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaPaperPlane size={16} />
                  )}
                  <span>Send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#235347] to-[#1a3f35] flex items-center justify-center">
                <FaUser className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to Chat
              </h3>
              <p className="text-gray-400">Select a user to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  User, 
  Mail, 
  UserCircle, 
  ChevronLeft, 
  CheckCircle, 
  LogOut,
  MessageCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const fileInputRef = useRef(null);

  // State variables
  const [initialUser, setInitialUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("/users/default-avatar.svg");
  const [avatarFile, setAvatarFile] = useState(null);
  const [email, setEmail] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [gender, setGender] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");

  // Helper function to get correct avatar URL
  const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "/users/default-avatar.svg";

  // already full URL
  if (avatarPath.startsWith("http")) return avatarPath;

  const base = "https://backend-production-ac2f.up.railway.app/storage/";

  // remove duplicate "storage/" if backend already sends it
  const cleaned = avatarPath.replace(/^storage\//, "");

  return base + cleaned;
};

  // Get auth token
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // Update localStorage and context with latest user data
  const updateLocalStorageAndContext = (updatedUserData) => {
    // Get current user from localStorage to merge
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Merge with new data
    const mergedUser = {
      ...currentUser,
      ...updatedUserData,
      updated_at: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem("user", JSON.stringify(mergedUser));
    
    // Update context
    if (setUser) setUser(mergedUser);
    
    // Update state
    setInitialUser(mergedUser);
    
    return mergedUser;
  };

  // Load user from backend using /api/user endpoint
  const loadUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load user");
      }

      const data = await response.json();
      const userData = data.user || data;
      
      // Store the latest version
      updateLocalStorageAndContext(userData);
      
      // Update form fields
      setFirstName(userData.first_name || "");
setLastName(userData.last_name || "");
      setEmail(userData.email || "");
      setTelegramId(userData.telegram_id || "");
      setGender(userData.gender || "");
      
      // Set avatar preview with correct URL
      const avatarUrl = getAvatarUrl(userData.avatar);
      setAvatarPreview(avatarUrl);
      
    } catch (err) {
      console.error("Error loading user:", err);
      // Fallback to localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setInitialUser(parsedUser);
        setName(parsedUser.name || "");
        setEmail(parsedUser.email || "");
        setTelegramId(parsedUser.telegram_id || "");
        setGender(parsedUser.gender || "");
        const avatarUrl = getAvatarUrl(parsedUser.avatar);
        setAvatarPreview(avatarUrl);
      } else {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [router, setUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setError("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Upload avatar and store latest version
  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setError("Please select an image first.");
      return;
    }

    setIsUploadingAvatar(true);
    setError("");

    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await fetch(`${API_URL}/user/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload avatar");
      }

      const data = await response.json();
      
      // The avatar path from response
      const avatarPath = data.avatar || data.avatar_url;
      const avatarFullUrl = getAvatarUrl(avatarPath);
      
      // Store the latest user data with new avatar
      const updatedUserData = {
        ...initialUser,
        avatar: avatarPath,
        avatar_updated_at: new Date().toISOString()
      };
      
      // Update localStorage and context with latest version
      const latestUser = updateLocalStorageAndContext(updatedUserData);
      
      // Update form state with correct URL
      setAvatarPreview(avatarFullUrl);
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      
      // Refresh user data from backend to ensure sync
      await loadUser();
      
    } catch (err) {
      setError(err.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Update profile using PUT /api/user endpoint and store latest version
  const handleProfileUpdate = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
  
    // FIX: Check against firstName/lastName instead of the undefined 'name'
    if (!firstName.trim() || !lastName.trim()) {
      return setError("First name and Last name are required");
    }
  
    setIsSaving(true);
    setError("");
  
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          first_name: firstName, // Ensure these keys match your Laravel controller
          last_name: lastName,
          email: email,
          telegram_id: telegramId,
          gender: gender,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        // Handle Laravel validation errors (e.g., 'first_name' field errors)
        const message = data.errors 
          ? Object.values(data.errors).flat().join(", ") 
          : (data.message || "Update failed");
        throw new Error(message);
      }
  
      const updatedUser = data.user;
  
      // Update local storage and context
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);
      setInitialUser(updatedUser);
  
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
  
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("authMethod");
    
    if (setUser) setUser(null);
    
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 500);
  };

  const confirmSignOut = () => {
    setShowLogoutConfirm(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a2a2b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#235347] animate-spin mx-auto mb-4" />
          <p className="text-[#8EB69B]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!initialUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a2a2b] py-8 px-4">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#051F20] rounded-2xl shadow-2xl p-8 max-w-md w-full border border-[#235347]/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="text-red-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sign Out</h3>
              <p className="text-[#8EB69B]">Are you sure you want to sign out?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#8EB69B] hover:text-[#DAF1DE] transition-colors group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-4">
            {saveSuccess && !showLogoutConfirm && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg animate-fade-in">
                <CheckCircle size={18} />
                <span className="font-medium">Saved!</span>
              </div>
            )}
            <button
              onClick={confirmSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
            <AlertCircle className="text-red-400" size={24} />
            <div>
              <span className="text-red-400 font-medium">Error</span>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Avatar & Info */}
          <div className="md:col-span-1 bg-[#051F20] rounded-2xl shadow-lg p-6 sticky top-8 border border-[#235347]/30">
            <div className="text-center mb-6 relative">
              <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-[#235347] shadow-xl group">
                <img 
                  src={avatarPreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  onError={(e) => {
                    console.error('Avatar failed to load:', avatarPreview);
                    e.target.src = "/users/default-avatar.svg";
                  }}
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center transition-opacity duration-300 pb-4 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex items-center gap-2 text-white">
                    <Camera size={20} />
                    <span className="text-sm font-medium">Change Photo</span>
                  </div>
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
              />
            </div>

            {avatarFile && (
              <div className="space-y-4 animate-fade-in">
                <button
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#235347] to-[#1a3f35] text-white rounded-xl font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>Upload New Avatar</span>
                    </>
                  )}
                </button>
                <p className="text-sm text-[#8EB69B] text-center truncate">
                  Selected: {avatarFile.name}
                </p>
              </div>
            )}

            {/* Account Info - Shows latest stored data */}
            <div className="mt-8 pt-8 border-t border-[#235347]/30 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#0a2a2b] rounded-lg">
                <User size={20} className="text-[#8EB69B]" />
                <div>
                <div>
  <p className="text-sm text-[#8EB69B]">Name</p>
  <p className="font-medium text-white">
    {initialUser?.first_name || initialUser?.last_name 
      ? `${initialUser.first_name || ""} ${initialUser.last_name || ""}`.trim() 
      : "Not set"}
  </p>
</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#0a2a2b] rounded-lg">
                <Mail size={20} className="text-[#8EB69B]" />
                <div>
                  <p className="text-sm text-[#8EB69B]">Email</p>
                  <p className="font-medium text-white break-all">{initialUser?.email || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#0a2a2b] rounded-lg">
                <MessageCircle size={20} className="text-[#8EB69B]" />
                <div>
                  <p className="text-sm text-[#8EB69B]">Telegram ID</p>
                  <p className="font-medium text-white break-all">{initialUser?.telegram_id || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#0a2a2b] rounded-lg">
                <UserCircle size={20} className="text-[#8EB69B]" />
                <div>
                  <p className="text-sm text-[#8EB69B]">Gender</p>
                  <p className="font-medium text-white capitalize">{initialUser?.gender || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="md:col-span-2 bg-[#051F20] rounded-2xl shadow-lg p-8 border border-[#235347]/30">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <p className="text-[#8EB69B] mt-2">Update your personal information</p>
            </div>

            <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
  {/* First Name */}
  <div>
    <label className="block text-sm font-medium text-[#8EB69B] mb-2 flex items-center gap-2">
      <User size={16} />
      First Name
    </label>
    <input
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
      className="w-full p-4 bg-[#0a2a2b] border border-[#235347]/40 rounded-xl text-white placeholder-[#8EB69B] focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent transition"
      placeholder="First Name"
    />
  </div>

  {/* Last Name */}
  <div>
    <label className="block text-sm font-medium text-[#8EB69B] mb-2 flex items-center gap-2">
      <User size={16} />
      Last Name
    </label>
    <input
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
      className="w-full p-4 bg-[#0a2a2b] border border-[#235347]/40 rounded-xl text-white placeholder-[#8EB69B] focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent transition"
      placeholder="Last Name"
    />
  </div>
</div>

              <div>
                <label className="block text-sm font-medium text-[#8EB69B] mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-[#8EB69B]" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-[#0a2a2b] border border-[#235347]/40 rounded-xl text-white placeholder-[#8EB69B] focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent transition"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8EB69B] mb-2 flex items-center gap-2">
                  <MessageCircle size={16} className="text-[#8EB69B]" />
                  Telegram ID
                </label>
                <input
                  type="text"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  className="w-full p-4 bg-[#0a2a2b] border border-[#235347]/40 rounded-xl text-white placeholder-[#8EB69B] focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent transition"
                  placeholder="@username or telegram ID"
                />
                <p className="text-sm text-[#8EB69B] mt-2">
                  Your Telegram username for direct chat notifications
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8EB69B] mb-2 flex items-center gap-2">
                  <UserCircle size={16} className="text-[#8EB69B]" />
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-4 bg-[#0a2a2b] border border-[#235347]/40 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent transition appearance-none cursor-pointer"
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="pt-6 border-t border-[#235347]/30">
                <button
                  onClick={handleProfileUpdate}
                  disabled={isSaving}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#235347] to-[#1a3f35] text-white rounded-xl font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fade-in { 
          animation: fade-in 0.3s ease-out; 
        }
        
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238EB69B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
        
        select option {
          background-color: #0a2a2b;
          color: white;
        }
      `}</style>
    </div>
  );
}

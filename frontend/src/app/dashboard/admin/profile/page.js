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
  Loader2,
  Shield,
  Building,
  Key,
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";


export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const fileInputRef = useRef(null);

  // State variables
  const [initialUser, setInitialUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("/users/default-avatar.svg");
  const [avatarFile, setAvatarFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [gender, setGender] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get correct avatar URL
  const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "/users/default-avatar.svg";

  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL.replace("/api", "");

  return `${BASE_URL}/storage/${avatarPath}`;
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

    // ✅ DEBUG logs (NOW SAFE)
    console.log("User Data:", userData);
    console.log("Avatar Path:", userData?.avatar);
    console.log("Avatar URL:", getAvatarUrl(userData?.avatar));

    // Store the latest version
    updateLocalStorageAndContext(userData);

    // Update form fields
    setName(userData.name || "");
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
  
    if (!name.trim()) {
      return setError("Name is required");
    }
  
    setIsSaving(true);
    setError("");
  
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          telegram_id: telegramId,
          gender,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }
  
      const updatedUser = data.user;
  
      // Update localStorage and context
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a2a2b] to-[#0d3537] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-300/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!initialUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2a2b] to-[#0d3537] py-8 px-4">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#051F20] rounded-2xl shadow-2xl p-8 max-w-md w-full border border-emerald-500/30 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="text-rose-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sign Out</h3>
              <p className="text-emerald-300/70">Are you sure you want to sign out?</p>
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
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 transition"
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
            className="flex items-center gap-2 text-emerald-300/70 hover:text-emerald-400 transition-colors group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-4">
            {saveSuccess && !showLogoutConfirm && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl animate-fade-in">
                <CheckCircle size={18} />
                <span className="font-medium">Saved!</span>
              </div>
            )}
            <button
              onClick={confirmSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
            <AlertCircle className="text-rose-400" size={24} />
            <div>
              <span className="text-rose-400 font-medium">Error</span>
              <p className="text-rose-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Avatar & Info */}
          <div className="md:col-span-1 bg-[#051F20] rounded-2xl shadow-2xl p-6 sticky top-8 border border-emerald-500/30">
            <div className="text-center mb-6 relative">
              <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl group">
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
              
              {/* Admin Badge */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <Shield size={14} className="text-purple-400" />
                <span className="text-purple-400 text-xs font-semibold uppercase">Administrator</span>
              </div>
            </div>

            {avatarFile && (
              <div className="space-y-4 animate-fade-in">
                <button
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
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
                <p className="text-sm text-emerald-300/70 text-center truncate">
                  Selected: {avatarFile.name}
                </p>
              </div>
            )}

            {/* Account Info */}
            <div className="mt-8 pt-8 border-t border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#0a2a2b] to-transparent rounded-lg">
                <User size={20} className="text-emerald-400" />
                <div>
                  <p className="text-sm text-emerald-300/70">Name</p>
                  <p className="font-medium text-white">{initialUser?.name || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#0a2a2b] to-transparent rounded-lg">
                <Mail size={20} className="text-emerald-400" />
                <div>
                  <p className="text-sm text-emerald-300/70">Email</p>
                  <p className="font-medium text-white break-all">{initialUser?.email || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#0a2a2b] to-transparent rounded-lg">
                <MessageCircle size={20} className="text-emerald-400" />
                <div>
                  <p className="text-sm text-emerald-300/70">Telegram ID</p>
                  <p className="font-medium text-white break-all">{initialUser?.telegram_id || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#0a2a2b] to-transparent rounded-lg">
                <UserCircle size={20} className="text-emerald-400" />
                <div>
                  <p className="text-sm text-emerald-300/70">Gender</p>
                  <p className="font-medium text-white capitalize">{initialUser?.gender || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#0a2a2b] to-transparent rounded-lg">
                <Calendar size={20} className="text-emerald-400" />
                <div>
                  <p className="text-sm text-emerald-300/70">Member Since</p>
                  <p className="font-medium text-white">
                    {initialUser?.created_at ? new Date(initialUser.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="md:col-span-2 bg-[#051F20] rounded-2xl shadow-2xl p-8 border border-emerald-500/30">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
                Edit Profile
              </h2>
              <p className="text-emerald-300/70 mt-2">Update your personal information</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-emerald-300/70 mb-2 flex items-center gap-2">
                  <User size={16} className="text-emerald-400" />
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-[#0a2a2b] border border-emerald-500/30 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-300/70 mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-emerald-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-[#0a2a2b] border border-emerald-500/30 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-300/70 mb-2 flex items-center gap-2">
                  <MessageCircle size={16} className="text-emerald-400" />
                  Telegram ID
                </label>
                <input
                  type="text"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  className="w-full p-4 bg-[#0a2a2b] border border-emerald-500/30 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="@username or telegram ID"
                />
                <p className="text-sm text-emerald-300/70 mt-2">
                  Your Telegram username for direct chat notifications
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-300/70 mb-2 flex items-center gap-2">
                  <UserCircle size={16} className="text-emerald-400" />
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-4 bg-[#0a2a2b] border border-emerald-500/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none cursor-pointer"
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Admin Stats Card */}
              <div className="bg-gradient-to-r from-[#0a2a2b] to-[#0d3537] rounded-xl p-4 border border-emerald-500/30">
                <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <Shield size={16} />
                  Admin Privileges
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <Building size={20} className="text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs text-emerald-300/70">Manage Properties</p>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <Key size={20} className="text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs text-emerald-300/70">Full Access</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-emerald-500/30">
                <button
                  onClick={handleProfileUpdate}
                  disabled={isSaving}
                  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
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

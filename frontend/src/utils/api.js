export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
/* =========================================================
   TOKEN
========================================================= */
export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/* =========================================================
   CORE REQUEST
========================================================= */
async function request(url, options = {}) {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error("❌ Invalid JSON response:", text);
      throw new Error("Server returned invalid JSON");
    }

    // Handle 401 Unauthorized - Token expired
    if (res.status === 401) {
      console.error("❌ Authentication failed - token may be expired");
      
      // Clear invalid token
      clearAuth();
      
      // Redirect to login page if in browser and not already on auth pages
      if (typeof window !== "undefined") {
        const isAuthPage = window.location.pathname === "/login" || 
                          window.location.pathname === "/register";
        
        if (!isAuthPage) {
          alert("Your session has expired. Please login again.");
          window.location.href = "/login";
        }
      }
      
      throw new Error(data?.message || "Session expired. Please login again.");
    }

    if (!res.ok) {
      console.error("❌ API ERROR:", data);
      throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
    }

    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please check if backend is running.');
    }
    throw error;
  }
}

// Safe request for notifications (doesn't throw on 401)
async function safeRequest(url, options = {}) {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  // Don't even try if no token
  if (!token) {
    console.log("No token found, skipping request");
    return null;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.warn("Invalid JSON response from safe request");
      return null;
    }

    // For 401, just return null (don't throw)
    if (res.status === 401) {
      console.log("Auth failed, skipping request");
      return null;
    }

    if (!res.ok) {
      console.warn(`Safe request failed with status ${res.status}`);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Safe request error:", error.message);
    return null;
  }
}

/* =========================================================
   AUTH
========================================================= */

export const loginApi = async (email, password) => {
  const data = await request(`${API_URL}/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (data?.access_token) {
    localStorage.setItem("token", data.access_token);
  }

  if (data?.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
};

export const logoutApi = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  return request(`${API_URL}/logout`, {
    method: "POST",
  });
};

export const fetchUser = () =>
  request(`${API_URL}/user`, { method: "GET" });

export const updateUserProfile = (payload) =>
  request(`${API_URL}/user`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

/* =========================================================
   OTP
========================================================= */

export const sendOtpApi = (email, telegram_id, telegram_username = null) =>
  request(`${API_URL}/send-otp`, {
    method: "POST",
    body: JSON.stringify({
      email,
      telegram_id,
      telegram_username,
    }),
  });

export const verifyOtpApi = (
  email,
  otp,
  name,
  password,
  password_confirmation,
  gender,
  telegramId,
  telegramUsername
) =>
  request(`${API_URL}/verify-otp`, {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
      name,
      password,
      password_confirmation,
      gender,
      telegram_id: telegramId,
      telegram_username: telegramUsername,
      is_new: true,
    }),
  });

/* =========================================================
   CHAT
========================================================= */

const safeJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid JSON response");
  }
};

export const fetchChatUsers = async (search = "") => {
  const res = await fetch(
    `${API_URL}/chat/users?search=${encodeURIComponent(search)}`,
    {
      headers: {
        Accept: "application/json",
        ...(getAuthToken()
          ? { Authorization: `Bearer ${getAuthToken()}` }
          : {}),
      },
    }
  );

  const data = await safeJson(res);
  return { users: data?.users || [] };
};

export const fetchMessages = async (userId) => {
  const res = await fetch(`${API_URL}/chat/messages/${userId}`, {
    headers: {
      Accept: "application/json",
      ...(getAuthToken()
        ? { Authorization: `Bearer ${getAuthToken()}` }
        : {}),
    },
  });

  return safeJson(res);
};

export const sendMessageApi = async (receiver_id, message) => {
  const res = await fetch(`${API_URL}/chat/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(getAuthToken()
        ? { Authorization: `Bearer ${getAuthToken()}` }
        : {}),
    },
    body: JSON.stringify({
      receiver_id,
      message: message?.trim(),
    }),
  });

  return safeJson(res);
};

export const markMessagesAsRead = async (senderId) => {
  const res = await fetch(`${API_URL}/messages/read/${senderId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      ...(getAuthToken()
        ? { Authorization: `Bearer ${getAuthToken()}` }
        : {}),
    },
  });

  return safeJson(res);
};

/* =========================================================
   NOTIFICATIONS (FIXED - USES SAFE REQUEST)
========================================================= */

export const fetchUnreadMessagesApi = async () => {
  const data = await safeRequest(`${API_URL}/messages/unread`, {
    method: "GET",
  });
  
  // Return consistent format even if data is null
  if (!data) {
    return { count: 0, messages: [] };
  }
  
  // Handle various response formats
  if (Array.isArray(data)) {
    return { count: data.length, messages: data };
  }
  
  if (data.messages) {
    return { count: data.messages.length, messages: data.messages };
  }
  
  if (data.unread_messages) {
    return { count: data.unread_messages.length, messages: data.unread_messages };
  }
  
  if (data.data) {
    return { count: data.data.length, messages: data.data };
  }
  
  if (data.count !== undefined) {
    return { count: data.count, messages: [] };
  }
  
  // Default return
  return { count: 0, messages: [] };
};

export const markMessagesAsReadApi = (senderId) =>
  request(`${API_URL}/messages/read/${senderId}`, {
    method: "PUT",
  });

/* =========================================================
   AUTH HELPERS
========================================================= */

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

/* =========================================================
   AVATAR UPLOAD
========================================================= */

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return fetch(`${API_URL}/user/avatar`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
    },
    body: formData,
  }).then(async (res) => {
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Invalid server response");
    }
    if (!res.ok) {
      throw new Error(data?.message || "Upload failed");
    }
    return data;
  });
};

export const getAvatar = (userId) =>
  request(`${API_URL}/user/avatar/${userId}`, { method: "GET" });

/* =========================================================
   USERS (ADMIN) - FIXED
========================================================= */

export const fetchUsers = async () => {
  const url = `${API_URL}/users`;
  console.log("=========================================");
  console.log("📡 FETCHING USERS");
  console.log("URL:", url);
  console.log("API_URL env:", process.env.NEXT_PUBLIC_API_URL);
  console.log("=========================================");
  
  try {
    const response = await request(url, { method: "GET" });
    console.log("📦 Request response:", response);
    
    // Your backend returns: { users: [...] }
    if (response && response.users && Array.isArray(response.users)) {
      console.log("✅ Found users array with length:", response.users.length);
      return response.users;
    }
    
    if (Array.isArray(response)) {
      console.log("✅ Response is array with length:", response.length);
      return response;
    }
    
    console.warn("⚠️ Unexpected response format:", response);
    return [];
  } catch (error) {
    console.error("❌ fetchUsers failed:", error);
    throw error;
  }
};

export const createUser = (payload) =>
  request(`${API_URL}/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateUser = (id, payload) =>
  request(`${API_URL}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteUser = (id) =>
  request(`${API_URL}/users/${id}`, {
    method: "DELETE",
  });

/* =========================================================
   property (CORRECT SYSTEM)
========================================================= */

export const fetchProperties = () =>
  request(`${API_URL}/properties`, { method: "GET" });

export const createProperty = (data) =>
  request(`${API_URL}/properties`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProperty = (id, data) =>
  request(`${API_URL}/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteProperty = (id) =>
  request(`${API_URL}/properties/${id}`, {
    method: "DELETE",
  });


/* =========================================================
   Booking (CORRECT SYSTEM)
========================================================= */
export const createBooking = (data) =>
  request(`${API_URL}/bookings`, {
    method: "POST",
    body: JSON.stringify({
      unit_id: data.unit_id,
      check_in: data.check_in,
      check_out: data.check_out,
      guests: data.guests,
    }),
  });

export const checkAvailability = (data) =>
  request(`${API_URL}/bookings/check-availability`, {
    method: "POST",
    body: JSON.stringify({
      unit_id: data.unit_id,
      check_in: data.check_in,
      check_out: data.check_out,
    }),
  });

export const fetchMyBookings = () =>
  request(`${API_URL}/bookings/my`, {
    method: "GET",
  });

/* =========================================================
   UNITS (CORRECT SYSTEM)
========================================================= */

export const fetchUnitsByProperty = (propertyId) =>
  request(`${API_URL}/units/property/${propertyId}`, {
    method: "GET",
  });

export const createUnit = (data) =>
  request(`${API_URL}/units`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateUnit = (id, data) =>
  request(`${API_URL}/units/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteUnit = (id) =>
  request(`${API_URL}/units/${id}`, {
    method: "DELETE",
  });
// src/utils/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const getEcho = () => {
  if (echoInstance) return echoInstance;

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'local',
    wsHost: process.env.NEXT_PUBLIC_WS_HOST || 'localhost',
    wsPort: process.env.NEXT_PUBLIC_WS_PORT || 6001,
    forceTLS: false,
    disableStats: true,

    authEndpoint: `${API_BASE}/broadcasting/auth`,

    auth: {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};
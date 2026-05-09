// hooks/useNotifications.js
import { useEffect, useState } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.log("Browser does not support notifications");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  };

  const showNotification = (title, options = {}) => {
    if (permission !== "granted") return;

    const defaultOptions = {
      body: options.body || "",
      icon: options.icon || "/favicon.ico",
      badge: options.badge || "/badge-icon.png",
      tag: options.tag || "chat-message",
      requireInteraction: false,
      silent: false,
    };

    const notification = new Notification(title, { ...defaultOptions, ...options });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Optionally navigate to the chat
      if (options.onClick) options.onClick();
    };

    return notification;
  };

  return { permission, requestPermission, showNotification };
}
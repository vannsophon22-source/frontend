// components/Toast.jsx
import { useEffect, useState } from "react";

export function Toast({ message, onClose, type = "info" }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-600",
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-up max-w-sm`}>
      <div className="flex items-center gap-3">
        {type === "info" && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">×</button>
      </div>
    </div>
  );
}

// ToastContainer component
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}
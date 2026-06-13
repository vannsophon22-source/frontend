"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RoomCard({ room, property }) {
  const router = useRouter();
  const baseUrl = "https://backend-production-ac2f.up.railway.app/storage/";

  const [imgError, setImgError] = useState(false);

  const price = Number(room.price ?? 0);
  const title = room.tittle || "Untitled Room";

  // ✅ SINGLE SOURCE OF TRUTH
  const status = String(room.status || "")
  .trim()
  .toLowerCase();


  const isAvailable = status === "available";
  const isUnavailable = !isAvailable;

  return (
    <div
      className={`border rounded-2xl overflow-hidden flex flex-col h-[460px] transition ${
        isUnavailable
          ? "opacity-60 border-red-500/20"
          : "border-[#235347]/60"
      }`}
    >
      {/* IMAGE */}
      <div className="h-48 w-full bg-black">
        {!imgError ? (
          <img
            src={`${baseUrl}${room.image}`}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          <h3
            className={`text-lg font-bold ${
              isUnavailable ? "text-gray-500 line-through" : "text-white"
            }`}
          >
            {title}
          </h3>

          <p className="text-xs text-gray-400">
            {property?.location || "Phnom Penh"}
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-white/10">
          <span className="text-xl font-black text-white">
            ${price.toFixed(2)}
          </span>

          <p className="text-[11px] text-gray-400">
            {isAvailable ? "Available" : "Currently booked"}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() =>
                router.push(`/dashboard/user/rooms/${room.id}`)
              }
              className="flex-1 px-3 py-2 text-xs font-bold rounded-lg bg-gray-700 text-white"
            >
              View Details
            </button>

            <button
              disabled={isUnavailable}
              onClick={() =>
                router.push(`/dashboard/user/rooms/${room.id}/booking`)
              }
              className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg ${
                isUnavailable
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white"
              }`}
            >
              {isUnavailable ? "Unavailable" : "Book Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

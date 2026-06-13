"use client";
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RoomCard from "@/components/RoomCard";
import ChatSidebar from "@/components/ChatSidebar";

export default function RoomsPage() {
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  useEffect(() => {
  async function loadData() {
    try {
      setLoading(true);

      const res = await fetch(
        "https://backend-production-ac2f.up.railway.app/api/properties"
      );

      const json = await res.json();
      console.log("API:", json);

      const data = json?.data ?? json ?? [];

      setRoomData(data);
    } catch (error) {
      console.error("Failed:", error);
      setRoomData([]);
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);
  // unique locations
  const locations = useMemo(() => {
    const locs = roomData.map((r) => r.location).filter(Boolean);
    return ["all", ...new Set(locs)];
  }, [roomData]);

  // filters
  const filteredRooms = useMemo(() => {
    return roomData.filter((room) => {
      const matchesSearch =
        room.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        locationFilter === "all" || room.location === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [roomData, searchTerm, locationFilter]);

  return (
    <div className="min-h-screen bg-[#051F20] text-[#DAF1DE]">
      <Header onMessagesClick={() => setIsChatOpen(!isChatOpen)} />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-16">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Available Rooms
            </h1>
            <p className="text-[#8EB69B]">
              Explore {filteredRooms.length} rooms
            </p>
          </div>

          {/* SEARCH */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-6 py-3 rounded-full bg-[#0B2B26] border border-[#235347]"
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="px-6 py-3 rounded-full bg-[#0B2B26] border border-[#235347]"
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "all" ? "All Locations" : loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-[#0B2B26] animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[#8EB69B]">
            No rooms available.
          </div>
        )}
      </main>

      <Footer />

      {isChatOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="relative w-80 h-full bg-[#051F20] border-l border-[#235347]">
            <ChatSidebar onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

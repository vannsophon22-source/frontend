"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaBed,
  FaUsers,
  FaLayerGroup,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";

export default function RoomDetails() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;

  const API = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl = "http://127.0.0.1:8000/storage/";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRoomDetails = async () => {
    try {
      const res = await fetch(`${API}/units/${roomId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load room");
      const unit = data.data || data;
      setRoom(unit);
      setReviews(unit.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) fetchRoomDetails();
  }, [roomId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ unit_id: roomId, rating: Number(rating), comment }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      setComment("");
      setRating(5);
      fetchRoomDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#031415] text-[#8EB69B]">Loading...</div>;

  return (
    <div className="bg-[#031415] min-h-screen text-white pb-20">
      {/* Header */}
      <div className="border-b border-[#235347]/30 bg-[#051F20]/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-[#8EB69B] transition-colors">
            <FaArrowLeft /> Back
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-12 gap-12">
        {/* Left Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="h-96 bg-black rounded-3xl overflow-hidden shadow-2xl border border-[#235347]/30">
            {!imgError && room.image ? (
              <img src={`${baseUrl}${room.image}`} className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-2">{room.tittle}</h1>
            <p className="text-gray-400 flex items-center gap-2"><FaMapMarkerAlt /> {room.property?.location}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FaBed />, label: "Beds", val: room.bed },
              { icon: <FaUsers />, label: "Max Guests", val: room.max_member },
              { icon: <FaLayerGroup />, label: "Floor", val: room.floor },
              { icon: <FaCheckCircle />, label: "Type", val: room.price_type },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#051F20] p-4 rounded-2xl border border-[#235347]">
                <div className="text-[#8EB69B] mb-2">{item.icon}</div>
                <div className="text-xs text-gray-400 uppercase">{item.label}</div>
                <div className="font-bold">{item.val}</div>
              </div>
            ))}
          </div>

          <p className="text-gray-300 leading-relaxed bg-[#051F20] p-6 rounded-2xl border border-[#235347]">
            {room.descrepton}
          </p>
        </div>

        {/* Right Sticky Panel */}
        {/* Right Sticky Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#051F20] p-8 rounded-3xl border border-[#235347] sticky top-24">
            
            {/* Owner Profile */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-[#8EB69B] uppercase tracking-widest mb-4">Property Host</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#235347] flex items-center justify-center font-bold text-lg">
                  {room.property?.user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <div className="font-bold">{room.property?.user?.name || "Independent Host"}</div>
                  <div className="text-xs text-gray-400">{room.property?.user?.email || "No email provided"}</div>
                </div>
              </div>
            </div>

            <div className="text-3xl font-bold mb-6">${Number(room.price || 0).toFixed(2)}</div>
            <button className="w-full bg-[#8EB69B] text-[#031415] py-4 rounded-xl font-bold hover:bg-[#A3C8AF] transition">
              Book This Room
            </button>
            
            {/* Reviews Form */}
            <div className="mt-8 pt-8 border-t border-[#235347]">
              <h3 className="font-bold mb-4">Leave a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full p-3 bg-[#0B2B26] rounded-xl border border-[#235347]">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-3 bg-[#0B2B26] rounded-xl border border-[#235347] h-24" placeholder="Your thoughts..." />
                <button disabled={submitting} className="w-full bg-[#235347] py-3 rounded-xl font-bold">{submitting ? "Sending..." : "Post Review"}</button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
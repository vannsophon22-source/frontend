"use client";

import { useState } from "react";

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RoomCard from "@/components/RoomCard";
import FeedbackCard from "@/components/FeedbackCard";

// Data
import { rooms } from "@/data/roomData";
import { listings as importedListings } from "@/data/listings";
import { feedbacks as importedFeedbacks } from "@/data/feedbacks";

export default function HomePage() {
  const [roomData] = useState(rooms);
  const [feedbacks, setFeedbacks] = useState(importedFeedbacks || []);
  const [userComment, setUserComment] = useState("");

  const handleAddFeedback = (e) => {
    e.preventDefault();
    if (!userComment) return;

    const newFeedback = {
      id: feedbacks.length + 1,
      name: "Anonymous",
      comment: userComment,
      avatar: "/users/default-avatar.jpg",
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    setUserComment("");
  };

  return (
    <div className="min-h-screen bg-[#051F20] text-[#DAF1DE]">
      <Header />

      <section className="pt-20 pb-12 min-h-[400px] md:min-h-[500px] border-b border-[#235347] bg-[#051F20] relative">
  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200')] opacity-5 bg-cover bg-center"></div>
  
  <div className="max-w-7xl mx-auto px-4 relative">
    <div className="text-center max-w-3xl mx-auto mb-12">
      <h1 className="text-5xl md:text-7xl font-bold mb-6">
        Book Your
        <span className="text-[#8EB69B]"> Perfect Space</span>
      </h1>
      <p className="text-xl text-gray-300 mb-8">
        Find and reserve rooms that match your lifestyle, budget, and location.
      </p>
      <div className="flex gap-4 justify-center">
        <button className="px-8 py-4 rounded-full bg-[#235347] hover:bg-[#8EB69B] hover:text-[#051F20] transition-all font-semibold">
          Get Started
        </button>
        <button className="px-8 py-4 rounded-full border border-[#235347] hover:bg-[#0B2B26] transition">
          How it Works
        </button>
      </div>
    </div>
  
  </div>
</section>

      {/* ROOMS */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        <h2 className="text-3xl font-bold text-center">Available Rooms</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {roomData.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      {/* FEEDBACK */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-8">
        <h2 className="text-3xl font-bold text-center">What Our Users Say</h2>

        <form
          onSubmit={handleAddFeedback}
          className="flex flex-col md:flex-row gap-4 justify-center"
        >
          <input
            type="text"
            placeholder="Leave your comment..."
            className="px-4 py-2 rounded-lg bg-[#0B2B26] border border-[#235347] text-[#DAF1DE] placeholder:text-[#8EB69B] focus:outline-none focus:ring-2 focus:ring-[#8EB69B]/60 flex-1"
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            required
          />

          <button
            type="submit"
            className="px-6 py-2 bg-[#235347] hover:bg-[#8EB69B] hover:text-[#051F20] transition rounded-lg"
          >
            Submit
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {feedbacks.map((fb) => (
            <FeedbackCard key={fb.id} fb={fb} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import { FaBed, FaBath, FaDollarSign, FaMapMarkerAlt, FaEnvelope, FaRuler, FaTag, FaInfoCircle } from "react-icons/fa";

const roomTypes = ["Single", "Double", "Studio", "Suite", "Shared", "Dormitory"];
const occupancyStatuses = ["available", "occupied", "maintenance", "cleaning"];

export default function RoomForm({ initialData, onSubmit, isLoading, error }) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    room_number: initialData?.room_number || "",
    type: initialData?.type || "Single",
    monthly_rent: initialData?.monthly_rent || "",
    beds: initialData?.beds || 1,
    baths: initialData?.baths || 1,
    size: initialData?.size || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    contact_email: initialData?.contact_email || "",
    amenities: initialData?.amenities || [],
    occupancy_status: initialData?.occupancy_status || "available",
  });

  const [amenityInput, setAmenityInput] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNumberChange = (e) => {
    setForm({ ...form, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !form.amenities.includes(amenityInput.trim())) {
      setForm({
        ...form,
        amenities: [...form.amenities, amenityInput.trim()],
      });
      setAmenityInput("");
    }
  };

  const removeAmenity = (amenity) => {
    setForm({
      ...form,
      amenities: form.amenities.filter((a) => a !== amenity),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Room Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
            placeholder="e.g., Cozy Studio with Ocean View"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Room Number
          </label>
          <input
            type="text"
            name="room_number"
            value={form.room_number}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
            placeholder="e.g., 101, A-12"
          />
        </div>
      </div>

      {/* Type and Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Room Type *
          </label>
          <div className="relative">
            <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
            >
              {roomTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Monthly Rent ($) *
          </label>
          <div className="relative">
            <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="number"
              name="monthly_rent"
              value={form.monthly_rent}
              onChange={handleNumberChange}
              required
              min="0"
              step="100"
              className="w-full pl-10 pr-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Beds and Baths */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <FaBed className="inline mr-2" /> Number of Beds
          </label>
          <input
            type="number"
            name="beds"
            value={form.beds}
            onChange={handleNumberChange}
            min="1"
            className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <FaBath className="inline mr-2" /> Number of Baths
          </label>
          <input
            type="number"
            name="baths"
            value={form.baths}
            onChange={handleNumberChange}
            min="1"
            className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <FaRuler className="inline mr-2" /> Size (m²)
          </label>
          <input
            type="text"
            name="size"
            value={form.size}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
            placeholder="e.g., 45"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <FaMapMarkerAlt className="inline mr-2" /> Location *
        </label>
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
          placeholder="City, State or Full Address"
        />
      </div>

      {/* Contact Email */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <FaEnvelope className="inline mr-2" /> Contact Email
        </label>
        <input
          type="email"
          name="contact_email"
          value={form.contact_email}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
          placeholder="contact@example.com"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <FaInfoCircle className="inline mr-2" /> Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] resize-none"
          placeholder="Describe the room, amenities, neighborhood, etc..."
        />
      </div>

      {/* Occupancy Status */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Occupancy Status
        </label>
        <select
          name="occupancy_status"
          value={form.occupancy_status}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Amenities
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            className="flex-1 px-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347]"
            placeholder="e.g., WiFi, Parking, AC"
          />
          <button
            type="button"
            onClick={addAmenity}
            className="px-4 py-2 bg-[#235347] text-white rounded-lg hover:bg-[#2a7a64]"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.amenities.map((amenity, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-[#235347]/20 text-[#235347] rounded-full text-sm flex items-center gap-2"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeAmenity(amenity)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-[#235347]/30">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-[#235347] to-[#1a3f35] text-white rounded-lg font-semibold hover:from-[#2a7a64] hover:to-[#235347] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            "Save Room"
          )}
        </button>
      </div>
    </form>
  );
}

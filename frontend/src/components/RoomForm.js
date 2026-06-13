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

  // ✅ FIXED FIELD (backend expects this)
  status: initialData?.status || "available",
});

  const [amenityInput, setAmenityInput] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNumberChange = (e) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) || 0 });
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

  onSubmit({
    ...form,
    status: form.status, // backend ONLY uses this
  });
};

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* BASIC INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <input name="name" value={form.name} onChange={handleChange} placeholder="Room Name" className="input" />
        <input name="room_number" value={form.room_number} onChange={handleChange} placeholder="Room Number" className="input" />

      </div>

      {/* TYPE + PRICE */}
      <div className="grid grid-cols-2 gap-5">

        <select name="type" value={form.type} onChange={handleChange} className="input">
          {roomTypes.map(t => <option key={t}>{t}</option>)}
        </select>

        <input
          type="number"
          name="monthly_rent"
          value={form.monthly_rent}
          onChange={handleNumberChange}
          placeholder="Rent"
          className="input"
        />

      </div>

      {/* BEDS + BATHS */}
      <div className="grid grid-cols-3 gap-5">

        <input type="number" name="beds" value={form.beds} onChange={handleNumberChange} className="input" />
        <input type="number" name="baths" value={form.baths} onChange={handleNumberChange} className="input" />
        <input name="size" value={form.size} onChange={handleChange} placeholder="Size m²" className="input" />

      </div>

      {/* LOCATION */}
      <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="input" />

      {/* EMAIL */}
      <input name="contact_email" value={form.contact_email} onChange={handleChange} placeholder="Email" className="input" />

      {/* DESCRIPTION */}
      <textarea name="description" value={form.description} onChange={handleChange} className="input" />

      {/* OCCUPANCY STATUS (IMPORTANT PART) */}
     <select
  name="status"
  value={form.status}
  onChange={handleChange}
  className="input"
>
  {["available", "unavailable"].map(s => (
    <option key={s} value={s}>{s}</option>
  ))}
</select>

      {/* AMENITIES */}
      <div>
        <div className="flex gap-2">
          <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} className="input" />
          <button type="button" onClick={addAmenity}>Add</button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {form.amenities.map((a, i) => (
            <span key={i}>
              {a}
              <button type="button" onClick={() => removeAmenity(a)}>×</button>
            </span>
          ))}
        </div>
      </div>

      {/* SUBMIT */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Room"}
      </button>

    </form>
  );
}

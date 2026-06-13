"use client";

import { useState } from "react";

export default function RoomForm({
  initialData,
  onSubmit,
  isLoading,
  error,
}) {
  const [form, setForm] = useState({
    property_id: initialData?.property_id || "",
    tittle: initialData?.tittle || "",
    descrepton: initialData?.descrepton || "",
    floor: initialData?.floor || "",
    price_type: initialData?.price_type || "month",
    price: initialData?.price || 0,
    residential_water: initialData?.residential_water || "",
    electricity_prices: initialData?.electricity_prices || "",
    bed: initialData?.bed || 1,
    max_member: initialData?.max_member || 1,
    status: initialData?.status || "available",
    image: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNumberChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: Number(e.target.value) || 0,
    });
  };

  const handleFileChange = (e) => {
    setForm({
      ...form,
      image: e.target.files[0],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== undefined) {
        data.append(key, form[key]);
      }
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* TITLE */}
      <input
        name="tittle"
        value={form.tittle}
        onChange={handleChange}
        placeholder="Room Title"
        className="input"
      />

      {/* DESCRIPTION */}
      <textarea
        name="descrepton"
        value={form.descrepton}
        onChange={handleChange}
        placeholder="Description"
        className="input"
      />

      {/* PRICE + TYPE */}
      <div className="grid grid-cols-2 gap-5">
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleNumberChange}
          placeholder="Price"
          className="input"
        />

        <select
          name="price_type"
          value={form.price_type}
          onChange={handleChange}
          className="input"
        >
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      {/* BED + MAX */}
      <div className="grid grid-cols-2 gap-5">
        <input
          type="number"
          name="bed"
          value={form.bed}
          onChange={handleNumberChange}
          className="input"
          placeholder="Beds"
        />

        <input
          type="number"
          name="max_member"
          value={form.max_member}
          onChange={handleNumberChange}
          className="input"
          placeholder="Max Members"
        />
      </div>

      {/* STATUS */}
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="input"
      >
        <option value="available">Available</option>
        <option value="unavailable">Unavailable</option>
      </select>

      {/* IMAGE */}
      <input
        type="file"
        name="image"
        onChange={handleFileChange}
        className="input"
      />

      {/* SUBMIT */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Room"}
      </button>
    </form>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaBuilding, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaSave, FaArrowLeft, FaHome, FaInfoCircle, FaCity, FaGlobe } from "react-icons/fa";

export default function EditProperty() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    address: "",
    city: "",
    country: "",
    owner_id: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ================= FETCH PROPERTY =================
  useEffect(() => {
    if (!id || !token) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();

        const property = data.property;

        if (!property) throw new Error("Property not found");

        setFormData({
          name: property.name || "",
          description: property.description || "",
          type: property.type || "",
          address: property.address || "",
          city: property.city || "",
          country: property.country || "",
          owner_id: property.owner_id || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, token]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ================= UPDATE PROPERTY =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            type: formData.type,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            owner_id: formData.owner_id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Update failed");

      setSuccess("Property updated successfully!");
      
      setTimeout(() => {
        router.push("/dashboard/admin/property");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="bg-[#0a2a2b] rounded-xl border border-[#235347]/30 shadow-lg overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#235347] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm mt-3">Loading property...</p>
        </div>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="bg-[#0a2a2b] rounded-xl border border-[#235347]/30 shadow-lg overflow-hidden">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-[#235347]/30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-[#235347] transition-colors"
          >
            <FaArrowLeft size={20} />
          </button>

          <div>
            <h3 className="text-xl font-bold text-white">
              Edit Property
            </h3>
            <p className="text-gray-400 text-sm mt-1">Update property information</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-2 bg-gradient-to-r from-[#235347] to-[#1a3f35] text-white rounded-lg text-sm hover:from-[#2a7a64] hover:to-[#235347] transition-all duration-300 flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          <FaSave size={14} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold flex items-center gap-2 border-b border-[#235347]/30 pb-2">
              <FaBuilding className="text-[#235347]" />
              Property Details
            </h4>

            {/* NAME */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Property Name *
              </label>
              <div className="relative">
                <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
                  placeholder="Enter property name"
                />
              </div>
            </div>

            {/* TYPE */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Property Type
              </label>
              <div className="relative">
                <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
                  placeholder="e.g., Apartment, House, Villa"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Description
              </label>
              <div className="relative">
                <FaInfoCircle className="absolute left-3 top-3 text-gray-500 text-sm" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full pl-10 pr-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
                  placeholder="Describe the property..."
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold flex items-center gap-2 border-b border-[#235347]/30 pb-2">
              <FaMapMarkerAlt className="text-[#235347]" />
              Location & Owner
            </h4>

            {/* ADDRESS */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
                placeholder="Street address"
              />
            </div>

            {/* CITY & COUNTRY */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  City
                </label>
                <div className="relative">
                  <FaCity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
                    placeholder="City"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Country
                </label>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* OWNER ID */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Owner ID
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  name="owner_id"
                  value={formData.owner_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
                  placeholder="Owner ID"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
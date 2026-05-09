"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaArrowLeft, 
  FaSave, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaInfoCircle, 
  FaHome, 
  FaHotel, 
  FaCity,
  FaUser,
  FaTags
} from "react-icons/fa";

export default function CreateProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "apartment",
    address: "",
    city: "",
    country: "",
    owner_id: "",
  });
  
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch owners for admin assignment
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?role=owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const ownerList = Array.isArray(data) ? data : data?.users || data?.data || [];
        setOwners(ownerList);
      } catch (err) {
        console.error("Error fetching owners:", err);
      } finally {
        setLoadingOwners(false);
      }
    };
    
    if (token) {
      fetchOwners();
    }
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setLoading(true);
    setError("");
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            type: form.type,
            address: form.address,
            city: form.city,
            country: form.country,
            owner_id: form.owner_id || null,
          }),
        }
      );
  
      // VERY IMPORTANT
      const text = await res.text();
  
      let data;
  
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Server returned HTML:", text);
        throw new Error("Server returned invalid JSON");
      }
  
      if (!res.ok) {
        throw new Error(data.message || "Failed to create property");
      }
  
      console.log("PROPERTY CREATED:", data);
  
      // redirect
      router.push("/dashboard/admin/property");
  
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const getTypeIcon = (type) => {
    switch (type) {
      case "hotel": return <FaHotel className="text-purple-400" />;
      case "apartment": return <FaCity className="text-blue-400" />;
      default: return <FaBuilding className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-[#0a2a2b] rounded-xl border border-[#235347]/30 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-[#235347]/30">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#235347] transition-colors mb-4"
        >
          <FaArrowLeft size={16} /> Back
        </button>
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#235347] to-[#1a3f35] rounded-xl shadow-lg shadow-[#235347]/30">
            <FaBuilding className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Add New Property</h1>
            <p className="text-gray-400 text-sm mt-1">Create a new property listing</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Property Name */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Property Name *
          </label>
          <div className="relative">
            <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] transition-colors"
              placeholder="e.g., Beachfront Paradise"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Description
          </label>
          <div className="relative">
            <FaInfoCircle className="absolute left-3 top-3 text-gray-500" />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full pl-10 pr-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] resize-none transition-colors"
              placeholder="Describe the property..."
            />
          </div>
        </div>

        {/* Property Type & Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Property Type *
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] transition-colors"
            >
              <option value="hotel">🏨 Hotel</option>
              <option value="apartment">🏠 Apartment</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Address *
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] transition-colors"
                placeholder="Street address"
              />
            </div>
          </div>
        </div>

        {/* City & Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] transition-colors"
              placeholder="New York"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Country *
            </label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] transition-colors"
              placeholder="USA"
            />
          </div>
        </div>

        {/* Assign Owner */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <FaUser className="inline mr-2 text-gray-500" />
            Assign to Owner (Admin only)
          </label>
          <select
            name="owner_id"
            value={form.owner_id}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] transition-colors"
          >
            <option value="">-- Select Owner (Leave empty for yourself) --</option>
            {loadingOwners ? (
              <option disabled>Loading owners...</option>
            ) : (
              owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))
            )}
          </select>
          <p className="text-gray-500 text-xs mt-1">Leave empty to assign to yourself</p>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#235347]/30">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#235347] to-[#1a3f35] text-white rounded-lg font-semibold hover:from-[#2a7a64] hover:to-[#235347] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#235347]/20"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <FaSave size={16} />
                Create Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
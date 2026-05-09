"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  FaBed, 
  FaUsers, 
  FaDollarSign, 
  FaSave, 
  FaInfoCircle,
  FaArrowLeft,
  FaHome,
  FaDoorOpen,
  FaUserFriends,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaImage,
  FaTrash,
  FaUpload,
  FaSpinner,
  FaBuilding
} from "react-icons/fa";
import Image from "next/image";

export default function CreateUnit() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState({
    name: "",
    type: "entire_place",
    capacity: 2,
    price_per_night: "",
    description: "",
  });

  const [image, setImage] = useState(null);

  const token = typeof window !== "undefined" 
    ? localStorage.getItem("token") 
    : null;

  // ================= FETCH PROPERTY =================
  useEffect(() => {
    if (!propertyId || !token) {
      if (!propertyId) setError("No property selected");
      if (!token) setError("Authentication required");
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/properties/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        let data;
        try {
          data = await res.json();
        } catch (err) {
          throw new Error("Invalid server response");
        }

        if (!res.ok) {
          throw new Error(data.message || data.error || "Failed to load property");
        }

        setProperty(data.property || data);
      } catch (err) {
        console.error("Fetch property error:", err);
        setError(err.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, token]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  // ================= HANDLE IMAGE SELECTION =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    setImage(file);
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ================= REMOVE IMAGE =================
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
  };

  // ================= CREATE UNIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      setError("Unit name is required");
      return;
    }
    
    if (!form.price_per_night) {
      setError("Price per night is required");
      return;
    }

    if (Number(form.price_per_night) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    if (Number(form.capacity) < 1) {
      setError("Capacity must be at least 1");
      return;
    }

    setSubmitting(true);
    setError("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      formData.append("name", form.name.trim());
      formData.append("type", form.type);
      formData.append("capacity", Number(form.capacity));
      formData.append("price_per_night", Number(form.price_per_night));
      formData.append("property_id", propertyId);
      
      if (form.description.trim()) {
        formData.append("description", form.description.trim());
      }
      
      if (image) {
        formData.append("image", image);
      }

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error("Server returned invalid response");
      }

      if (!res.ok) {
        if (data.errors) {
          const validationErrors = Object.values(data.errors).flat().join(", ");
          throw new Error(validationErrors);
        }
        throw new Error(data.message || data.error || "Failed to create unit");
      }

      router.push(`/dashboard/admin/property`);
      
    } catch (err) {
      console.error("Create unit error:", err);
      setError(err.message || "Failed to create unit. Please try again.");
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="bg-[#0a2a2b] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#235347] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  // ================= ERROR STATES =================
  if (!propertyId) {
    return (
      <div className="bg-[#0a2a2b] min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center max-w-md">
          <FaExclamationTriangle className="text-red-400 text-5xl mx-auto mb-3" />
          <h2 className="text-red-400 text-xl font-semibold mb-2">No Property Selected</h2>
          <p className="text-gray-400 mb-4">Please select a property before creating a unit.</p>
          <button
            onClick={() => router.push("/dashboard/admin/properties")}
            className="px-4 py-2 bg-[#235347] hover:bg-[#1a3f35] rounded-lg transition-colors text-white"
          >
            Go to Properties
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-[#0a2a2b] min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center max-w-md">
          <FaExclamationTriangle className="text-yellow-400 text-5xl mx-auto mb-3" />
          <h2 className="text-yellow-400 text-xl font-semibold mb-2">Property Not Found</h2>
          <p className="text-gray-400 mb-4">The property you're trying to add a unit to doesn't exist.</p>
          <button
            onClick={() => router.push("/dashboard/admin/properties")}
            className="px-4 py-2 bg-[#235347] hover:bg-[#1a3f35] rounded-lg transition-colors text-white"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="bg-[#0a2a2b] min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-[#051F20] hover:bg-[#0a2a2b] rounded-lg transition-all duration-200 text-gray-300 hover:text-white border border-[#235347]/30"
          >
            <FaArrowLeft className="text-sm" />
            <span>Back</span>
          </button>
          
          <div className="bg-[#235347]/10 border border-[#235347]/30 rounded-lg px-4 py-2">
            <span className="text-[#235347] text-sm">Property: {property?.name}</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#051F20] rounded-2xl shadow-2xl border border-[#235347]/30 overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#235347] to-[#1a3f35] px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <FaBuilding className="text-white/80 text-2xl" />
              <h1 className="text-2xl font-bold text-white">Create New Unit</h1>
            </div>
            <p className="text-[#a8d5ba]">
              Adding unit to property: <span className="font-semibold text-white">{property?.name}</span>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-6 mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <FaExclamationTriangle className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {submitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mx-6 mt-6">
              <div className="bg-[#0a2a2b] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#235347] h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">Uploading... {uploadProgress}%</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Unit Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300 font-medium">
                <FaBed className="text-[#235347]" />
                Unit Name
                <span className="text-red-400 text-sm">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Ocean View Suite, Garden Room, Penthouse"
                value={form.name}
                onChange={handleChange}
                required
                maxLength="100"
                className="w-full px-4 py-3 bg-[#0a2a2b] border border-[#235347]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent text-white placeholder-gray-500 transition-all"
              />
              <p className="text-xs text-gray-500">
                {form.name.length}/100 characters - Give your unit a descriptive name
              </p>
            </div>

            {/* Unit Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300 font-medium">
                <FaDoorOpen className="text-[#235347]" />
                Unit Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a2a2b] border border-[#235347]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent text-white transition-all cursor-pointer"
              >
                <option value="entire_place">🏠 Entire Place - Complete privacy</option>
                <option value="private_room">🚪 Private Room - Private bedroom with shared common areas</option>
                <option value="shared_room">👥 Shared Room - Shared sleeping space</option>
              </select>
              <p className="text-xs text-gray-500">
                Choose the type that best describes this unit
              </p>
            </div>

            {/* Capacity & Price - 2 Column Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Capacity */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-300 font-medium">
                  <FaUsers className="text-[#235347]" />
                  Maximum Capacity
                  <span className="text-red-400 text-sm">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserFriends className="text-gray-500 text-sm" />
                  </div>
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    max="20"
                    value={form.capacity}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#0a2a2b] border border-[#235347]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent text-white transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500">Number of guests this unit can accommodate</p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-300 font-medium">
                  <FaDollarSign className="text-[#235347]" />
                  Price per Night
                  <span className="text-red-400 text-sm">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="price_per_night"
                    min="0"
                    max="10000"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price_per_night}
                    onChange={handleChange}
                    required
                    className="w-full pl-7 pr-4 py-3 bg-[#0a2a2b] border border-[#235347]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent text-white placeholder-gray-500 transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500">Set the nightly rate for this unit (USD)</p>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300 font-medium">
                <FaImage className="text-[#235347]" />
                Unit Image
              </label>
              
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden bg-[#0a2a2b]">
                  <div className="relative h-48 w-full">
                    <Image
                      src={imagePreview}
                      alt="Unit preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <FaTrash className="text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#235347]/40 rounded-lg cursor-pointer hover:border-[#235347] transition-colors bg-[#0a2a2b]/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="text-gray-400 text-2xl mb-2" />
                    <p className="text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP (MAX. 2MB)</p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300 font-medium">
                <FaFileAlt className="text-[#235347]" />
                Description
              </label>
              <textarea
                name="description"
                rows="5"
                maxLength="2000"
                placeholder="Describe the unit, amenities, special features, and what guests can expect..."
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a2a2b] border border-[#235347]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent text-white placeholder-gray-500 transition-all resize-none"
              />
              <p className="text-xs text-gray-500">
                {form.description.length}/2000 characters - Provide detailed information about this unit
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-[#235347]/5 border border-[#235347]/20 rounded-lg p-4 flex items-start gap-3">
              <FaInfoCircle className="text-[#235347] text-xl flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-[#235347] mb-1">Quick Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Ensure the unit name is unique within this property</li>
                  <li>Set competitive pricing based on local market rates</li>
                  <li>Include key amenities in the description</li>
                  <li>Add a high-quality image to attract more bookings</li>
                  <li>You can add more photos and amenities after creating the unit</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-[#0a2a2b] hover:bg-[#0d3536] rounded-lg transition-all duration-200 font-medium text-gray-300 hover:text-white border border-[#235347]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#235347] to-[#1a3f35] hover:from-[#2a7a64] hover:to-[#235347] rounded-lg transition-all duration-200 font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating Unit...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Create Unit
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Live Preview Section */}
        {(form.name || form.price_per_night || form.description) && (
          <div className="mt-6 bg-[#051F20] rounded-xl border border-[#235347]/30 p-6">
            <h3 className="text-gray-300 font-medium mb-3 flex items-center gap-2">
              <FaCheckCircle className="text-[#235347]" />
              Live Preview
            </h3>
            <div className="bg-[#0a2a2b] rounded-lg p-4">
              <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg">
                    {form.name || "Unit Name"}
                  </p>
                  <p className="text-gray-400 text-sm capitalize">
                    {form.type.replace(/_/g, ' ')}
                  </p>
                </div>
                {form.price_per_night && (
                  <div className="text-right">
                    <p className="text-[#235347] font-bold text-xl">${form.price_per_night}</p>
                    <p className="text-gray-500 text-xs">per night</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaUsers />
                <span>Sleeps {form.capacity} {form.capacity === 1 ? 'guest' : 'guests'}</span>
              </div>
              {form.description && (
                <p className="text-gray-400 text-sm mt-3 line-clamp-2">
                  {form.description}
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
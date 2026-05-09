"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaEnvelope, FaLock, FaUserTag, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";

export default function CreateUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status,
        }),
      });
      
      if (response.ok) {
        router.push("/dashboard/admin/User");
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || "Failed to create user" });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#235347] transition-colors mb-4"
        >
          <FaArrowLeft size={16} />
          <span className="text-sm">Back to Users</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#235347] to-[#1a3f35] rounded-xl shadow-lg shadow-[#235347]/30">
            <FaUserPlus className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New User</h1>
            <p className="text-gray-400 text-sm mt-1">Add a new user to the system</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#0a2a2b] rounded-xl border border-[#235347]/30 shadow-lg overflow-hidden">
        <div className="p-6 space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaUserTag size={16} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#051F20] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.name 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-[#235347]/40 focus:border-[#235347] focus:ring-[#235347]/20"
                }`}
                placeholder="Enter full name"
              />
            </div>
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaEnvelope size={16} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#051F20] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.email 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-[#235347]/40 focus:border-[#235347] focus:ring-[#235347]/20"
                }`}
                placeholder="user@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaLock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2.5 bg-[#051F20] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.password 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-[#235347]/40 focus:border-[#235347] focus:ring-[#235347]/20"
                }`}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaLock size={16} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2.5 bg-[#051F20] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.confirmPassword 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                    : "border-[#235347]/40 focus:border-[#235347] focus:ring-[#235347]/20"
                }`}
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              User Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
            >
              <option value="user">Regular User</option>
              <option value="owner">Property Owner</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Account Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 border-t border-[#235347]/30 bg-[#051F20]/50 flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#235347] to-[#1a3f35] text-white rounded-lg hover:from-[#2a7a64] hover:to-[#235347] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <FaUserPlus size={16} />
                Create User
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-[#0a2a2b]/50 rounded-lg border border-[#235347]/20">
        <p className="text-gray-400 text-xs text-center">
          <span className="text-[#235347] font-medium">Note:</span> New users will receive a welcome email with their login credentials.
          Administrators have full access to all system features.
        </p>
      </div>
    </div>
  );
}
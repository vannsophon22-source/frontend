"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FaUserEdit,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [errors, setErrors] = useState({});

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ---------------- FETCH USER ---------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        const user = data.users.find((u) => u.id == id);

        if (user) {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            role: user.role || "user",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    if (id && token) fetchUser();
  }, [id, token]);

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ---------------- VALIDATE ---------------- */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name required";
    if (!formData.email.trim()) newErrors.email = "Email required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- UPDATE USER ---------------- */
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      router.push("/dashboard/admin/User");
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-white text-center mt-10">Loading user...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#235347] mb-4"
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#235347] to-[#1a3f35] rounded-xl">
            <FaUserEdit className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit User</h1>
            <p className="text-gray-400 text-sm">Update user information</p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleUpdate}
        className="bg-[#0a2a2b] rounded-xl border border-[#235347]/30 shadow-lg overflow-hidden"
      >
        <div className="p-6 space-y-5">

          {/* NAME */}
          <div>
            <label className="text-gray-300 text-sm">Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white"
            />
            {errors.name && (
              <p className="text-red-400 text-xs">{errors.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-gray-300 text-sm">
              New Password (optional)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* ROLE */}
          <div>
            <label className="text-gray-300 text-sm">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white"
            >
              <option value="user">User</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* ERROR */}
          {errors.submit && (
            <p className="text-red-400 text-sm">{errors.submit}</p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="px-6 py-4 border-t border-[#235347]/30 flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-700 text-white py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#235347] text-white py-2 rounded-lg"
          >
            {loading ? "Updating..." : "Update User"}
          </button>
        </div>
      </form>
    </div>
  );
}
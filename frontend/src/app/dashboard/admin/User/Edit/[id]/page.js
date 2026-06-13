"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ---------------- FETCH USER ---------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        const user = data.users.find((u) => u.id == id);

        if (user) {
          setFormData({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
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
    const { name, value } = e.target;

    // enforce max length = backend rule
    if ((name === "first_name" || name === "last_name") && value.length > 25) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- VALIDATION (MATCH BACKEND) ---------------- */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";

    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- UPDATE ---------------- */
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
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
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto text-white">

      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 mb-4"
      >
        <FaArrowLeft />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Edit User</h1>

      <form onSubmit={handleUpdate} className="space-y-4">

        {/* FIRST NAME */}
        <div>
          <label>First Name *</label>
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="input"
            maxLength={25}
          />
          {errors.first_name && (
            <p className="text-red-400 text-sm">{errors.first_name}</p>
          )}
        </div>

        {/* LAST NAME */}
        <div>
          <label>Last Name *</label>
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="input"
            maxLength={25}
          />
          {errors.last_name && (
            <p className="text-red-400 text-sm">{errors.last_name}</p>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <label>Email *</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label>Password (optional)</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}
        </div>

        {/* ROLE */}
        <div>
          <label>Role *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input"
          >
            <option value="user">User</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* ERROR */}
        {errors.submit && (
          <p className="text-red-400">{errors.submit}</p>
        )}

        {/* BUTTONS */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#235347] py-2 rounded-lg"
        >
          {loading ? "Updating..." : "Update User"}
        </button>

      </form>
    </div>
  );
}

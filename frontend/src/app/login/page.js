// src/app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginApi } from "@/utils/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginApi(email, password);

      if (response.access_token && response.user) {
        // ✅ SAVE TO LOCALSTORAGE (auth store)
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // save user in context
        setUser(response.user);

        // ROLE-BASED REDIRECT
        if (response.user.role === "admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/user/homepage");
        }
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#051F20] to-[#0a3d3f]">
      <div className="bg-[#0a2a2b] p-8 rounded-2xl shadow-2xl w-96 border border-[#235347]/30">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-50 flex items-center justify-center mb-3">
            <img
              src="/images/logo.png"
              alt="FindRoommate Logo"
              className="h-10 md:h-9 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#051F20] text-white border border-[#235347]/40 focus:outline-none focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/20 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#051F20] text-white border border-[#235347]/40 focus:outline-none focus:border-[#235347] focus:ring-2 focus:ring-[#235347]/20 transition-all pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded bg-[#051F20] border-[#235347]/40 text-[#235347] focus:ring-[#235347]/20"
              />
              <span className="ml-2 text-sm text-gray-400">Remember me</span>
            </label>
            <a
              href="#"
              className="text-sm text-[#235347] hover:text-[#2a7a64] transition"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#235347] to-[#1a3f35] text-white py-2.5 rounded-lg hover:from-[#2a7a64] hover:to-[#235347] transition-all duration-300 disabled:opacity-50 font-medium shadow-lg"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-[#235347] hover:text-[#2a7a64] font-medium transition"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

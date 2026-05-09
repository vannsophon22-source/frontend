"use client";

import { useEffect, useState } from "react";
import { fetchUsers } from "@/utils/api";
import { FaUserPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [showForm, setShowForm] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ---------------- FETCH USERS ----------------
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchUsers(token);

      const userList = Array.isArray(data)
        ? data
        : data?.users
        ? data.users
        : data?.data
        ? data.data
        : [];

      setUsers(userList);
    } catch (err) {
      setError(err.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadUsers();
  }, [token]);

  // ---------------- FILTER ----------------
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------------- CREATE / UPDATE USER ----------------
  const handleSaveUser = async () => {
    try {
      const url = form.id
        ? `${process.env.NEXT_PUBLIC_API_URL}/users/${form.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/users`;

      const method = form.id ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      setShowForm(false);
      setForm({ id: null, name: "", email: "", password: "", role: "user" });

      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- DELETE USER ----------------
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- EDIT USER ----------------
  const handleEdit = (user) => {
    router.push(`/dashboard/admin/User/Edit/${user.id}`);
  };

  // ---------------- CREATE USER ----------------
  const router = useRouter();

  return (
    <div className="bg-[#0a2a2b] rounded-xl border border-[#235347]/30 shadow-lg overflow-hidden">

      {/* HEADER (UNCHANGED UI) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-[#235347]/30">
        <div>
          <h3 className="text-xl font-bold text-white">User Management</h3>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor all users</p>
        </div>

        <button
  onClick={() => router.push('/dashboard/admin/User/create')}
  className="px-4 py-2 bg-gradient-to-r from-[#235347] to-[#1a3f35] text-white rounded-lg text-sm hover:from-[#2a7a64] hover:to-[#235347] transition-all duration-300 flex items-center gap-2 shadow-lg"
>
  <FaUserPlus size={14} />
  Add User
</button>
      </div>

      {/* SEARCH (UNCHANGED UI) */}
      <div className="p-6 border-b border-[#235347]/30">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#051F20] border border-[#235347]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#235347] focus:ring-1 focus:ring-[#235347]/20 transition-all"
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#235347] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm mt-3">Loading users...</p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="m-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#051F20]">
              <tr className="border-b border-[#235347]/30">
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Role</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#235347]/20">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#051F20]/50 transition-colors">
                  
                  <td className="px-6 py-4 text-white text-sm font-medium">
                    {user.name}
                  </td>

                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {user.email}
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-green-400 text-xs">active</span>
                  </td>

                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-gray-400 hover:text-[#235347]"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FOOTER */}
      {!loading && !error && (
        <div className="px-6 py-4 border-t border-[#235347]/30 bg-[#051F20]/50 text-sm text-gray-400">
          Total Users: {users.length}
        </div>
      )}
    </div>
  );
}
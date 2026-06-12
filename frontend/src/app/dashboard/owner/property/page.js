"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
//import { jwtDecode } from "jwt-decode";
import { fetchPropertiesApi } from "@/utils/api";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBuilding,
  FaMapMarkerAlt,
  FaUser,
  FaDoorOpen,
  FaUsers,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaBed,
  FaHome,
} from "react-icons/fa";

export default function PropertiesAdminTable() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // --- HELPER FUNCTIONS ---
  const getTypeIcon = (type) => {
    switch (type) {
      case "apartment":
        return <FaBuilding className="text-emerald-400" />;
      case "house":
        return <FaHome className="text-emerald-400" />;
      default:
        return <FaBed className="text-emerald-400" />;
    }
  };

  const getStatusColor = (status) => {
    return status === "available"
      ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
      : "border-amber-500/50 text-amber-400 bg-amber-500/10";
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Use the variable name you imported above
      const response = await fetchPropertiesApi();
      setProperties(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load properties.");
    } finally {
      setLoading(false);
    }
  };
  const deleteProperty = async (id) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      await deletePropertyApi(id);
      fetchProperties(); // Refresh the list after deletion
    } catch (err) {
      alert("Failed to delete property.");
    }
  };

  const deleteUnit = async (unitId) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    try {
      await deleteUnitApi(unitId);
      fetchProperties(); // Refresh the list
    } catch (err) {
      alert("Failed to delete unit.");
    }
  };

  useEffect(() => {
    if (token) fetchProperties();
  }, [token]);

  // --- COMPUTED DATA ---
  const filteredProperties = useMemo(() => {
    return properties.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [properties, searchTerm]);
  return (
    <div className="bg-gradient-to-br from-[#0a2a2b] to-[#0d3537] rounded-2xl shadow-2xl overflow-hidden">
      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-[#0a2a2b] to-[#0d3537] border-b border-emerald-500/20">
        <div className="absolute top-0 right-0 w-96 h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                <FaBuilding className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
                  Properties Management
                </h3>
                <p className="text-emerald-300/70 text-sm mt-1">
                  Manage all properties and their units
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard/owner/property/create")}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg transform hover:scale-105"
          >
            <FaPlus size={14} /> Add Property
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-8 py-6 border-b border-emerald-500/20 bg-white/5">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 text-sm" />
          <input
            type="text"
            placeholder="Search by property name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#051F20] border border-emerald-500/30 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* LOADING / ERROR */}
      {loading && (
        <div className="p-20 text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-300/70 text-sm mt-4">
            Loading properties...
          </p>
        </div>
      )}

      {error && (
        <div className="m-8 p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl">
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#051F20]">
              <tr className="border-b border-emerald-500/20">
                <th className="px-6 py-4 text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10">
              {filteredProperties.map((property) => (
                <React.Fragment key={property.id}>
                  <tr className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-md">
                          <FaBuilding className="text-white text-sm" />
                        </div>
                        <span className="text-white text-sm font-semibold group-hover:text-emerald-400">
                          {property.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-emerald-400 text-xs" />
                        <span className="text-gray-300 text-sm">
                          {property.location
                            ? `${property.location}, ${property.city || ""}`
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-emerald-400 text-xs" />
                        <span className="text-gray-300 text-sm">
                          {property.user
                            ? `${property.user.first_name} ${property.user.last_name}`
                            : "Unknown Owner"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                        {property.units?.length || 0} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === property.id ? null : property.id
                            )
                          }
                          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                        >
                          {expandedId === property.id ? (
                            <FaChevronUp size={14} />
                          ) : (
                            <FaChevronDown size={14} />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/owner/property/${property.id}/edit`
                            )
                          }
                          className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expandable Units Row */}
                  {expandedId === property.id && (
                    <tr className="bg-white/5">
                      <td colSpan="5" className="px-6 py-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-base font-semibold text-white flex items-center gap-2">
                              <FaDoorOpen className="text-emerald-400" /> Units
                              in {property.name}
                            </h4>
                            <button
                              onClick={() =>
                                router.push(
                                  `/dashboard/owner/property/${property.id}/units/create`
                                )
                              }
                              className="text-sm px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg"
                            >
                              + Add Unit
                            </button>
                          </div>
                          {/* Unit Cards Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {property.units?.map((unit) => (
                              <div
                                key={unit.id}
                                className="bg-[#0a2a2b] rounded-xl p-4 border border-emerald-500/20"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(unit.type)}{" "}
                                    <span className="text-white font-medium">
                                      {unit.name}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                                      unit.status
                                    )}`}
                                  >
                                    {unit.status}
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-400">
                                  <p>Price: ${unit.price_per_night}/night</p>
                                  <p>Capacity: {unit.capacity} guests</p>
                                </div>
                                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-emerald-500/20">
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/owner/property/${property.id}/units/${unit.id}/edit`
                                      )
                                    }
                                    className="text-emerald-400 hover:text-emerald-300 p-1"
                                  >
                                    <FaEdit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUnit(unit.id)}
                                    className="text-rose-400 hover:text-rose-300 p-1"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

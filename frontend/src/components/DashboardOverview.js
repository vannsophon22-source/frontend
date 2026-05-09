'use client';

import React, { useState, useEffect } from 'react';
import { Home, Users, Building, DollarSign, TrendingUp, User, Bed, Calendar, CheckCircle, XCircle } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

/* ---------------- SORTABLE CARD ---------------- */
function SortableCard({ item, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */
export default function DashboardOverview() {
  const [stats, setStats] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        /* USERS */
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = await userRes.json();
        const users = userData?.users || [];

        const total = users.length;
        const owners = users.filter((u) => u.role === 'owner').length;

        setTotalUsers(total);

        /* ROOMS */
        const roomRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const roomData = await roomRes.json();
        const rooms = roomData?.data || roomData || [];

        setTotalRooms(rooms.length);

        /* STATS */
        setStats([
          {
            id: 'rooms',
            title: 'Total Rooms',
            value: rooms.length,
            icon: Bed,
            color: '#235347',
          },
          {
            id: 'owners',
            title: 'Property Owners',
            value: owners,
            icon: User,
            color: '#235347',
          },
          {
            id: 'users',
            title: 'Total Users',
            value: total,
            icon: Users,
            color: '#2a7a64',
          },
          {
            id: 'monthly',
            title: 'Monthly Revenue',
            value: '$4,850',
            icon: DollarSign,
            color: '#f59e0b',
          },
        ]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  /* ---------------- DRAG SENSOR ---------------- */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = stats.findIndex((i) => i.id === active.id);
    const newIndex = stats.findIndex((i) => i.id === over.id);

    const updated = [...stats];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);

    setStats(updated);
  }

  // Graph data
  const revenueData = [
    { month: 'Jan', revenue: 4200, occupancy: 65 },
    { month: 'Feb', revenue: 4300, occupancy: 68 },
    { month: 'Mar', revenue: 4500, occupancy: 72 },
    { month: 'Apr', revenue: 4600, occupancy: 75 },
    { month: 'May', revenue: 4800, occupancy: 78 },
    { month: 'Jun', revenue: 4850, occupancy: 80 },
    { month: 'Jul', revenue: 4900, occupancy: 82 },
  ];

  const occupancyData = [
    { day: 'Mon', occupied: 6, available: 6 },
    { day: 'Tue', occupied: 7, available: 5 },
    { day: 'Wed', occupied: 7, available: 5 },
    { day: 'Thu', occupied: 6, available: 6 },
    { day: 'Fri', occupied: 8, available: 4 },
    { day: 'Sat', occupied: 8, available: 4 },
    { day: 'Sun', occupied: 7, available: 5 },
  ];

  const roomTypeData = [
    { name: 'Hotel Rooms', value: 8, color: '#235347' },
    { name: 'Monthly Rentals', value: 4, color: '#2a7a64' },
  ];
  

  const recentBookings = [
    { id: 1, room: 'Deluxe Suite', user: 'John Doe', date: '2024-01-15', status: 'confirmed' },
    { id: 2, room: 'Standard Room', user: 'Jane Smith', date: '2024-01-14', status: 'pending' },
    { id: 3, room: 'Monthly Rental', user: 'Mike Johnson', date: '2024-01-14', status: 'confirmed' },
    { id: 4, room: 'Family Room', user: 'Sarah Williams', date: '2024-01-13', status: 'cancelled' },
  ];

  // sensors
  

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <p className="text-gray-400 text-sm">Drag cards to reorder</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={stats} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stats.map((item) => (
              <SortableCard key={item.id} item={item}>
                <div className="bg-[#0a2a2b] p-5 rounded-xl border border-[#235347]/30 hover:border-[#235347] transition-all duration-300 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-[#051F20]`}>
                      <item.icon size={24} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{item.title}</p>
                      <p className="text-2xl font-bold text-white">{item.value}</p>
                    </div>
                  </div>
                </div>
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Graph Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-[#0a2a2b] p-6 rounded-xl border border-[#235347]/30 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
              <p className="text-gray-400 text-sm">Monthly revenue over time</p>
            </div>
            <div className="flex items-center gap-2 text-[#235347]">
              <TrendingUp size={20} />
              <span className="font-medium">+15.2%</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f3a3b" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    backgroundColor: '#0a2a2b',
                    border: '1px solid #235347',
                    borderRadius: '0.5rem',
                    color: 'white',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#235347"
                  fill="#23534720"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Occupancy Chart */}
        <div className="bg-[#0a2a2b] p-6 rounded-xl border border-[#235347]/30 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Weekly Occupancy</h3>
              <p className="text-gray-400 text-sm">Room occupancy this week</p>
            </div>
            <div className="text-sm text-gray-400">
              <span className="font-medium text-[#235347]">7 occupied</span>
              {' '}/ 12 total
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f3a3b" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  domain={[0, 12]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#0a2a2b',
                    border: '1px solid #235347',
                    borderRadius: '0.5rem',
                    color: 'white',
                  }}
                />
                <Bar
                  dataKey="occupied"
                  name="Occupied Rooms"
                  fill="#235347"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Room Type Distribution & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Type Distribution */}
        <div className="bg-[#0a2a2b] p-6 rounded-xl border border-[#235347]/30 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Room Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roomTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a2a2b',
                    border: '1px solid #235347',
                    borderRadius: '0.5rem',
                    color: 'white',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {roomTypeData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400 text-sm">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-[#0a2a2b] p-6 rounded-xl border border-[#235347]/30 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-[#051F20] rounded-lg border border-[#235347]/20">
                <div>
                  <p className="text-white font-medium">{booking.room}</p>
                  <p className="text-gray-400 text-xs">{booking.user} • {booking.date}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                  booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#235347] to-[#1a3f35] p-6 rounded-xl shadow-lg">
          <p className="text-white/80 text-sm font-medium">Avg. Monthly Growth</p>
          <p className="text-3xl font-bold text-white mt-2">+2.8%</p>
          <p className="text-white/60 text-xs mt-1">Compared to last month</p>
        </div>
        <div className="bg-[#0a2a2b] p-6 rounded-xl border border-[#235347]/30 shadow-lg">
          <p className="text-gray-400 text-sm font-medium">Occupancy Rate</p>
          <p className="text-3xl font-bold text-white mt-2">58.3%</p>
          <p className="text-gray-500 text-xs mt-1">7 of 12 rooms occupied</p>
        </div>
        <div className="bg-[#0a2a2b] p-6 rounded-xl border border-[#235347]/30 shadow-lg">
          <p className="text-gray-400 text-sm font-medium">Total Revenue YTD</p>
          <p className="text-3xl font-bold text-white mt-2">$31,500</p>
          <p className="text-gray-500 text-xs mt-1">January - July 2024</p>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import AdminSidebara from '@/components/AdminSidebar'
import AdminHeaderSimple from '@/components/AdminHeader';

export default function AdminLayout({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex bg-gradient-to-br from-[#051F20] to-[#0a3d3f] min-h-screen">
      <AdminSidebara
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <div className="flex-1 flex flex-col">
        <AdminHeaderSimple onSearch={() => {}} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
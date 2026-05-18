import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased">
      {/* Dynamic Sidebar Panel */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />

      {/* Main Workspace Frame */}
      <div className="flex flex-col md:pl-64 min-h-screen">
        {/* Unified Application Header */}
        <Header toggleSidebar={setSidebarOpen} />

        {/* Router Viewport Outlet */}
        <main className="flex-1 p-6 md:p-8 bg-[#080C14] overflow-y-auto">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Responsive mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden transition-all duration-300"
        ></div>
      )}
    </div>
  );
};

export default MainLayout;

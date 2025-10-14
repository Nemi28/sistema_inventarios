import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Toggle collapse button - Desktop only */}
      <button
        onClick={toggleCollapse}
        className={`
          hidden lg:block fixed bottom-4 z-50 p-2 rounded-full 
          bg-blue-600 text-white shadow-lg hover:bg-blue-700 
          transition-all duration-300
          ${isSidebarCollapsed ? 'left-14' : 'left-60'}
        `}
        title={isSidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
      >
        <svg
          className={`w-5 h-5 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </div>
  );
};

export default MainLayout;
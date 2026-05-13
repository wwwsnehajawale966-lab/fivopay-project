import React, { useState } from 'react';
import ResponsiveSidebar from './ResponsiveSidebar';
import HamburgerMenu from './HamburgerMenu';

const ResponsiveLayout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#ECFEFF' }}>
      {/* Mobile Header with Hamburger Menu */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b" style={{ borderColor: '#D1FAE5', backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: '#FFFFFF' }}>
            <span className="text-sm font-bold">FP</span>
          </div>
          <h1 className="text-lg font-bold" style={{ color: '#0F172A' }}>FivoPay</h1>
        </div>
        <HamburgerMenu onClick={toggleSidebar} isOpen={sidebarOpen} />
      </header>

      {/* Sidebar - Hidden by default on mobile, visible on desktop */}
      <ResponsiveSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:ml-0" style={{ backgroundColor: '#ECFEFF' }}>
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between p-4 border-b" style={{ borderColor: '#D1FAE5', backgroundColor: '#FFFFFF' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: '#FFFFFF' }}>
              <span className="text-sm font-bold">FP</span>
            </div>
            <h1 className="text-lg font-bold" style={{ color: '#0F172A' }}>FivoPay</h1>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ResponsiveLayout;

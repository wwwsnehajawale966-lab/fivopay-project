import React, { useState } from 'react';
import { X, Menu, Layout, Calendar, BarChart3, Settings, Rocket } from 'lucide-react';

const ResponsiveSidebar = ({ isOpen, onClose, user, onLogout, navigate }) => {
  const navigationItems = [
    { icon: Layout, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Planner', path: '/planner' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
        style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #D1FAE5' }}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b" style={{ borderBottom: '1px solid #D1FAE5' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: '#FFFFFF' }}>
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: '#0F172A' }}>FivoPay</h2>
              <p className="text-xs uppercase tracking-wider" style={{ color: '#94A3B8' }}>Workspace</p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors lg:hidden"
            style={{ color: '#94A3B8' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = '#475569' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#94A3B8' }}>Main Menu</p>
          <div className="space-y-2">
            {navigationItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  onClose(); // Close sidebar on mobile after navigation
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 group"
                style={{ color: '#475569' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.color = '#0F172A' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569' }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 mt-auto border-t" style={{ borderTop: '1px solid #D1FAE5' }}>
          <div className="rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: '#F8FAFC' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: '#FFFFFF' }}>
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#0F172A' }}>{user?.name}</p>
              <button
                onClick={onLogout}
                className="text-xs transition-colors"
                style={{ color: '#94A3B8' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ResponsiveSidebar;

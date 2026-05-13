import React from 'react';
import { Menu } from 'lucide-react';

const HamburgerMenu = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg transition-colors duration-200 z-50 relative"
      style={{
        backgroundColor: isOpen ? '#F8FAFC' : 'transparent',
        color: isOpen ? '#06B6D4' : '#475569'
      }}
      onMouseEnter={(e) => {
        if (!isOpen) {
          e.currentTarget.style.backgroundColor = '#F8FAFC';
          e.currentTarget.style.color = '#06B6D4';
        }
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#475569';
        }
      }}
      title="Toggle Menu"
    >
      <div className="relative w-6 h-5">
        {/* Top line */}
        <span
          className="absolute top-1/2 left-0 w-6 h-0.5 rounded-full transition-all duration-300"
          style={{
            backgroundColor: '#475569',
            transform: isOpen ? 'rotate(45deg) translateY(0.125rem)' : 'rotate(0deg)',
            transformOrigin: 'center'
          }}
        />
        {/* Middle line */}
        <span
          className="absolute top-1/2 left-0 w-6 h-0.5 rounded-full transition-all duration-300"
          style={{
            backgroundColor: '#475569',
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'translateX(-0.75rem)' : 'translateX(0)',
            transformOrigin: 'center'
          }}
        />
        {/* Bottom line */}
        <span
          className="absolute top-1/2 left-0 w-6 h-0.5 rounded-full transition-all duration-300"
          style={{
            backgroundColor: '#475569',
            transform: isOpen ? 'rotate(-45deg) translateY(-0.125rem)' : 'rotate(0deg)',
            transformOrigin: 'center'
          }}
        />
      </div>
    </button>
  );
};

export default HamburgerMenu;

import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';

function Header({ onMenuClick }) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left side - Hamburger menu (mobile only) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-md transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Center spacer for desktop */}
        <div className="hidden lg:flex flex-1"></div>

        {/* Right side - Admin profile and logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-medium text-gray-700">Admin User</span>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
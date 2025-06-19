import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AdminContext } from '../../../context/AdminContext';
import g from '../../../assets/g.png';


import { 
  LayoutDashboard, 
  Store, 
  Plus, 
  LogOut, 
  X,
  ChefHat
} from 'lucide-react';
import toast from 'react-hot-toast';

function Sidebar({ isOpen, onClose }) {
  const { logout } = useContext(AdminContext);

  const handleLogout = () => {
    logout(); 
    if (isOpen) onClose();
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/restaurants', icon: Store, label: 'All Food Courts' },
    { path: '/add-restaurant', icon: Plus, label: 'Add Food Court' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-red-600 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6  bg-red-700">
          <div className="flex items-center  space-x-2">
            <img src={g} alt="G Logo" className="h-8 w-8 bg-white rounded-full"  />
            <span className="text-xl font-bold text-white">GGU Foodies</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:bg-red-500 p-2 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) => `
                    flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-red-600 shadow-md' 
                      : 'text-white hover:bg-red-500 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-white hover:bg-red-500 rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
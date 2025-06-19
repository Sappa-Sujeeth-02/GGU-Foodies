import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Menu, 
  Plus, 
  ShoppingCart, 
  History, 
  LogOut,
  X,
  Utensils
} from 'lucide-react';
import { useContext } from 'react';
import { RestaurantContext } from '../../../context/RestaurantContext'; // Update import
import g from '../../../assets/g.png'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'menu', label: 'Menu', icon: Menu },
  { id: 'add-item', label: 'Add Food Item', icon: Plus },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'history', label: 'History', icon: History },
];

const Sidebar = () => {
  const { isSidebarOpen, setIsSidebarOpen, logout } = useContext(RestaurantContext); // Use RestaurantContext
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the current tab from the URL
  const currentTab = location.pathname.split('/').pop() || 'dashboard';

  const handleNavigation = (path, tabId) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:fixed lg:z-50
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <img src={g} alt="G Logo" className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">GGU Foodies</h1>
              <p className="text-xs text-red-100">Food Court Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-red-500 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(`/restaurant-dashboard/${item.id}`, item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                      ${isActive 
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
import React, { useState, useEffect, useContext } from 'react';
import { Menu, Power, PowerOff, User, Settings, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RestaurantContext } from '../../../context/RestaurantContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function Header() {
  const { setIsSidebarOpen, restaurant, rToken, backendURL } = useContext(RestaurantContext);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(restaurant?.availability || true);

  useEffect(() => {
    if (restaurant) {
      setIsRestaurantOpen(restaurant.availability);
    }
  }, [restaurant]);

  const toggleRestaurantStatus = async () => {
    try {
      const newStatus = !isRestaurantOpen;
      const response = await axios.put(
        `${backendURL}/api/restaurant/availability`,
        { availability: newStatus },
        { headers: { rtoken: rToken } }
      );
      if (response.data.success) {
        setIsRestaurantOpen(newStatus);
        toast.success(`Restaurant is now ${newStatus ? 'Open' : 'Closed'}`);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error(error.response?.data?.message || 'Failed to update restaurant status');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold text-gray-800">Food Court Dashboard</h2>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Status:</span>
            <button
              onClick={toggleRestaurantStatus}
              className={`
                flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${isRestaurantOpen 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                }
              `}
            >
              {isRestaurantOpen ? (
                <>
                  <Power className="w-4 h-4" />
                  <span>Open</span>
                </>
              ) : (
                <>
                  <PowerOff className="w-4 h-4" />
                  <span>Closed</span>
                </>
              )}
            </button>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-700">{restaurant?.rating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
          <Link
            to="/restaurant-dashboard/profile"
            className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200"
          >
            {restaurant?.image ? (
              <img 
                src={restaurant.image} 
                alt="Restaurant" 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">{restaurant?.restaurantname || 'Restaurant'}</p>
              <p className="text-xs text-gray-500">Manage Profile</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
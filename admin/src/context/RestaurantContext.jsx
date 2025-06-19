import { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export const RestaurantContext = createContext();

const RestaurantContextProvider = (props) => {
  const [rToken, setRToken] = useState(localStorage.getItem('rToken') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('rToken'));
  const [restaurant, setRestaurant] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchRestaurantProfile = async () => {
      if (rToken) {
        try {
          const response = await axios.get(`${backendURL}/api/restaurant/profile`, {
            headers: { rtoken: rToken },
          });
          if (response.data.success) {
            setRestaurant(response.data.restaurant);
            setIsAuthenticated(true);
            if (['/restaurant-login', '/admin-panel', '/'].includes(window.location.pathname)) {
              navigate('/restaurant-dashboard', { replace: true });
            }
          } else {
            throw new Error(response.data.message);
          }
        } catch (error) {
          console.error('Error fetching restaurant profile:', error);
          localStorage.removeItem('rToken');
          setRToken('');
          setRestaurant(null);
          setIsAuthenticated(false);
          navigate('/restaurant-login', { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        setRestaurant(null);
        if (window.location.pathname.startsWith('/restaurant-dashboard')) {
          navigate('/restaurant-login', { replace: true });
        }
      }
    };

    fetchRestaurantProfile();
  }, [rToken, navigate, backendURL]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${backendURL}/api/restaurant/restaurant-login`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        localStorage.setItem('rToken', response.data.token);
        setRToken(response.data.token);
        setRestaurant(response.data.restaurant);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        navigate('/restaurant-dashboard', { replace: true });
        return response.data;
      } else {
        toast.error(response.data.message || 'Login failed');
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to connect to server';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('rToken');
    setRToken('');
    setRestaurant(null);
    setIsAuthenticated(false);
    setIsSidebarOpen(false);
    toast.success('Logged out successfully!');
    navigate('/restaurant-login', { replace: true });
  };

  const value = useMemo(
    () => ({
      rToken,
      setRToken,
      isAuthenticated,
      restaurant,
      setRestaurant,
      backendURL,
      login,
      logout,
      isSidebarOpen,
      setIsSidebarOpen,
    }),
    [rToken, isAuthenticated, restaurant, backendURL, isSidebarOpen]
  );

  return <RestaurantContext.Provider value={value}>{props.children}</RestaurantContext.Provider>;
};

export const useRestaurantContext = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurantContext must be used within a RestaurantContextProvider');
  }
  return context;
};

export default RestaurantContextProvider;
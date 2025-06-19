import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('aToken'));
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (aToken) {
        try {
          setIsAuthenticated(true);
          if (['/admin-login', '/admin-panel', '/'].includes(window.location.pathname)) {
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('aToken');
          setAToken('');
          setIsAuthenticated(false);
          navigate('/admin-login', { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        if (window.location.pathname.startsWith('/dashboard')) {
          navigate('/admin-login', { replace: true });
        }
      }
    };

    verifyToken();
  }, [aToken, navigate]);

  const login = async (email, password) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      const { data } = await axios.post(`${backendURL}/api/admin/admin-login`, { email, password });
      if (data.success) {
        localStorage.setItem('aToken', data.token);
        setAToken(data.token);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Invalid credentials');
        throw new Error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Admin login error:', error.message, error.response?.data);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('aToken');
    setAToken('');
    setIsAuthenticated(false);
    toast.success('Logged out successfully!');
    navigate('/admin-login', { replace: true });
  };

  const addRestaurant = async (restaurantData, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('restaurantid', restaurantData.restaurantid);
      formData.append('restaurantname', restaurantData.restaurantname);
      formData.append('restaurantemail', restaurantData.restaurantemail);
      formData.append('restaurantpassword', restaurantData.restaurantpassword);
      formData.append('phone', restaurantData.phone);
      formData.append('address', restaurantData.address);
      formData.append('availability', restaurantData.availability);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const { data } = await axios.post(`${backendURL}/api/admin/add-restaurant`, formData, {
        headers: {
          aToken,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        toast.success(data.message);
        return data.restaurant;
      } else {
        console.error('Add restaurant failed:', data.message);
        toast.error(data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Add restaurant client error:', error.message, error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to add restaurant');
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  };

  const getRestaurants = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/admin/restaurants`, {
        headers: { aToken },
      });

      if (data.success) {
        return data.restaurants.map((restaurant) => ({
          id: restaurant.restaurantid,
          name: restaurant.restaurantname,
          address: restaurant.address,
          phone: restaurant.phone, // Include phone
          image: restaurant.image || 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=400',
          isAvailable: restaurant.availability,
          orderCount: restaurant.orderCount || 0,
          rating: restaurant.rating || 0,
        }));
      } else {
        console.error('Get restaurants failed:', data.message);
        toast.error(data.message || 'Failed to fetch restaurants');
        return [];
      }
    } catch (error) {
      console.error('Get restaurants error:', error.message, error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch restaurants');
      if (error.response?.status === 401) {
        logout();
      }
      return [];
    }
  };

  const getDashboardStats = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/admin/dashboard-stats`, {
        headers: { aToken },
      });

      if (data.success) {
        return data.stats;
      } else {
        toast.error(data.message || 'Failed to fetch dashboard stats');
        return null;
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error.message, error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard stats');
      if (error.response?.status === 401) {
        logout();
      }
      return null;
    }
  };

  const getDailyOrderTrends = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/admin/daily-order-trends`, {
        headers: { aToken },
      });

      if (data.success) {
        return data.dailyOrders;
      } else {
        toast.error(data.message || 'Failed to fetch daily order trends');
        return [];
      }
    } catch (error) {
      console.error('Get daily order trends error:', error.message, error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch daily order trends');
      if (error.response?.status === 401) {
        logout();
      }
      return [];
    }
  };

  const getRevenuePerRestaurant = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/admin/revenue-per-restaurant`, {
        headers: { aToken },
      });

      if (data.success) {
        return data.revenueData;
      } else {
        toast.error(data.message || 'Failed to fetch revenue data');
        return [];
      }
    } catch (error) {
      console.error('Get revenue per restaurant error:', error.message, error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch revenue data');
      if (error.response?.status === 401) {
        logout();
      }
      return [];
    }
  };

  const getMostSoldItems = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/admin/most-sold-items`, {
        headers: { aToken },
      });

      if (data.success) {
        return data.topItemsData;
      } else {
        toast.error(data.message || 'Failed to fetch most sold items');
        return [];
      }
    } catch (error) {
      console.error('Get most sold items error:', error.message, error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch most sold items');
      if (error.response?.status === 401) {
        logout();
      }
      return [];
    }
  };

  const value = {
    aToken,
    setAToken,
    isAuthenticated,
    backendURL,
    login,
    logout,
    addRestaurant,
    getRestaurants,
    getDashboardStats,
    getDailyOrderTrends,
    getRevenuePerRestaurant,
    getMostSoldItems,
  };

  return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
};

export default AdminContextProvider;
import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiUser,
    HiShoppingCart,
    HiSearch,
    HiX,
    HiStar,
    HiClock,
    HiHome,
    HiOfficeBuilding,
    HiClipboardList,
    HiLogout,
    HiEye
} from 'react-icons/hi';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingPage from './LoadingPage'; // Adjust path as needed

const FoodCourtsPage = () => {
    const navigate = useNavigate();
    const { logout, cartCount } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [foodCourts, setFoodCourts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Initial loading state
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag for initial load

    const processFoodCourts = (restaurantsData) => {
        const restaurants = [...restaurantsData].map((restaurant, index) => ({
            id: index + 1,
            name: restaurant.restaurantname,
            image: restaurant.image,
            isOpen: restaurant.availability,
            rating: parseFloat(restaurant.rating.toFixed(1)), // Round to 1 decimal
            time: '20-30 min',
            court: restaurant.restaurantname,
            description: `A delightful food court at ${restaurant.address}.`,
        }));
        console.log('Processed Food Courts:', restaurants);
        setFoodCourts(restaurants);
    };

    const fetchFoodCourts = async () => {
        try {
            const response = await axios.get('https://ggufoodies-backend.onrender.com/api/restaurant/restaurants');
            if (response.data.success) {
                processFoodCourts(response.data.restaurants);
                setError('');
            } else {
                throw new Error('Failed to fetch food courts');
            }
        } catch (error) {
            console.error('Failed to fetch food courts:', error);
            setError('Failed to load food courts. Please try again later.');
            toast.error('Failed to load food courts');
        }
    };

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                await fetchFoodCourts();
            } catch (error) {
                console.error('Initial load error:', error);
            } finally {
                setLoading(false);
                setIsInitialLoad(false); // Mark initial load as complete
            }
        };
        loadInitialData();

        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://ggufoodies-backend.onrender.com/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserName(response.data.name);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
                toast.error('Failed to fetch user profile');
            }
        };
        fetchUserProfile();
    }, []);

    // Polling without affecting loading state
    useEffect(() => {
        const pollData = async () => {
            const interval = setInterval(async () => {
                try {
                    await fetchFoodCourts();
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 5000);
            return () => clearInterval(interval);
        };
        if (!isInitialLoad) {
            pollData(); // Start polling only after initial load
        }
    }, [isInitialLoad]);

    const clearSearch = () => {
        setSearchQuery('');
    };

    const handleFoodCourtClick = (court) => {
        if (!court.isOpen) {
            toast.error('This food court is temporarily closed.');
            return;
        }
        setSearchQuery('');
        navigate('/home', { state: { selectedCourt: court } });
    };

    const handleHomeClick = () => {
        setSearchQuery('');
        navigate('/home');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    const filteredFoodCourts = searchQuery
        ? foodCourts.filter(court =>
            court.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : foodCourts;

    if (loading) {
        return <LoadingPage />; // Use the separate LoadingPage component
    }

    return (
        <div className="min-h-screen bg-white">
            <nav className="bg-gradient-to-r from-primary-600 to-primary-700 text-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/home" className="flex items-center space-x-2">
                            <img
                                src="/ggu foodies.jpg"
                                alt="GGU Foodies Logo"
                                className="w-10 h-10 rounded-lg"
                            />
                            <span className="text-xl font-bold text-white">GGU Foodies</span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center space-x-2"
                                >
                                    <HiUser className="w-6 h-6 text-gray-600" />
                                    <span className="text-gray-600 text-sm font-medium hidden lg:inline">{userName}</span>
                                </button>
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md border border-gray-100 py-2"
                                        >
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <HiEye className="w-4 h-4 mr-2" />
                                                View Profile
                                            </Link>
                                            <Link
                                                to="/orders"
                                                className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <HiClipboardList className="w-4 h-4 mr-2" />
                                                Orders
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <HiLogout className="w-4 h-4 mr-2" />
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <Link to="/cart" className="relative p-2 text-white hover:text-gray-200 transition-colors">
                                <HiShoppingCart className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center"
                            >
                                <HiUser className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                    </div>
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden bg-white border-t border-gray-200 py-2"
                            >
                                <Link
                                    to="/profile"
                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <HiEye className="w-4 h-4 mr-2" />
                                    View Profile
                                </Link>
                                <Link
                                    to="/orders"
                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <HiClipboardList className="w-4 h-4 mr-2" />
                                    Orders
                                </Link>
                                <Link
                                    to="/cart"
                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <HiShoppingCart className="w-4 h-4 mr-2" />
                                    Cart ({cartCount})
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                >
                                    <HiLogout className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>

            <div style={{ paddingBottom: 'calc(3.57rem + env(safe-area-inset-bottom))' }} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 md:pb-6">
                <div className="mb-8">
                    <div className="flex items-center space-x-2 mb-4">
                        <button
                            onClick={handleHomeClick}
                            className="text-gray-600 hover:text-red-600 text-sm font-medium"
                        >
                            Home
                        </button>
                        <span className="text-gray-600">/</span>
                        <h2 className="text-2xl font-extrabold text-gray-800">
                            Food Courts
                        </h2>
                    </div>
                    <div className="relative max-w-md mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search food courts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <HiX className="h-5 w-5 text-gray-400 hover:text-red-600" />
                            </button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center max-w-md mx-auto"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Our Food Courts</h2>
                    {filteredFoodCourts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFoodCourts.map((court) => (
                                <motion.div
                                    key={court.id}
                                    whileHover={court.isOpen ? { scale: 1.02 } : {}}
                                    className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${court.isOpen ? 'hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed grayscale'}`}
                                    onClick={() => handleFoodCourtClick(court)}
                                >
                                    <div className="relative">
                                        <img
                                            src={court.image}
                                            alt={court.name}
                                            className="w-full h-40 object-cover"
                                        />
                                        <div
                                            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${court.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {court.isOpen ? 'Open' : 'Closed'}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-800 mb-1">{court.name}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{court.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-1">
                                                <HiStar className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm font-medium">{court.rating}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-gray-600">
                                                <HiClock className="w-4 h-4" />
                                                <span className="text-sm">{court.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No food courts available.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
                <div className="flex justify-around items-center">
                    <Link to="/home" onClick={handleHomeClick} className="flex flex-col items-center py-2 text-gray-600">
                        <HiHome className="w-6 h-6" />
                        <span className="text-xs mt-1">Home</span>
                    </Link>
                    <Link to="/food-courts" className="flex flex-col items-center py-2 text-red-600">
                        <HiOfficeBuilding className="w-6 h-6" />
                        <span className="text-xs mt-1">Food Courts</span>
                    </Link>
                    <Link to="/orders" className="flex flex-col items-center py-2 text-gray-600">
                        <HiClipboardList className="w-6 h-6" />
                        <span className="text-xs mt-1">Orders</span>
                    </Link>
                    <Link to="/cart" className="flex flex-col items-center py-2 text-gray-600 relative">
                        <HiShoppingCart className="w-6 h-6" />
                        <span className="text-xs mt-1">Cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            <style>
                {`
                    html, body {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        overflow-x: hidden;
                    }
                    .fixed.bottom-0 {
                        bottom: env(safe-area-inset-bottom) !important;
                        z-index: 50;
                    }
                `}
            </style>
        </div>
    );
};

export default FoodCourtsPage;
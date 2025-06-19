import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    HiEye,
    HiPlus
} from 'react-icons/hi';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const HomePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, cartItems, cartCount, updateCart } = useContext(AuthContext);
    const { selectedCourt } = location.state || {};
    const [searchQuery, setSearchQuery] = useState(selectedCourt ? selectedCourt.name : '');
    const [itemSearchQuery, setItemSearchQuery] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedFoodCourt, setSelectedFoodCourt] = useState(selectedCourt || null);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [errorMessage, setErrorMessage] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [userName, setUserName] = useState('');
    const [foodCourts, setFoodCourts] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [popularItems, setPopularItems] = useState([]);
    const [categories, setCategories] = useState(['All Categories']);
    const errorMessageRef = useRef(null);

    const processFoodCourts = (restaurantsData) => {
        const fetchedFoodCourts = [...restaurantsData].map((restaurant, index) => ({
            id: index + 1,
            name: restaurant.restaurantname,
            image: restaurant.image,
            description: `A delightful food court at ${restaurant.address}.`,
        }));
        const fetchedRestaurants = [...restaurantsData].map((restaurant, index) => ({
            id: index + 1,
            name: restaurant.restaurantname,
            image: restaurant.image,
            isOpen: restaurant.availability,
            rating: parseFloat(restaurant.rating.toFixed(1)), // Round to 1 decimal
            time: '20-30 min',
            court: restaurant.restaurantname,
        }));
        setFoodCourts(fetchedFoodCourts);
        setRestaurants(fetchedRestaurants);
        return fetchedRestaurants;
    };

    const processFoodItems = (foodItemsData) => {
        const fetchedItems = [...foodItemsData].map(item => ({
            _id: item._id,
            name: item.dishname,
            image: item.dishphoto,
            court: item.restaurantid.restaurantname,
            category: item.category,
            price: item.dineinPrice,
            description: item.description,
            isAvailable: item.availability,
            rating: parseFloat(item.rating.toFixed(1)), // Round to 1 decimal
        }));
        setPopularItems(fetchedItems);

        const uniqueCategories = ['All Categories', ...new Set(fetchedItems.map(item => item.category))];
        setCategories(uniqueCategories);
    };

    const fetchData = async () => {
        try {
            const [response, responseItems] = await Promise.all([
                axios.get('https://ggufoodies-backend.onrender.com/api/restaurant/restaurants'),
                axios.get('https://ggufoodies-backend.onrender.com/api/restaurant/all-food-items'),
            ]);
            if (response.data.success) {
                const updatedRestaurants = processFoodCourts(response.data.restaurants);
                // Check if selectedFoodCourt is closed
                if (selectedFoodCourt) {
                    const currentCourt = updatedRestaurants.find(
                        restaurant => restaurant.name === selectedFoodCourt.name
                    );
                    if (currentCourt && !currentCourt.isOpen) {
                        setSelectedFoodCourt(null);
                        setSearchQuery('');
                        setSelectedCategory('All Categories');
                        navigate('/home', { replace: true });
                        toast.error(`${selectedFoodCourt.name} is temporarily closed.`);
                    }
                }
            } else {
                throw new Error('Failed to fetch food courts');
            }
            if (responseItems.data.success) {
                processFoodItems(responseItems.data.foodItems);
            } else {
                throw new Error('Failed to fetch food items');
            }
            setFetchError('');
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setFetchError('Failed to load food courts or items. Please try again later.');
            toast.error('Failed to load food courts or items');
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [selectedFoodCourt]); // Re-run when selectedFoodCourt changes

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % foodCourts.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [foodCourts]);

    useEffect(() => {
        if (errorMessage && errorMessageRef.current) {
            errorMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [errorMessage]);

    useEffect(() => {
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

    const handleItemClick = (item) => {
        if (!item.isAvailable) {
            toast.error('This item is temporarily not available.');
            return;
        }
        setSearchQuery(item.name);
        setSelectedFoodCourt(null);
        setErrorMessage('');
    };

    const handleFoodItemClick = (item) => {
        if (!item.isAvailable) {
            toast.error('This item is temporarily not available.');
            return;
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSelectedFoodCourt(null);
        setErrorMessage('');
    };

    const clearItemSearch = () => {
        setItemSearchQuery('');
        setErrorMessage('');
    };

    const handleFoodCourtClick = (court) => {
        if (!court.isOpen) {
            toast.error('This food court is temporarily closed.');
            return;
        }
        setSelectedFoodCourt(court);
        setSearchQuery(court.name);
        setSelectedCategory('All Categories');
        setErrorMessage('');
    };

    const handleAddItem = async (item) => {
        if (!item.isAvailable) {
            toast.error('This item is temporarily not available.');
            return;
        }

        // Client-side check for food court consistency
        if (cartItems.length > 0) {
            const existingCourt = cartItems[0]?.restaurant;
            if (existingCourt && item.court !== existingCourt) {
                setErrorMessage('Add items from the same food court only.');
                setTimeout(() => setErrorMessage(''), 3000);
                toast.error('Add items from the same food court only.');
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'https://ggufoodies-backend.onrender.com/api/cart/add',
                {
                    foodItemId: item._id,
                    quantity: 1,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updateCart(response.data.items);
            toast.success('Item added to cart');
        } catch (error) {
            setErrorMessage(error.response?.data.message || 'Failed to add item to cart');
            setTimeout(() => setErrorMessage(''), 3000);
            toast.error(error.response?.data.message || 'Failed to add item to cart');
        }
    };

    const handleHomeClick = () => {
        setSearchQuery('');
        setSelectedFoodCourt(null);
        setSelectedCategory('All Categories');
        setErrorMessage('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    const filteredRestaurants = selectedFoodCourt
        ? restaurants.filter(restaurant => restaurant.name === selectedFoodCourt.name)
        : searchQuery
            ? restaurants.filter(restaurant =>
                restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                popularItems.some(item =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    item.court === restaurant.name
                )
            )
            : restaurants;

    const filteredPopularItems = selectedFoodCourt
        ? popularItems.filter(item =>
            item.court === selectedFoodCourt.name &&
            (itemSearchQuery ? item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) : true) &&
            (selectedCategory === 'All Categories' || item.category === selectedCategory)
        )
        : searchQuery
            ? popularItems.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : popularItems
                .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating descending
                .slice(0, 10); // Top 10 rated items

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
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center space-x-2"
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
                    <div className="relative max-w-md mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for food or food courts..."
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
                    {errorMessage && (
                        <motion.div
                            ref={errorMessageRef}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center max-w-md mx-auto"
                        >
                            {errorMessage}
                        </motion.div>
                    )}
                    {fetchError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center max-w-md mx-auto"
                        >
                            {fetchError}
                        </motion.div>
                    )}
                </AnimatePresence>

                {selectedFoodCourt ? (
                    <>
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                                    <button
                                        onClick={handleHomeClick}
                                        className="text-gray-600 hover:text-red-600 text-sm font-medium"
                                    >
                                        Home
                                    </button>
                                    <span className="text-gray-600">/</span>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {selectedFoodCourt.name}
                                    </h2>
                                </div>
                                <div className="relative w-full sm:w-48">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <HiSearch className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search items..."
                                        value={itemSearchQuery}
                                        onChange={(e) => setItemSearchQuery(e.target.value)}
                                        className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                                    />
                                    {itemSearchQuery && (
                                        <button
                                            onClick={clearItemSearch}
                                            className="absolute inset-y-0 right-0 pr-2 flex items-center"
                                        >
                                            <HiX className="h-4 w-4 text-gray-400 hover:text-red-600" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {filteredRestaurants.map((restaurant) => (
                                <div key={restaurant.id} className="text-center mb-4">
                                    <p className="text-gray-600">{restaurant.court}</p>
                                    <div className="flex justify-center items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <HiStar className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm font-medium">{restaurant.rating}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 text-gray-600">
                                            <HiClock className="w-4 h-4" />
                                            <span className="text-sm">{restaurant.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-800 text-center sm:text-left">
                                    Items at {selectedFoodCourt.name}
                                </h2>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="mt-2 sm:mt-0 sm:ml-4 w-full sm:w-48 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                                >
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {filteredPopularItems.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredPopularItems.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={item.isAvailable ? { scale: 1.02 } : {}}
                                            onClick={() => handleFoodItemClick(item)}
                                            className={`bg-white rounded-lg shadow-md flex overflow-hidden transition-shadow h-40 ${item.isAvailable ? 'hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed grayscale'}`}
                                        >
                                            <div className="flex-1 p-4 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{item.category}</p>
                                                    <p className="text-sm font-semibold text-gray-800 mt-1">
                                                        ₹{item.price !== undefined ? item.price : 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddItem(item);
                                                    }}
                                                    className={`mt-2 px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors w-fit ${item.isAvailable ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                                                >
                                                    <HiPlus className="w-4 h-4" />
                                                    <span className="text-sm">Add</span>
                                                </button>
                                            </div>
                                            <div className="flex-shrink-0 w-2/5 md:w-1/3 relative">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded-r-lg"
                                                />
                                                <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded-lg">
                                                    <HiStar className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-xs font-medium text-white">
                                                        {item.rating ? item.rating : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No items available yet for this category.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Our Food Courts</h2>
                            {foodCourts.length > 0 ? (
                                <div className="relative overflow-hidden rounded-xl">
                                    <div
                                        className="flex transition-transform duration-500 ease-in-out"
                                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                    >
                                        {foodCourts.map((court) => (
                                            <div key={court.id} className="w-full flex-shrink-0 relative">
                                                <img
                                                    src={court.image}
                                                    alt={court.name}
                                                    className="w-full h-64 md:h-80 object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                                                    <div className="p-6 text-white">
                                                        <h3 className="text-xl font-bold mb-2">{court.name}</h3>
                                                        <p className="text-sm opacity-90">{court.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                        {foodCourts.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentSlide(index)}
                                                className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No food courts available.</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Popular Items</h2>
                            {filteredPopularItems.length > 0 ? (
                                <div className="flex overflow-x-auto space-x-4 pb-4 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3 md:space-x-0 scrollbar-hide">
                                    {filteredPopularItems.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={item.isAvailable ? { scale: 1.02 } : {}}
                                            onClick={() => handleItemClick(item)}
                                            className={`bg-white rounded-lg shadow-md flex flex-col overflow-hidden transition-shadow cursor-pointer flex-shrink-0 w-40 md:w-auto h-48 lg:h-56 ${item.isAvailable ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed grayscale'}`}
                                        >
                                            <div className="relative h-32 lg:h-40">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded-lg">
                                                    <HiStar className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-xs font-medium text-white">
                                                        {item.rating ? item.rating : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-3 flex-1 flex flex-col justify-center">
                                                <p className="text-sm font-medium text-gray-800 line-clamp-1 text-center">{item.name}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No popular items available.</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Available Food Courts</h2>
                            {filteredRestaurants.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredRestaurants.map((restaurant) => (
                                        <motion.div
                                            key={restaurant.id}
                                            whileHover={restaurant.isOpen ? { scale: 1.02 } : {}}
                                            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${restaurant.isOpen ? 'hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed grayscale'}`}
                                            onClick={() => handleFoodCourtClick(restaurant)}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={restaurant.image}
                                                    alt={restaurant.name}
                                                    className="w-full h-40 object-cover"
                                                />
                                                <div
                                                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                >
                                                    {restaurant.isOpen ? 'Open' : 'Closed'}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-800 mb-1">{restaurant.name}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{restaurant.court}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-1">
                                                        <HiStar className="w-4 h-4 text-yellow-500" />
                                                        <span className="text-sm font-medium">{restaurant.rating}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 text-gray-600">
                                                        <HiClock className="w-4 h-4" />
                                                        <span className="text-sm">{restaurant.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No food courts available for this item.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
                <div className="flex justify-around items-center">
                    <Link to="/home" onClick={handleHomeClick} className="flex flex-col items-center py-2 text-red-600">
                        <HiHome className="w-6 h-6" />
                        <span className="text-xs mt-1">Home</span>
                    </Link>
                    <Link to="/food-courts" className="flex flex-col items-center py-2 text-gray-600">
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
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .fixed.bottom-0 {
                        bottom: env(safe-area-inset-bottom) !important;
                        z-index: 50;
                    }
                    .line-clamp-1 {
                        display: -webkit-box;
                        -webkit-line-clamp: 1;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .line-clamp-2 {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                `}
            </style>
        </div>
    );
};

export default HomePage;
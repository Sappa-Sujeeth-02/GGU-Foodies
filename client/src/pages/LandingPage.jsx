import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HiStar, HiClock, HiShoppingBag } from 'react-icons/hi';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingPage from './LoadingPage'; // Adjust path as needed

const LandingPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isLoggedIn } = useContext(AuthContext);
    const [foodCourts, setFoodCourts] = useState([]);
    const [popularItems, setPopularItems] = useState([]);
    const [fetchError, setFetchError] = useState('');
    const scrollRef = useRef(null);
    const [scrollDirection, setScrollDirection] = useState('right');
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag for initial load

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/home', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    const fetchData = async () => {
        try {
            const [response, responseItems] = await Promise.all([
                axios.get('https://ggufoodies-backend.onrender.com/api/restaurant/restaurants'),
                axios.get('https://ggufoodies-backend.onrender.com/api/restaurant/all-food-items'),
            ]);

            console.log('Restaurants Response:', response.data);
            console.log('Food Items Response:', responseItems.data);

            if (response.data.success && responseItems.data.success) {
                const { restaurants, foodItems } = { restaurants: response.data.restaurants, foodItems: responseItems.data.foodItems };

                const processedFoodItems = [...foodItems].map(item => ({
                    name: item.dishname,
                    image: item.dishphoto,
                    court: item.restaurantid.restaurantname,
                    category: item.category,
                    price: item.dineinPrice,
                    isAvailable: item.availability,
                    rating: item.rating || 0,
                }));
                console.log('Processed Food Items:', processedFoodItems);
                setPopularItems(processedFoodItems);

                const processedFoodCourts = [...restaurants].map((restaurant, index) => {
                    const restaurantItems = processedFoodItems
                        .filter(item => item.court === restaurant.restaurantname && item.isAvailable)
                        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                        .slice(0, 5);
                    return {
                        id: index + 1,
                        name: restaurant.restaurantname,
                        description: `A delightful food court at ${restaurant.address}.`,
                        image: restaurant.image,
                        rating: parseFloat(restaurant.rating.toFixed(1)),
                        isOpen: restaurant.availability,
                        specialties: restaurantItems.length > 0 ? restaurantItems.map(item => item.name) : ['No items available'],
                    };
                });
                console.log('Processed Food Courts:', processedFoodCourts);
                setFoodCourts(processedFoodCourts);
                setFetchError('');
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setFetchError('Failed to load food courts or items. Please try again later.');
            toast.error('Failed to load food courts or items');
        }
    };

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                await fetchData();
            } catch (error) {
                console.error('Initial load error:', error);
            } finally {
                setLoading(false);
                setIsInitialLoad(false); // Mark initial load as complete
            }
        };
        loadInitialData();
    }, []);

    // Polling without affecting loading state
    useEffect(() => {
        const pollData = async () => {
            const interval = setInterval(async () => {
                try {
                    await fetchData();
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

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % foodCourts.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [foodCourts]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || popularItems.length === 0) return;

        const scrollSpeed = 1;
        let animationFrame;

        const scroll = () => {
            if (scrollDirection === 'right') {
                container.scrollLeft += scrollSpeed;
                if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
                    setScrollDirection('left');
                }
            } else {
                container.scrollLeft -= scrollSpeed;
                if (container.scrollLeft <= 0) {
                    setScrollDirection('right');
                }
            }
            animationFrame = requestAnimationFrame(scroll);
        };

        animationFrame = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrame);
    }, [scrollDirection, popularItems]);

    const handleViewMenu = (court) => {
        if (!court.isOpen) {
            toast.error('This food court is temporarily closed.');
            return;
        }
        if (isLoggedIn) {
            navigate('/home', { state: { selectedCourt: court } });
        } else {
            navigate('/login', { state: { from: '/home', selectedCourt: court } });
        }
    };

    if (loading) {
        return <LoadingPage />; // Use the separate LoadingPage component
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <section id="top" className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                Skip the Wait,<br />
                                <span className="text-accent-400">Order Ahead!</span>
                            </h1>
                            <p className="text-xl mb-8 text-blue-100">
                                Pre-order your favorite meals from GGU's top food courts.
                                Choose dine-in or takeaway, and enjoy your food without the hassle.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/signup" className="bg-white text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                                    Get Started
                                </Link>
                                <button
                                    onClick={() => {
                                        if (isLoggedIn) {
                                            navigate('/home');
                                        } else {
                                            navigate('/login', { state: { from: '/home' } });
                                        }
                                    }}
                                    className="px-6 py-2 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors duration-200"
                                >
                                    Explore Food Courts
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <img
                                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600"
                                alt="GGU Foodies Logo"
                                className="rounded-2xl shadow-2xl w-full h-auto"
                                loading="lazy"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-white text-gray-800 p-4 rounded-xl shadow-lg">
                                <div className="flex items-center space-x-2">
                                    <HiStar className="w-5 h-5 text-yellow-500" />
                                    <span className="font-semibold">4.8 Rating</span>
                                </div>
                                <p className="text-sm text-gray-600">1000+ Happy Customers</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {fetchError && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center">
                        {fetchError}
                    </div>
                </div>
            )}

            <section id="food-courts" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">
                            Food Courts
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover the diverse culinary landscape at GGU with our premier food courts,
                            each offering unique flavors and experiences.
                        </p>
                    </motion.div>

                    {foodCourts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {foodCourts.map((court, index) => (
                                <motion.div
                                    key={court.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    className={`card overflow-hidden group transition-shadow duration-300 ${court.isOpen ? 'hover:shadow-xl' : 'opacity-50 grayscale'}`}
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={court.image}
                                            alt={court.name}
                                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center space-x-1">
                                            <HiStar className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm font-semibold">{court.rating}</span>
                                        </div>
                                        <div
                                            className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium ${court.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                        >
                                            {court.isOpen ? 'Open' : 'Closed'}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            {court.name}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {court.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {court.specialties.map((specialty) => (
                                                <span
                                                    key={specialty}
                                                    className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handleViewMenu(court)}
                                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-center block ${court.isOpen ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                                        >
                                            View Menu
                                        </button>
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
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">
                            Popular Items
                        </h2>
                        <p className="text-xl text-gray-600">
                            Most loved dishes across all our food courts
                        </p>
                    </motion.div>

                    {popularItems.length > 0 ? (
                        <div
                            ref={scrollRef}
                            className="flex overflow-x-auto space-x-4 scrollbar-hide pb-4"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {popularItems
                                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                                .slice(0, 10)
                                .concat(popularItems.slice(0, 10))
                                .map((item, index) => (
                                    <div
                                        key={index}
                                        className={`flex-shrink-0 w-48 h-64 bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 ${item.isAvailable ? '' : 'opacity-50 grayscale'}`}
                                    >
                                        <div className="relative w-full h-48">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs">
                                                {item.court}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-semibold text-gray-800 text-center line-clamp-2">
                                                {item.name}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No popular items available.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">
                            Why Choose GGU Foodies?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Experience the convenience of pre-ordering with these amazing features
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HiClock className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Skip the Wait
                            </h3>
                            <p className="text-gray-600">
                                Pre-order your meals and skip the long queues. Your food will be ready when you arrive.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HiShoppingBag className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Flexible Options
                            </h3>
                            <p className="text-gray-600">
                                Choose between dine-in or takeaway options based on your preference and schedule.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-center"
                        >
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HiStar className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Quality Assured
                            </h3>
                            <p className="text-gray-600">
                                All our food courts maintain the highest quality standards with fresh ingredients.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold mb-6">
                            Ready to Start Ordering?
                        </h2>
                        <p className="text-xl mb-8 text-blue-100">
                            Join thousands of students who are already enjoying the convenience of pre-ordering their meals.
                        </p>
                        <Link
                            to="/signup"
                            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 inline-block"
                        >
                            Get Started Today
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />

            <style>
                {`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
        </div>
    );
};

export default LandingPage;
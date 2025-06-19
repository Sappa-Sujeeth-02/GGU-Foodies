import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Payment from '../components/Payment';
import {
    HiArrowLeft,
    HiPlus,
    HiMinus,
    HiTrash,
    HiX,
    HiCheck,
    HiExclamationCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LoadingPage from './LoadingPage'; // Adjust path as needed

const CartPage = () => {
    const { cartItems, updateCart } = useContext(AuthContext);
    const [orderType, setOrderType] = useState('');
    const [showRulesPopup, setShowRulesPopup] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [acceptedRules, setAcceptedRules] = useState(false);
    const [foodItems, setFoodItems] = useState([]); // Store food items with takeawayPrice
    const [loading, setLoading] = useState(true); // Initial loading state
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag for initial load

    // Fetch food items to get takeawayPrice
    useEffect(() => {
        const fetchFoodItems = async () => {
            try {
                setLoading(true);
                const response = await axios.get('https://ggufoodies-backend.onrender.com/api/restaurant/all-food-items');
                if (response.data.success) {
                    setFoodItems(response.data.foodItems);
                }
            } catch (error) {
                console.error('Failed to fetch food items:', error);
                toast.error('Failed to load food items');
            } finally {
                setLoading(false);
                setIsInitialLoad(false); // Mark initial load as complete
            }
        };
        fetchFoodItems();
    }, []);

    const updateQuantity = async (itemName, newQuantity) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `https://ggufoodies-backend.onrender.com/api/cart/update/${encodeURIComponent(itemName)}`,
                { quantity: newQuantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updateCart(response.data.items);
            if (newQuantity === 0) {
                toast.success('Item removed from cart');
            }
        } catch (error) {
            toast.error('Failed to update cart');
        }
    };

    const removeItem = async (itemName) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `https://ggufoodies-backend.onrender.com/api/cart/remove/${encodeURIComponent(itemName)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updateCart(response.data.items);
            toast.success('Item removed from cart');
        } catch (error) {
            toast.error('Failed to remove item from cart');
        }
    };

    const calculateItemPrice = (item) => {
        const foodItem = foodItems.find(fi => fi.dishname === item.name);
        const basePrice = item.price * item.quantity;
        if (orderType === 'takeaway' && foodItem) {
            return basePrice + (foodItem.takeawayPrice * item.quantity);
        }
        return basePrice;
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateServiceCharge = () => {
        if (orderType === 'takeaway') {
            return cartItems.reduce((total, item) => {
                const foodItem = foodItems.find(fi => fi.dishname === item.name);
                return total + (foodItem ? foodItem.takeawayPrice * item.quantity : 0);
            }, 0);
        }
        return 0;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateServiceCharge();
    };

    const handleContinue = () => {
        if (!orderType) {
            toast.error('Please select dining or takeaway option');
            return;
        }
        setShowRulesPopup(true);
    };

    const handleProceedToPayment = () => {
        setShowRulesPopup(false);
        setShowPayment(true);
    };

    const rules = [
        {
            icon: <HiExclamationCircle className="w-5 h-5 text-red-600" />,
            text: orderType === 'takeaway'
                ? 'Takeaway charges vary per item based on the food court pricing.'
                : 'No additional charges for dining.'
        },
        {
            icon: <HiExclamationCircle className="w-5 h-5 text-red-600" />,
            text: orderType === 'dining'
                ? 'If dining, please be at the food court 5 minutes before your scheduled time.'
                : 'Please arrive on time for takeaway pickup.'
        },
        {
            icon: <HiExclamationCircle className="w-5 h-5 text-red-600" />,
            text: 'Cancellation is allowed only until the order is confirmed by the food court. Once the order is confirmed, cancellation will no longer be possible.'
        },
        {
            icon: <HiExclamationCircle className="w-5 h-5 text-red-600" />,
            text: 'In case of a valid cancellation, the refund amount will be credited to your account within 2–3 business days.'
        },
        {
            icon: <HiExclamationCircle className="w-5 h-5 text-red-600" />,
            text: 'If you are late, food quality may decrease as it cools down. We will not be responsible for temperature-related quality issues.'
        },
        {
            icon: <HiExclamationCircle className="w-5 h-5 text-red-600" />,
            text: (
                <span>
                    Please verify your mobile number before proceeding to payment.{' '}
                    <Link
                        to="/profile"
                        className="text-red-600 underline hover:text-red-700"
                        onClick={() => setShowRulesPopup(false)}
                    >
                        Check the number
                    </Link>
                </span>
            )
        }
    ];

    if (loading) {
        return <LoadingPage />; // Use the separate LoadingPage component
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiTrash className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
                    <Link
                        to="/home"
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Add Items
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link
                                to="/home"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <HiArrowLeft className="w-6 h-6 text-gray-600" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
                        </div>
                        <span className="text-sm text-gray-600">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => {
                            const foodItem = foodItems.find(fi => fi.dishname === item.name);
                            const takeawayAddOn = orderType === 'takeaway' && foodItem ? foodItem.takeawayPrice * item.quantity : 0;
                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                                >
                                    <div className="flex space-x-4">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                                                    <p className="text-sm text-gray-600">{item.restaurant}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.name)}
                                                    className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <HiTrash className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg font-bold text-red-600">₹{item.price * item.quantity}</span>
                                                    {orderType === 'takeaway' && takeawayAddOn > 0 && (
                                                        <span className="text-sm text-gray-600">+ ₹{takeawayAddOn}</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.name, item.quantity - 1)}
                                                        className="w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors"
                                                    >
                                                        <HiMinus className="w-4 h-4 text-gray-600" />
                                                    </button>

                                                    <span className="font-semibold text-gray-800 min-w-[2rem] text-center">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() => updateQuantity(item.name, item.quantity + 1)}
                                                        className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                                                    >
                                                        <HiPlus className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

                            {/* Order Type Selection */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Order Type</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="orderType"
                                            value="dining"
                                            checked={orderType === 'dining'}
                                            onChange={(e) => setOrderType(e.target.value)}
                                            className="mr-3 text-red-600 focus:ring-red-500"
                                        />
                                        <div>
                                            <span className="font-medium text-gray-800">Dining</span>
                                            <p className="text-sm text-gray-600">Eat at the food court (No extra charge)</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="orderType"
                                            value="takeaway"
                                            checked={orderType === 'takeaway'}
                                            onChange={(e) => setOrderType(e.target.value)}
                                            className="mr-3 text-red-600 focus:ring-red-500"
                                        />
                                        <div>
                                            <span className="font-medium text-gray-800">Takeaway</span>
                                            <p className="text-sm text-gray-600">Pick up and go</p>
                                        </div>
                                    </label>
                                </div>

                                {orderType && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                                    >
                                        <p className="text-sm text-red-700">
                                            {orderType === 'dining'
                                                ? 'No additional charges for dining'
                                                : 'Takeaway charges vary per item based on the food court pricing'
                                            }
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{calculateSubtotal()}</span>
                                </div>

                                {orderType === 'takeaway' && calculateServiceCharge() > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Takeaway charges</span>
                                        <span>₹{calculateServiceCharge()}</span>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-lg font-bold text-gray-800">
                                        <span>Total</span>
                                        <span>₹{calculateTotal()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={handleContinue}
                                disabled={!orderType}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${orderType
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rules Popup */}
            <AnimatePresence>
                {showRulesPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">Terms & Conditions</h2>
                                    <button
                                        onClick={() => setShowRulesPopup(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <HiX className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {rules.map((rule, index) => (
                                        <div key={index} className="flex space-x-3 p-3 bg-red-50 rounded-lg">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {rule.icon}
                                            </div>
                                            <p className="text-sm text-gray-700">{rule.text}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={acceptedRules}
                                            onChange={(e) => setAcceptedRules(e.target.checked)}
                                            className="mt-1 text-red-600 focus:ring-red-500 rounded"
                                        />
                                        <span className="text-sm text-gray-700">
                                            I have read and accept all the terms and conditions mentioned above
                                        </span>
                                    </label>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowRulesPopup(false)}
                                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleProceedToPayment}
                                        disabled={!acceptedRules}
                                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${acceptedRules
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Proceed to Payment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {showPayment && (
                <Payment
                    orderType={orderType}
                    cartItems={cartItems}
                    subtotal={calculateSubtotal()}
                    serviceCharge={calculateServiceCharge()}
                    total={calculateTotal()}
                    onClose={() => setShowPayment(false)}
                />
            )}
        </div>
    );
};

export default CartPage;
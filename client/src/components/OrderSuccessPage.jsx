import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiCheck, HiHome, HiClock, HiStar, HiLocationMarker, HiPhone, HiX } from 'react-icons/hi';

const OrderSuccessPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const initialOrder = state?.order;

    const [order, setOrder] = useState(initialOrder);
    const [timeLeft, setTimeLeft] = useState(null);
    const [cancellable, setCancellable] = useState(true);
    const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
    const [isOrderReady, setIsOrderReady] = useState(false);
    const [ratings, setRatings] = useState({});

    const fetchOrder = async () => {
        if (!initialOrder?.orderId) {
            toast.error('No order details found');
            navigate('/home');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://ggufoodies-backend.onrender.com/api/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const orders = response.data;
            const latestOrder = orders.find((o) => o.orderId === initialOrder.orderId);
            if (!latestOrder) {
                toast.error('Order not found');
                navigate('/home');
                return;
            }

            if (!latestOrder.otp && latestOrder.status !== 'cancelled') {
                const newOtp = Math.floor(1000 + Math.random() * 9000);
                await axios.put(
                    `https://ggufoodies-backend.onrender.com/api/orders/${latestOrder.orderId}/update-otp`,
                    { otp: newOtp },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                latestOrder.otp = newOtp;
            }

            setOrder(latestOrder);
            setIsOrderReady(latestOrder.status === 'ready' || latestOrder.status === 'completed');
            setCancellable(latestOrder.status === 'pending');
        } catch (error) {
            console.error('Failed to fetch order details:', error);
            toast.error('Failed to fetch order details');
            navigate('/home');
        }
    };

    useEffect(() => {
        // Immediately fetch order on page load to ensure latest data
        fetchOrder();

        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://ggufoodies-backend.onrender.com/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserData(response.data);
            } catch (error) {
                toast.error('Failed to fetch user profile');
                console.error('User profile error:', error);
            }
        };
        fetchUserData();

        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, [initialOrder, navigate]);

    useEffect(() => {
        if (!order || isOrderReady || order.status === 'cancelled') return;

        const calculateTimeLeft = () => {
            const createdTime = new Date(order.createdAt).getTime();
            const currentTime = new Date().getTime();
            const elapsedSeconds = Math.floor((currentTime - createdTime) / 1000);

            let totalSeconds = 15 * 60;
            if (elapsedSeconds > totalSeconds) {
                const extraTime = elapsedSeconds - totalSeconds;
                const cycles = Math.floor(extraTime / (3 * 60));
                totalSeconds += cycles * 3 * 60;
                const remainingInCycle = extraTime % (3 * 60);
                return 3 * 60 - remainingInCycle;
            }

            return totalSeconds - elapsedSeconds;
        };

        const checkAutoCancel = async () => {
            const elapsedSeconds = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 1000);
            if (order.status === 'pending' && elapsedSeconds >= 5 * 60) {
                try {
                    await axios.post(
                        `https://ggufoodies-backend.onrender.com/api/orders/${order.orderId}/cancel`,
                        {},
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                    );
                    toast.success('Order cancelled due to no confirmation');
                    fetchOrder();
                } catch (error) {
                    toast.error('Failed to auto-cancel order');
                }
            }
        };

        let initialTimeLeft = calculateTimeLeft();
        setTimeLeft(initialTimeLeft);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (isOrderReady || order.status === 'cancelled') {
                    clearInterval(timer);
                    return 0;
                }

                const newTime = prev - 1;
                if (newTime <= 0) {
                    return 3 * 60;
                }
                return newTime;
            });

            checkAutoCancel();
        }, 1000);

        return () => clearInterval(timer);
    }, [order, isOrderReady]);

    const formatTime = (seconds) => {
        if (seconds === null) return 'Calculating...';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleCancel = async () => {
        try {
            await axios.post(
                `https://ggufoodies-backend.onrender.com/api/orders/${order.orderId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            toast.success('Order cancelled successfully');
            fetchOrder();
        } catch (error) {
            toast.error(error.response?.data.message || 'Failed to cancel order');
        }
    };

    const handleRatingChange = (foodItemId, rating) => {
        setRatings((prev) => ({ ...prev, [foodItemId]: rating }));
    };

    const handleRatingSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `https://ggufoodies-backend.onrender.com/api/food-items/ratings`,
                {
                    orderId: order.orderId,
                    ratings: Object.entries(ratings).map(([foodItemId, rating]) => ({ foodItemId, rating })),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Ratings submitted successfully');
            await fetchOrder(); // Refetch order to update hasRated
        } catch (error) {
            toast.error('Failed to submit ratings');
            console.error('Rating submit error:', error);
        }
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div>Loading order details...</div>
            </div>
        );
    }

    const isCancelled = order.status === 'cancelled';
    const isCompleted = order.status === 'completed';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                    >
                        <HiHome className="w-5 h-5" />
                        <span className="font-medium">Home</span>
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6">
                    <div className="text-center mb-6">
                        <div
                            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isCancelled ? 'bg-red-100' : 'bg-green-100'}`}
                        >
                            {isCancelled ? (
                                <HiX className="w-10 h-10 text-red-600" />
                            ) : (
                                <HiCheck className="w-10 h-10 text-green-600" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {isCancelled
                                ? 'Order Cancelled'
                                : isCompleted
                                    ? 'Order Completed Successfully!'
                                    : 'Order Placed Successfully!'}
                        </h2>
                        <p className="text-gray-600">Your order ID: #{order.orderId}</p>
                    </div>

                    <div className="mb-8 flex flex-col items-center">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Order Status</h3>
                        <div className="flex justify-between items-center mb-6 w-full max-w-md relative">
                            {/* Progress line container */}
                            <div className="absolute left-0 right-0 top-5 h-1 flex items-center justify-center">
                                <div className={`h-1 w-full max-w-[calc(100%-80px)] ${isCancelled
                                    ? 'bg-red-200'
                                    : ['confirmed', 'preparing', 'ready', 'completed'].includes(order.status)
                                        ? 'bg-green-200'
                                        : 'bg-gray-200'
                                    }`}></div>
                            </div>

                            <div className="flex flex-col items-center z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isCancelled
                                        ? 'bg-red-100 text-red-600'
                                        : ['pending', 'confirmed', 'preparing', 'ready', 'completed'].includes(order.status)
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    <span className="text-sm">1</span>
                                </div>
                                <span className="text-xs mt-1">Pending</span>
                            </div>

                            <div className="flex flex-col items-center z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isCancelled
                                        ? 'bg-red-100 text-red-600'
                                        : ['confirmed', 'preparing', 'ready', 'completed'].includes(order.status)
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    <span className="text-sm">2</span>
                                </div>
                                <span className="text-xs mt-1">Confirmed</span>
                            </div>

                            <div className="flex flex-col items-center z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isCancelled
                                        ? 'bg-red-100 text-red-600'
                                        : ['preparing', 'ready', 'completed'].includes(order.status)
                                            ? 'bg-green-100 text-green-600'
                                            : timeLeft < 10 * 60 && !isOrderReady
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    <span className="text-sm">3</span>
                                </div>
                                <span className="text-xs mt-1">Preparing</span>
                            </div>

                            <div className="flex flex-col items-center z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isCancelled
                                        ? 'bg-red-100 text-red-600'
                                        : ['ready', 'completed'].includes(order.status)
                                            ? 'bg-green-100 text-green-600'
                                            : timeLeft < 5 * 60 && !isOrderReady
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    <span className="text-sm">4</span>
                                </div>
                                <span className="text-xs mt-1">Ready</span>
                            </div>

                            <div className="flex flex-col items-center z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isCancelled
                                        ? 'bg-red-100 text-red-600'
                                        : order.status === 'completed'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    <span className="text-sm">5</span>
                                </div>
                                <span className="text-xs mt-1">Completed</span>
                            </div>
                        </div>

                        {isCancelled ? (
                            <div className="flex items-center justify-center space-x-2 bg-red-50 p-3 rounded-lg">
                                <HiX className="w-5 h-5 text-red-600" />
                                <span className="text-red-700 font-medium">Order Cancelled</span>
                            </div>
                        ) : isCompleted ? (
                            <div className="flex items-center justify-center space-x-2 bg-green-50 p-3 rounded-lg">
                                <HiCheck className="w-5 h-5 text-green-600" />
                                <span className="text-green-700 font-medium">Order Completed</span>
                            </div>
                        ) : isOrderReady ? (
                            <div className="flex items-center justify-center space-x-2 bg-green-50 p-3 rounded-lg">
                                <HiCheck className="w-5 h-5 text-green-600" />
                                <span className="text-green-700 font-medium">Pickup your order</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2 bg-yellow-50 p-3 rounded-lg">
                                <HiClock className="w-5 h-5 text-yellow-600" />
                                <span className="text-yellow-700 font-medium">
                                    Estimated Time: {formatTime(timeLeft)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mb-8 text-center">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Pickup OTP</h3>
                        <div className="bg-gray-100 p-4 rounded-lg inline-block">
                            <p className="text-2xl font-bold tracking-widest">{order.otp || 'N/A'}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Show this OTP to the food court staff when picking up your order
                        </p>
                    </div>

                    {isCompleted && !order.hasRated && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                Rate Your Food Items
                            </h3>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg"
                                    >
                                        <div className="mb-2 sm:mb-0">
                                            <p className="font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="flex space-x-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <HiStar
                                                    key={star}
                                                    className={`w-6 h-6 cursor-pointer ${ratings[item.foodItemId] >= star
                                                        ? 'text-yellow-500'
                                                        : 'text-gray-300'
                                                        }`}
                                                    onClick={() => handleRatingChange(item.foodItemId, star)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleRatingSubmit}
                                disabled={Object.keys(ratings).length !== order.items.length}
                                className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors ${Object.keys(ratings).length === order.items.length
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Submit Ratings
                            </button>
                            <p className="text-center text-sm text-gray-600 mt-2">
                                Your feedback helps us improve!
                            </p>
                        </div>
                    )}

                    {isCompleted && order.hasRated && (
                        <div className="mb-8 text-center">
                            <p className="text-gray-600">Thank you for your feedback!</p>
                        </div>
                    )}

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Order Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Order Type</p>
                                <p className="font-semibold capitalize text-gray-800">{order.orderType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Order Date</p>
                                <p className="font-semibold text-gray-800">
                                    {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Food Court</p>
                                <p className="font-semibold text-gray-800">
                                    {order.restaurantid?.restaurantname || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Amount</p>
                                <p className="font-semibold text-gray-800">₹{order.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Items</h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-gray-800">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                            {order.serviceCharge > 0 && (
                                <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                                    <p className="text-sm text-gray-600">Takeaway Charges</p>
                                    <p className="font-semibold text-gray-800">₹{order.serviceCharge}</p>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                                <p className="font-bold text-gray-800">Total</p>
                                <p className="font-bold text-gray-800">₹{order.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Details</h3>
                        <div className="space-y-2">
                            <p>
                                <span className="text-sm text-gray-600">Name: </span>
                                {userData.name || 'N/A'}
                            </p>
                            <p>
                                <span className="text-sm text-gray-600">Email: </span>
                                {userData.email || 'N/A'}
                            </p>
                            <p>
                                <span className="text-sm text-gray-600">Phone: </span>
                                {userData.phone || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Food Court Details</h3>
                        <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                                <HiLocationMarker className="w-5 h-5 text-gray-600 mt-1" />
                                <p className="text-gray-600">{order.restaurantid?.address || 'N/A'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <HiPhone className="w-5 h-5 text-gray-600" />
                                <p className="text-gray-600">{order.restaurantid?.phone || 'N/A'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-600">Name: </p>
                                <p className="text-gray-600">{order.restaurantid?.restaurantname || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {cancellable && (
                        <button
                            onClick={handleCancel}
                            className="w-full py-2 px-4 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
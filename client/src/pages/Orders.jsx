import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiCheck, HiClock, HiX, HiArrowLeft } from 'react-icons/hi';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingPage from './LoadingPage'; // Adjust path as needed

const Orders = () => {
    const { isLoggedIn } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const navigate = useNavigate();
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag for initial load

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://ggufoodies-backend.onrender.com/api/orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Fetch Orders Error:', error);
            toast.error('Failed to fetch orders');
        }
    };

    // Initial load
    useEffect(() => {
        if (!isLoggedIn) return;

        const loadOrders = async () => {
            try {
                setLoading(true);
                await fetchOrders();
            } catch (error) {
                console.error('Initial load error:', error);
            } finally {
                setLoading(false);
                setIsInitialLoad(false); // Mark initial load as complete
            }
        };
        loadOrders();
    }, [isLoggedIn]);

    // Polling without affecting loading state
    useEffect(() => {
        if (!isLoggedIn || isInitialLoad) return;

        const pollOrders = async () => {
            const interval = setInterval(async () => {
                try {
                    await fetchOrders();
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 5000);
            return () => clearInterval(interval);
        };
        pollOrders();
    }, [isLoggedIn, isInitialLoad]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const isCancellable = (order) => {
        return order.status === 'pending';
    };

    const handleCancel = async (orderId, e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`https://ggufoodies-backend.onrender.com/api/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.orderId === orderId ? { ...order, status: 'cancelled' } : order
                )
            );
            toast.success('Order cancelled successfully');
        } catch (error) {
            console.error('Cancel Order Error:', error);
            toast.error(error.response?.data.message || 'Failed to cancel order');
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (activeTab === 'pending') {
            return ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
        }
        return order.status === activeTab;
    });

    const handleOrderClick = (order) => {
        navigate('/order-success', { state: { order } });
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiX className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Please login to view orders</h2>
                    <Link
                        to="/login"
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block mt-4"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return <LoadingPage />; // Use the separate LoadingPage component
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiClock className="w-12 h-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
                    <Link
                        to="/home"
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block mt-4"
                    >
                        Order Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center mb-6">
                    <Link to="/home" className="mr-4">
                        <HiArrowLeft className="w-6 h-6 text-gray-600 hover:text-red-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Your Orders</h1>
                </div>

                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'pending'
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'completed'
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setActiveTab('cancelled')}
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'cancelled'
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Cancelled
                    </button>
                </div>

                <div className="space-y-6">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div
                                key={order.orderId}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleOrderClick(order)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">
                                            Order #{order.orderId}
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {order.restaurantid?.restaurantname || 'Food Court'}
                                        </p>
                                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'cancelled'
                                            ? 'bg-red-100 text-red-800'
                                            : order.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}
                                    >
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Order Type:</span>
                                        <span className="font-medium capitalize">{order.orderType}</span>
                                    </div>

                                    <h3 className="font-bold text-gray-800 mt-4 mb-2">Items:</h3>
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between mb-1">
                                            <span className="text-gray-600">
                                                {item.name} × {item.quantity}
                                            </span>
                                            <span className="font-medium">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                    {order.serviceCharge > 0 && (
                                        <div className="flex justify-between text-gray-600 mt-2">
                                            <span>Takeaway Charges:</span>
                                            <span>₹{order.serviceCharge}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-200 pt-2 flex justify-between mt-2">
                                        <span className="text-gray-800 font-bold">Total:</span>
                                        <span className="text-gray-800 font-bold">₹{order.total}</span>
                                    </div>
                                </div>

                                {isCancellable(order) && (
                                    <div className="mt-6">
                                        <button
                                            onClick={(e) => handleCancel(order.orderId, e)}
                                            className="w-full py-2 px-4 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                                        >
                                            Cancel Order
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiClock className="w-12 h-12 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                {activeTab === 'pending'
                                    ? 'No pending orders'
                                    : activeTab === 'completed'
                                        ? 'No completed orders'
                                        : 'No cancelled orders'}
                            </h2>
                            <Link
                                to="/home"
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block mt-4"
                            >
                                Order Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;
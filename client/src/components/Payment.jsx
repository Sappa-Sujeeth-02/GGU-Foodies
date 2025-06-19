import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiX } from 'react-icons/hi';

const Payment = ({ orderType, cartItems, subtotal, serviceCharge, total, onClose }) => {
    const { updateCart } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            console.log('Sending to backend:', { orderType, cartItems, subtotal, serviceCharge, total });

            // First create the order in our backend
            const res = await axios.post('https://ggufoodies-backend.onrender.com/api/orders/create', {
                orderType,
                cartItems,
                subtotal,
                serviceCharge,
                total
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            const { order, razorpayOrder } = res.data;

            console.log('Received from backend:', { order, razorpayOrder });

            // Load Razorpay script
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                toast.error('Razorpay SDK failed to load');
                return;
            }

            // Razorpay options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount, // Use the amount from razorpayOrder (in paise)
                currency: razorpayOrder.currency,
                name: 'GGU Foodies',
                description: 'Order Payment',
                image: '/ggu foodies.jpg',
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        // Verify payment with our backend
                        const verifyRes = await axios.post(
                            'https://ggufoodies-backend.onrender.com/api/orders/verify',
                            {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                order,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                                },
                            }
                        );

                        // Clear cart and navigate to order success page
                        updateCart([]);
                        navigate('/order-success', { state: { order: verifyRes.data.order } });

                    } catch (error) {
                        console.error('Verification error:', error);
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: 'Customer',
                    email: 'customer@example.com',
                    contact: '9999999999',
                },
                theme: {
                    color: '#EF4444',
                },
                modal: {
                    ondismiss: function () {
                        toast.error('Payment cancelled or failed');
                    }
                }
            };

            console.log('Razorpay Options:', options);

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Payment</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            <HiX className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">₹{subtotal}</span>
                        </div>
                        {serviceCharge > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Takeaway Charges:</span>
                                <span className="font-medium">₹{serviceCharge}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                            <span className="text-gray-800 font-bold">Total:</span>
                            <span className="text-gray-800 font-bold">₹{total}</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${loading ? 'bg-gray-300' : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Payment;
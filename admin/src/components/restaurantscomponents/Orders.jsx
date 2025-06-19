import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Clock, 
  Check, 
  X, 
  Phone, 
  User, 
  MapPin, 
  Package,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { RestaurantContext } from '../../context/RestaurantContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function Orders() {
  const { restaurant, rToken, backendURL } = useContext(RestaurantContext);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const hasFetchedInitially = useRef(false);
  const notifiedOrderIds = useRef(new Set());
  const scrollPositions = useRef({}); // Store scroll position for each order card

  // Calculate remaining estimated time
  const calculateRemainingTime = (createdAt, initialTime = 20) => {
    if (!createdAt) return initialTime;
    const createdTime = new Date(createdAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now - createdTime) / 60000);
    let remainingTime = initialTime - elapsedMinutes;
    if (remainingTime <= 0) {
      const extraCycles = Math.floor(Math.abs(remainingTime) / 3) + 1;
      remainingTime = extraCycles * 3 + remainingTime;
    }
    return Math.max(0, remainingTime);
  };

  // Improved preserveScroll function
  const preserveScroll = (orderId, callback) => {
    const cardElement = document.getElementById(`order-card-${orderId}`);
    const scrollContainer = window; // Could be a specific container if needed
    const scrollPosition = scrollContainer.scrollY || scrollContainer.pageYOffset;
    
    // Store scroll position for this order
    scrollPositions.current[orderId] = scrollPosition;

    // Execute the callback
    callback();

    // Restore scroll position after DOM update
    requestAnimationFrame(() => {
      scrollContainer.scrollTo({
        top: scrollPositions.current[orderId] || scrollPosition,
        behavior: 'instant',
      });
    });
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${backendURL}/api/restaurant/orders`, {
        headers: { rtoken: rToken },
        params: { timestamp: new Date().getTime() }, // Prevent caching
      });
      if (response.data.success) {
        console.log('Fetched orders:', response.data.orders);
        const adjustedOrders = response.data.orders.map(order => ({
          ...order,
          estimatedTime: ['confirmed', 'preparing'].includes(order.status)
            ? calculateRemainingTime(order.createdAt, 20)
            : order.estimatedTime || 20,
        }));

        setOrders(prevOrders => {
          const prevOrdersMap = new Map(prevOrders.map(order => [order.orderId, order]));
          let hasChanges = false;
          const updatedOrders = adjustedOrders.map(newOrder => {
            const prevOrder = prevOrdersMap.get(newOrder.orderId);
            if (!prevOrder) {
              hasChanges = true;
              if (hasFetchedInitially.current) {
                const now = new Date();
                const orderCreatedAt = new Date(newOrder.createdAt);
                const timeDiff = (now - orderCreatedAt) / 1000;
                if (timeDiff <= 5 && !notifiedOrderIds.current.has(newOrder.orderId)) {
                  toast.success(`New order #${newOrder.orderId} received!`);
                  notifiedOrderIds.current.add(newOrder.orderId);
                }
              }
              return newOrder;
            }
            if (
              prevOrder.status !== newOrder.status ||
              prevOrder.estimatedTime !== newOrder.estimatedTime ||
              JSON.stringify(prevOrder.items) !== JSON.stringify(newOrder.items) ||
              prevOrder.total !== newOrder.total
            ) {
              hasChanges = true;
              return newOrder;
            }
            return prevOrder;
          });

          const newOrderIds = new Set(adjustedOrders.map(order => order.orderId));
          const filteredOrders = updatedOrders.filter(order => newOrderIds.has(order.orderId));
          if (filteredOrders.length !== prevOrders.length) {
            hasChanges = true;
          }

          return hasChanges ? filteredOrders : prevOrders;
        });

        hasFetchedInitially.current = true;
      } else {
        toast.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    const fetchAndSetOrders = async () => {
      setIsLoading(true);
      await fetchOrders();
      setIsLoading(false);
    };

    if (rToken && restaurant) {
      fetchAndSetOrders();
      const pollingInterval = setInterval(() => {
        fetchOrders();
      }, 5000);
      return () => clearInterval(pollingInterval);
    }
  }, [rToken, restaurant, backendURL]);

  // Auto-decrement estimated time
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (['confirmed', 'preparing'].includes(order.status) && order.estimatedTime > 0) {
            const newTime = order.estimatedTime - 1;
            console.log(`Decrementing time for order ${order.orderId}: ${order.estimatedTime} -> ${newTime}`);
            return { ...order, estimatedTime: newTime };
          } else if (['confirmed', 'preparing'].includes(order.status) && order.estimatedTime === 0) {
            console.log(`Adding 3 minutes for order ${order.orderId}`);
            return { ...order, estimatedTime: 3 };
          }
          return order;
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Clean up notified order IDs
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = new Date();
      const fiveSecondsAgo = now.getTime() - 5000;
      const currentNotifiedIds = Array.from(notifiedOrderIds.current);
      currentNotifiedIds.forEach(orderId => {
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
          const orderCreatedAt = new Date(order.createdAt).getTime();
          if (orderCreatedAt < fiveSecondsAgo) {
            notifiedOrderIds.current.delete(orderId);
          }
        } else {
          notifiedOrderIds.current.delete(orderId);
        }
      });
    }, 30000);

    return () => clearInterval(cleanupInterval);
  }, [orders]);

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await axios.put(
        `${backendURL}/api/restaurant/orders/${orderId}/accept`,
        {},
        { headers: { rtoken: rToken } }
      );
      if (response.data.success) {
        preserveScroll(orderId, () => {
          setOrders(orders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'confirmed', confirmedAt: new Date() }
              : order
          ));
        });
        toast.success('Order accepted successfully');
      } else {
        toast.error(response.data?.message || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Accept order error:', error);
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await axios.put(
          `${backendURL}/api/restaurant/orders/${orderId}/cancel`,
          {},
          { headers: { rtoken: rToken } }
        );
        if (response.data.success) {
          preserveScroll(orderId, () => {
            setOrders(orders.map(order => 
              order.orderId === orderId 
                ? { ...order, status: 'cancelled', cancelledAt: new Date() }
                : order
            ));
          });
          toast.success('Order cancelled successfully');
        } else {
          toast.error(response.data?.message || 'Failed to cancel order');
        }
      } catch (error) {
        console.error('Cancel order error:', error);
        toast.error(error.response?.data?.message || 'Server error');
      }
    }
  };

  const handleStartPreparing = async (orderId) => {
    try {
      const response = await axios.put(
        `${backendURL}/api/restaurant/orders/${orderId}/preparing`,
        {},
        { headers: { rtoken: rToken } }
      );
      if (response.data.success) {
        preserveScroll(orderId, () => {
          setOrders(orders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'preparing' }
              : order
          ));
        });
        toast.success('Order preparation started');
      } else {
        toast.error(response.data?.message || 'Failed to start preparing order');
      }
    } catch (error) {
      console.error('Start preparing order error:', error);
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  const handleMarkPrepared = async (orderId) => {
    try {
      const response = await axios.put(
        `${backendURL}/api/restaurant/orders/${orderId}/prepared`,
        {},
        { headers: { rtoken: rToken } }
      );
      if (response.data.success) {
        preserveScroll(orderId, () => {
          setOrders(orders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'ready', estimatedTime: 0 }
              : order
          ));
        });
        toast.success('Order marked as prepared');
      } else {
        toast.error(response.data?.message || 'Failed to mark order as prepared');
      }
    } catch (error) {
      console.error('Mark prepared order error:', error);
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  const handleCompleteOrder = async (orderId, otpDigits, setOtpDigits, setOtpError) => {
    const enteredOtp = otpDigits.join('');
    if (otpDigits.every(digit => digit === '')) {
      setOtpError('Enter OTP');
      return;
    }

    try {
      const response = await axios.put(
        `${backendURL}/api/restaurant/orders/${orderId}/complete`,
        { otp: enteredOtp },
        { headers: { rtoken: rToken } }
      );
      if (response.data.success) {
        preserveScroll(orderId, () => {
          setOrders(orders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'completed' }
              : order
          ));
        });
        setOtpDigits(['', '', '', '']);
        setOtpError('');
        toast.success('Order completed successfully');
      } else {
        setOtpError(response.data?.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Complete order error:', error);
      setOtpError(error.response?.data?.message || 'Server error');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return order.status !== 'completed' && order.status !== 'cancelled';
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-orange-100 text-gray-800 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  function OrderCard({ order }) {
    const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const inputRefs = useRef([null, null, null, null]);

    const handleOtpChange = (index, value) => {
      if (/^\d?$/.test(value)) {
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = value;
        setOtpDigits(newOtpDigits);
        if (value && index < 3) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };

    const handleKeyDown = (index, e) => {
      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const shortenName = (name) => {
      if (!name) return 'Unknown';
      const firstName = name.split(' ')[0];
      if (firstName.length > 15) {
        return `${firstName.substring(0, 15)}…`;
      }
      return firstName;
    };

    // Prevent default form submission behavior
    const handleButtonClick = (e, action) => {
      e.preventDefault();
      action();
    };

    return (
      <div id={`order-card-${order.orderId}`} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-5 flex flex-col h-full transition-transform duration-200 hover:scale-[1.02]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">#{order.orderId}</h3>
            <p className="text-sm sm:text-base text-gray-500">
              {new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm sm:text-base font-medium border flex-shrink-0 ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>

        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-base truncate">{shortenName(order.userId?.name)}</p>
                <div className="flex items-center space-x-2 text-base text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{order.userId?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm sm:text-base font-medium flex-shrink-0 ml-3 ${
              order.orderType === 'dining' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {order.orderType === 'dining' ? (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Dine-in</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Takeaway</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3 flex-1">
          <h4 className="font-medium text-gray-900 text-base mb-2">Order Items:</h4>
          <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-base font-medium truncate">{item.name}</span>
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    item.foodtype === 'Vegetarian' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
                <div className="text-base text-gray-600 flex-shrink-0 ml-3">
                  Qty: {item.quantity} × ₹{order.orderType === 'dining' ? item.price : item.takeawayPrice || item.price}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center font-semibold text-base">
              <span>Total Amount:</span>
              <span className="text-lg text-red-600">₹{order.total}</span>
            </div>
          </div>
        </div>

        <div className="mb-3">
          {(order.status === 'confirmed' || order.status === 'preparing') && order.estimatedTime > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-3 text-orange-800">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <span className="text-base font-medium">
                  Estimated time: {order.estimatedTime} minute{order.estimatedTime !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {order.status === 'ready' && (
          <div className="mb-3">
            <div className="flex justify-center space-x-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={el => inputRefs.current[index] = el}
                  maxLength={1}
                  pattern="\d"
                  className="w-12 h-12 text-center text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="-"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
            {otpError && (
              <p className="text-red-600 text-base mt-2 text-center transition-all duration-200">{otpError}</p>
            )}
          </div>
        )}

        <div className="flex flex-col space-y-2 mt-3">
          {order.status === 'pending' && (
            <>
              <button
                onClick={(e) => handleButtonClick(e, () => handleAcceptOrder(order.orderId))}
                disabled={!restaurant?.availability}
                className="flex items-center justify-center space-x-3 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 text-base"
              >
                <Check className="w-5 h-5" />
                <span>Accept</span>
              </button>
              <button
                onClick={(e) => handleButtonClick(e, () => handleCancelOrder(order.orderId))}
                className="flex items-center justify-center space-x-3 bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 text-base"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </>
          )}
          
          {order.status === 'confirmed' && (
            <button
              onClick={(e) => handleButtonClick(e, () => handleStartPreparing(order.orderId))}
              className="flex items-center justify-center space-x-3 bg-orange-600 text-white px-5 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 text-base"
            >
              <Clock className="w-5 h-5" />
              <span>Start Preparing</span>
            </button>
          )}
          
          {order.status === 'preparing' && (
            <button
              onClick={(e) => handleButtonClick(e, () => handleMarkPrepared(order.orderId))}
              className="flex items-center justify-center space-x-3 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-base"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Mark as Prepared</span>
            </button>
          )}

          {order.status === 'ready' && (
            <button
              onClick={(e) => handleButtonClick(e, () => handleCompleteOrder(order.orderId, otpDigits, setOtpDigits, setOtpError))}
              className="flex items-center justify-center space-x-3 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 text-base"
            >
              <Check className="w-5 h-5" />
              <span>Complete Order</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 overflow-x-hidden">
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders Management</h1>
          <div className="text-base sm:text-lg text-gray-500 mt-2 sm:mt-0">
            {filteredOrders.length} active orders
          </div>
        </div>

        {!restaurant?.availability && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium text-base">Restaurant is currently closed</span>
            </div>
            <p className="text-base text-red-600 mt-2">
              New orders cannot be accepted while the restaurant is closed.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="relative">
            <div className="sm:hidden">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsFilterOpen(!isFilterOpen);
                }}
                className="w-full flex justify-between items-center px-4 py-3 text-base font-medium text-gray-900 bg-gray-50 rounded-lg"
              >
                <span>Filter: {[
                  { key: 'all', label: 'Active Orders' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'preparing', label: 'Preparing' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' },
                ].find(tab => tab.key === filter)?.label}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              {isFilterOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                  <div className="flex flex-col p-2">
                    {[
                      { key: 'all', label: 'Active Orders' },
                      { key: 'pending', label: 'Pending' },
                      { key: 'confirmed', label: 'Confirmed' },
                      { key: 'preparing', label: 'Preparing' },
                      { key: 'completed', label: 'Completed' },
                      { key: 'cancelled', label: 'Cancelled' },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={(e) => {
                          e.preventDefault();
                          setFilter(tab.key);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                          filter === tab.key
                            ? 'bg-red-600 text-white'
                            : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden sm:block">
              <div className="flex space-x-1 overflow-x-auto hide-scrollbar scroll-smooth p-2">
                {[
                  { key: 'all', label: 'Active Orders' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'preparing', label: 'Preparing' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={(e) => {
                      e.preventDefault();
                      setFilter(tab.key);
                    }}
                    className={`px-3 py-2 text-sm sm:text-base font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
                      filter === tab.key
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg sm:text-xl text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-base sm:text-lg text-gray-500">
              {filter === 'all' 
                ? 'No active orders at the moment' 
                : `No ${filter} orders found`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredOrders.map(order => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
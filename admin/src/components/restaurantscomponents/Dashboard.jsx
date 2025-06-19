import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Calendar
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRestaurantContext } from '../../context/RestaurantContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function RestoDashboard() {
  const { rToken, backendURL } = useRestaurantContext();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalOrders: 0,
      totalProfit: 0,
      todayOrders: 0,
      todayProfit: 0,
      totalOrdersChange: '0% from last month',
      totalProfitChange: '0% from last month',
      todayOrdersChange: '0% from yesterday',
      todayProfitChange: '0% from yesterday',
    },
    dailyOrderTrends: [],
    revenueByCategory: [],
    mostSoldItems: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const pieColors = ['#E50914', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  // Generate fallback daily order trends for the last 7 days in Asia/Kolkata
  const generateFallbackDailyOrderTrends = () => {
    const trends = [];
    const now = new Date();
    now.setHours(now.getHours() + 5); // Adjust for IST (UTC+5:30)
    now.setMinutes(now.getMinutes() + 30);
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayName = date.toLocaleString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' });
      trends.push({ day: dayName, orders: 0 });
    }
    return trends;
  };

  const fallbackDailyOrderTrends = generateFallbackDailyOrderTrends();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${backendURL}/api/restaurant/dashboard`, {
          headers: { rtoken: rToken },
        });
        if (response.data.success) {
          const dailyOrderTrends = Array.isArray(response.data.dailyOrderTrends) && response.data.dailyOrderTrends.length > 0
            ? response.data.dailyOrderTrends
            : fallbackDailyOrderTrends;
          setDashboardData({
            ...response.data,
            dailyOrderTrends,
          });
        } else {
          throw new Error(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Fetch dashboard data error:', error);
        setError(error.response?.data?.message || 'Server error');
        toast.error(error.response?.data?.message || 'Server error');
      } finally {
        setIsLoading(false);
      }
    };

    if (rToken) {
      fetchDashboardData();
    }
  }, [rToken, backendURL]);

  function StatCard({ title, value, icon, color, change }) {
    const isPositive = change && change.startsWith('+');
    const changeColor = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <p className={`text-sm ${changeColor} mt-1`}>
                <TrendingUp className="w-4 h-4 inline mr-1" />
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <div className="text-center py-12">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={dashboardData.stats.totalOrders.toLocaleString()}
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          color="bg-red-600"
          change={dashboardData.stats.totalOrdersChange}
        />
        <StatCard
          title="Total Profit"
          value={`₹${dashboardData.stats.totalProfit.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-600"
          change={dashboardData.stats.totalProfitChange}
        />
        <StatCard
          title="Today's Orders"
          value={dashboardData.stats.todayOrders}
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="bg-blue-600"
          change={dashboardData.stats.todayOrdersChange}
        />
        <StatCard
          title="Today's Profit"
          value={`₹${dashboardData.stats.todayProfit.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-purple-600"
          change={dashboardData.stats.todayProfitChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Order Trends (Last 7 Days)</h3>
          <div style={{ minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.dailyOrderTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E50914',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="orders" stroke="#E50914" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Order counts: {dashboardData.dailyOrderTrends.map(d => `${d.day}: ${d.orders}`).join(', ')}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <div style={{ minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#E50914" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Sold Items</h3>
          <div style={{ minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.mostSoldItems}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {dashboardData.mostSoldItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            {dashboardData.mostSoldItems.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{item.count} sold</div>
                  <div className="text-xs text-gray-500">{item.percentage}% of total</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestoDashboard;
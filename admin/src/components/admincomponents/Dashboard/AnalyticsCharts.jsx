import React, { useContext, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AdminContext } from '../../../context/AdminContext';

function AnalyticsCharts() {
  const { getDailyOrderTrends, getRevenuePerRestaurant, getMostSoldItems } = useContext(AdminContext);
  const [dailyOrdersData, setDailyOrdersData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topItemsData, setTopItemsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching dashboard data...');
        console.log('Context functions:', { getDailyOrderTrends, getRevenuePerRestaurant, getMostSoldItems });

        const [dailyOrders, revenue, topItems] = await Promise.all([
          getDailyOrderTrends(),
          getRevenuePerRestaurant(),
          getMostSoldItems(),
        ]);

        console.log('API Responses:', { dailyOrders, revenue, topItems });

        // Validate and set data
        setDailyOrdersData(Array.isArray(dailyOrders) ? dailyOrders : []);
        setRevenueData(Array.isArray(revenue) ? revenue : []);
        setTopItemsData(Array.isArray(topItems) ? topItems : []);
      } catch (error) {
        console.error('Error fetching chart data:', error.message, error.response?.data);
        setError('Failed to load chart data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getDailyOrderTrends, getRevenuePerRestaurant, getMostSoldItems]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading charts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  // Fallback data
  const fallbackDailyOrders = [
    { day: 'Mon', orders: 0 },
    { day: 'Tue', orders: 0 },
    { day: 'Wed', orders: 0 },
    { day: 'Thu', orders: 0 },
    { day: 'Fri', orders: 0 },
    { day: 'Sat', orders: 0 },
    { day: 'Sun', orders: 0 },
  ];

  const fallbackRevenue = [
    { name: 'No Data', revenue: 0 },
  ];

  const fallbackTopItems = [
    { name: 'No Data', value: 100, color: '#E50914' },
  ];

  
  const filteredTopItems = (topItemsData.length > 0 ? topItemsData : fallbackTopItems).filter(
    (item) => item.value > 0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Order Trends */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Daily Order Trends (Completed)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyOrdersData.length > 0 ? dailyOrdersData : fallbackDailyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E50914',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#E50914"
                strokeWidth={3}
                dot={{ fill: '#E50914', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#E50914' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
       
      {/* Revenue Per Restaurant */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Revenue Per Food Court</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData.length > 0 ? revenueData : fallbackRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 11, wordBreak: 'break-word' }}  interval={0} />
              <YAxis stroke="#666" />
              <Tooltip
                formatter={(value) => [`₹${value}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E50914',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="revenue" fill="#E50914" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Sold Categories */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Most Sold Categories</h3>
        <div className="flex flex-col items-center">
          {/* Pie Chart Container */}
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredTopItems.length > 0 ? filteredTopItems : fallbackTopItems}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 640 ? 80 : 120}
                  innerRadius={window.innerWidth < 640 ? 30 : 60}
                  dataKey="value"
                  label={window.innerWidth < 640 ? false : ({ name, value }) => (value > 0 ? `${name}: ${value}%` : null)}
                  labelLine={window.innerWidth < 640 ? false : { stroke: '#666', strokeWidth: 1 }}
                  paddingAngle={2}
                >
                  {(filteredTopItems.length > 0 ? filteredTopItems : fallbackTopItems).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E50914',
                    borderRadius: '8px',
                  }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{
                    display: window.innerWidth < 640 ? 'none' : 'block',
                    paddingLeft: '20px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* List of Categories */}
          <div className="w-full mt-4 sm:mt-6">
            <div className="space-y-2">
              {(filteredTopItems.length > 0 ? filteredTopItems : fallbackTopItems).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3 truncate">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsCharts;
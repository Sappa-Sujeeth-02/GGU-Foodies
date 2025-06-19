// StatsCards.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Store, Users, ShoppingBag } from 'lucide-react';
import { AdminContext } from '../../../context/AdminContext';

function StatsCards() {
  const { getDashboardStats } = useContext(AdminContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await getDashboardStats();
      if (data) {
        setStats([
          {
            title: 'Total Food Courts',
            value: data.totalRestaurants.toString(),
            icon: Store,
            change: '+0 this month', // You can add logic for change if needed
            changeType: 'positive',
          },
          {
            title: 'Total Users',
            value: data.totalUsers.toLocaleString(),
            icon: Users,
            change: '+0% from last month', // You can add logic for change if needed
            changeType: 'positive',
          },
          {
            title: 'Total Orders',
            value: data.totalOrders.toLocaleString(),
            icon: ShoppingBag,
            change: '+0% from last month', // You can add logic for change if needed
            changeType: 'positive',
          },
        ]);
      }
      setLoading(false);
    };

    fetchStats();
  }, [getDashboardStats]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading stats...</div>;
  }

  if (!stats) {
    return <div className="text-center text-red-500">Failed to load stats</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border-l-4 border-red-600 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-red-600 mb-2">{stat.value}</p>
              <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
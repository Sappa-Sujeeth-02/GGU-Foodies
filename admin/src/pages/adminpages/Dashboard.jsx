import React from 'react';
import StatsCards from "../../components/admincomponents/Dashboard/StatsCards.jsx";
import AnalyticsCharts from '../../components/admincomponents/Dashboard/AnalyticsCharts.jsx';

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, Admin
        </div>
      </div>

      <StatsCards />
      <AnalyticsCharts />
    </div>
  );
}

export default Dashboard;
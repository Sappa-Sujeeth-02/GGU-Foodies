import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Mock data
const mockFoodItems = [
  // ... (keep existing mockFoodItems)
];

const mockOrders = [
  // ... (keep existing mockOrders)
];

const mockStats = {
  totalOrders: 1247,
  totalProfit: 185000,
  todayOrders: 28,
  todayProfit: 3200,
};

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [foodItems, setFoodItems] = useState(mockFoodItems);
  const [orders, setOrders] = useState(mockOrders);
  const [stats, setStats] = useState(mockStats);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        foodItems,
        setFoodItems,
        orders,
        setOrders,
        stats,
        setStats,
        isSidebarOpen,
        setIsSidebarOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
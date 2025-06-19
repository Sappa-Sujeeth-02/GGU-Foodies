import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Utility to generate 4-digit OTP
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Mock data
const mockFoodItems = [
  {
    id: '1',
    name: 'Chicken Biryani',
    price: 250,
    takeawayPrice: 230,
    category: 'Biryanis & Meals',
    isVeg: false,
    rating: 4.5,
    isAvailable: true,
    description: 'Aromatic basmati rice with tender chicken pieces, served with raita and shorba',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'Paneer Butter Masala',
    price: 180,
    takeawayPrice: 170,
    category: 'Veg Specials & Curries',
    isVeg: true,
    rating: 4.2,
    isAvailable: true,
    description: 'Rich and creamy paneer curry with butter and aromatic spices',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Chicken Fried Rice',
    price: 200,
    takeawayPrice: 190,
    category: 'Noodles & Fried Rice',
    isVeg: false,
    rating: 4.0,
    isAvailable: false,
    description: 'Wok-tossed rice with chicken pieces and fresh vegetables',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '4',
    name: 'Masala Chai',
    price: 30,
    takeawayPrice: 25,
    category: 'Beverages',
    isVeg: true,
    rating: 4.8,
    isAvailable: true,
    description: 'Traditional Indian spiced tea with milk and sugar',
    image: 'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '5',
    name: 'Veg Samosa',
    price: 40,
    takeawayPrice: 35,
    category: 'Snacks/Sides',
    isVeg: true,
    rating: 4.3,
    isAvailable: true,
    description: 'Crispy pastry filled with spiced potatoes and peas',
    image: 'https://images.pexels.com/photos/3926124/pexels-photo-3926124.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '6',
    name: 'Butter Chicken',
    price: 220,
    takeawayPrice: 210,
    category: 'Chicken Specials',
    isVeg: false,
    rating: 4.6,
    isAvailable: true,
    description: 'Tender chicken in rich tomato and butter gravy',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const mockOrders = [
  {
    id: 'GGU001',
    userName: 'Priya Sharma',
    phone: '+91 9876543210',
    items: [
      { foodItem: mockFoodItems[0], quantity: 2 },
      { foodItem: mockFoodItems[3], quantity: 2 },
    ],
    orderType: 'dine-in',
    status: 'pending',
    createdAt: new Date(),
    totalAmount: 560,
    otp: generateOtp(),
  },
  {
    id: 'GGU002',
    userName: 'Rahul Kumar',
    phone: '+91 9876543211',
    items: [
      { foodItem: mockFoodItems[1], quantity: 1 },
      { foodItem: mockFoodItems[4], quantity: 3 },
    ],
    orderType: 'takeaway',
    status: 'accepted',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    estimatedTime: 25,
    totalAmount: 275,
    otp: generateOtp(),
  },
  {
    id: 'GGU003',
    userName: 'Ankit Patel',
    phone: '+91 9876543212',
    items: [
      { foodItem: mockFoodItems[5], quantity: 1 },
    ],
    orderType: 'dine-in',
    status: 'preparing',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    estimatedTime: 15,
    totalAmount: 220,
    otp: generateOtp(),
  },
];

const mockStats = {
  totalOrders: 1247,
  totalProfit: 185000,
  todayOrders: 28,
  todayProfit: 3200,
};

const mockRestaurantProfile = {
  id: 'REST001',
  name: 'Spice Garden Restaurant',
  address: '123 Food Street, University Area, City - 400001',
  email: 'spicegarden@ggufoodie.com',
  image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=400',
};

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [foodItems, setFoodItems] = useState(mockFoodItems);
  const [orders, setOrders] = useState(mockOrders);
  const [stats, setStats] = useState(mockStats);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [restaurantProfile, setRestaurantProfile] = useState(mockRestaurantProfile);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isRestaurantOpen,
        setIsRestaurantOpen,
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
        restaurantProfile,
        setRestaurantProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
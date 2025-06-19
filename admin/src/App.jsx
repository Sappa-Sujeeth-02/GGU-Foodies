// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedAdminRoute, ProtectedRestaurantRoute } from './ProtectedRoutes';

// Admin Panel Components
import Layout from './components/admincomponents/Layout/Layout';
import Dashboard from './pages/adminpages/Dashboard';
import AllRestaurants from './pages/adminpages/AllRestaurants';
import AddRestaurant from './pages/adminpages/AddRestaurant';
import AdminPanel from './pages/LogIn/AdminPanel';
import AdminLogin from './pages/LogIn/AdminLogin';
import RestaurantLogin from './pages/LogIn/RestaurantLogin';

// Restaurant Panel Components
import { AppProvider } from './components/restaurantscomponents/AppContext';
import RestoDashboard from './components/restaurantscomponents/Dashboard';
import Menu from './components/restaurantscomponents/Menu';
import AddFoodItem from './components/restaurantscomponents/AddFoodItem';
import Orders from './components/restaurantscomponents/Orders';
import History from './components/restaurantscomponents/History';
import Sidebar from './components/restaurantscomponents/Layout/Sidebar';
import Header from './components/restaurantscomponents/Layout/Header';
import ProfilePage from './components/restaurantscomponents/ProfileModal';

function RestaurantAppContent() {
  return (
    <div className="min-h-screen bg-white flex text-black lg:pl-64">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<RestoDashboard />} />
            <Route path="menu" element={<Menu />} />
            <Route path="add-item" element={<AddFoodItem />} />
            <Route path="orders" element={<Orders />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminPanel />} />
      <Route path="/admin-panel" element={<AdminPanel />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/restaurant-login" element={<RestaurantLogin />} />

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/restaurants" element={<Layout><AllRestaurants /></Layout>} />
        <Route path="/add-restaurant" element={<Layout><AddRestaurant /></Layout>} />
      </Route>

      <Route element={<ProtectedRestaurantRoute />}>
        <Route
          path="/restaurant-dashboard/*"
          element={
            <AppProvider>
              <RestaurantAppContent />
            </AppProvider>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
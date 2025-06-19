import { useContext, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AdminContext } from './context/AdminContext';
import { RestaurantContext } from './context/RestaurantContext';

export const ProtectedAdminRoute = () => {
  const { aToken, isAuthenticated } = useContext(AdminContext);

  if (aToken && isAuthenticated) {
    return <Outlet />;
  }
  return <Navigate to="/admin-login" replace />;
};

export const ProtectedRestaurantRoute = () => {
  const { rToken, isAuthenticated } = useContext(RestaurantContext);

  if (rToken && isAuthenticated) {
    return <Outlet />;
  }
  return <Navigate to="/restaurant-login" replace />;
};
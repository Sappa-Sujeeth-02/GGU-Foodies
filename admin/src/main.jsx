
import React from 'react';
import { StrictMode } from 'react';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import AdminContextProvider from './context/AdminContext';
import { Toaster } from 'react-hot-toast'; 
import ReactDOM from 'react-dom/client';
import RestaurantContextProvider from './context/RestaurantContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminContextProvider>
        <RestaurantContextProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              success: { duration: 3000 },
              error: { duration: 3000 },
            }}
          />
        </RestaurantContextProvider>
      </AdminContextProvider>
    </BrowserRouter>
  </StrictMode>
);
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import CartPage from './pages/CartPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import HomePage from './pages/HomePage';
import About from './pages/About';
import Profile from './pages/auth/Profile';
import FoodCourtsPage from './pages/FoodCourtsPage';
import './index.css';
import ScrollToTop from './components/ScrollToTop';
import OrderSuccessPage from './components/OrderSuccessPage';
import Orders from './pages/Orders';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/food-courts" element={<FoodCourtsPage />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
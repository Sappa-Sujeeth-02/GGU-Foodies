import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [user, setUser] = useState(null);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('https://ggufoodies-backend.onrender.com/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('https://ggufoodies-backend.onrender.com/api/cart', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCartItems(response.data.items || []);
            setCartCount(response.data.items?.reduce((total, item) => total + item.quantity, 0) || 0);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchUser();
            fetchCart();
        }
    }, []);

    const login = async (token) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        await Promise.all([fetchUser(), fetchCart()]);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setCartItems([]);
        setCartCount(0);
        setUser(null);
    };

    const updateCart = (newItems) => {
        setCartItems(newItems);
        setCartCount(newItems.reduce((total, item) => total + item.quantity, 0));
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, cartItems, cartCount, updateCart, user, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
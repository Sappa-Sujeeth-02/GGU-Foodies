import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiUser, HiShoppingCart, HiEye, HiClipboardList, HiLogout, HiPencil, HiCheck } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import Footer from '../../components/Footer';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
    const { isLoggedIn, logout, cartCount, user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({ name: '', phone: '' });
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (isLoggedIn) {
            fetchUserProfile();
        }
    }, [isLoggedIn]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://ggufoodies-backend.onrender.com/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserData(response.data);
            setEditedUser({ name: response.data.name, phone: response.data.phone });
            setUserName(response.data.name);
        } catch (error) {
            toast.error('Failed to fetch profile');
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        // Validate name length
        if (editedUser.name.length > 30) {
            toast.error('Name cannot exceed 30 characters');
            return;
        }

        // Validate phone length and ensure it's numeric
        if (editedUser.phone.length > 10) {
            toast.error('Phone number cannot exceed 10 digits');
            return;
        }
        if (!/^\d{0,10}$/.test(editedUser.phone)) {
            toast.error('Phone number must contain only digits');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'https://ggufoodies-backend.onrender.com/api/auth/profile',
                editedUser,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserData(response.data);
            setUserName(response.data.name);
            updateUser(response.data);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'name' && value.length > 30) {
            toast.error('Name cannot exceed 30 characters');
            return;
        }
        if (name === 'phone') {
            if (value.length > 10) {
                toast.error('Phone number cannot exceed 10 digits');
                return;
            }
            if (!/^\d*$/.test(value)) {
                toast.error('Phone number must contain only digits');
                return;
            }
        }
        setEditedUser({ ...editedUser, [name]: value });
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-gradient-to-r from-primary-600 to-primary-700 text-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Link to="/home" className="flex items-center space-x-2">
                                <img
                                    src="/ggu foodies.jpg"
                                    alt="GGU Foodies Logo"
                                    className="w-10 h-10 rounded-lg"
                                />
                                <span className="text-xl font-bold text-white">GGU Foodies</span>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center space-x-2"
                                >
                                    <HiUser className="w-6 h-6 text-gray-600" />
                                    <span className="text-gray-600 text-sm font-medium">{userName}</span>
                                </button>
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md border border-gray-100 py-2"
                                        >
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <HiEye className="w-4 h-4 mr-2" />
                                                View Profile
                                            </Link>
                                            <Link
                                                to="/orders"
                                                className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <HiClipboardList className="w-4 h-4 mr-2" />
                                                Orders
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <HiLogout className="w-4 h-4 mr-2" />
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <Link to="/cart" className="relative p-2 text-white hover:text-gray-200 transition-colors">
                                <HiShoppingCart className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center space-x-2"
                            >
                                <HiUser className="w-6 h-6 text-gray-600" />
                                <span className="text-gray-600 text-sm font-medium">{userName}</span>
                            </button>
                        </div>
                    </div>
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden bg-white border-t border-gray-100 py-2"
                            >
                                <Link
                                    to="/profile"
                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <HiEye className="w-4 h-4 mr-2" />
                                    View Profile
                                </Link>
                                <Link
                                    to="/orders"
                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <HiClipboardList className="w-4 h-4 mr-2" />
                                    Orders
                                </Link>
                                <Link
                                    to="/cart"
                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <HiShoppingCart className="w-4 h-4 mr-2" />
                                    Cart ({cartCount})
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                >
                                    <HiLogout className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center space-x-2 mb-6">
                    <Link
                        to="/home"
                        className="text-gray-600 hover:text-red-600 text-sm font-medium"
                    >
                        Home
                    </Link>
                    <span className="text-gray-600">/</span>
                    <span className="text-gray-800 text-sm font-medium">Profile</span>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-xl shadow-lg p-8"
                >
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h1>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={editedUser.name}
                                    onChange={handleChange}
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                />
                            ) : (
                                <p className="mt-1 text-gray-900">{userData.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="mt-1 text-gray-900">{userData.email}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="phone"
                                    value={editedUser.phone}
                                    onChange={handleChange}
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                />
                            ) : (
                                <p className="mt-1 text-gray-900">{userData.phone}</p>
                            )}
                        </div>

                        <div className="flex space-x-4 mt-8">
                            {isEditing ? (
                                <button
                                    onClick={handleSave}
                                    className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    <HiCheck className="w-5 h-5 mr-2" />
                                    Save Changes
                                </button>
                            ) : (
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    <HiPencil className="w-5 h-5 mr-2" />
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default Profile;
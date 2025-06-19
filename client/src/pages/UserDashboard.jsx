import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">
                        Welcome back, User!
                    </h1>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex space-x-1 mb-8">
                            {['orders', 'profile', 'history'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                                            ? 'bg-primary-600 text-white'
                                            : 'text-gray-600 hover:text-primary-600'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Current Orders</h2>
                                <p className="text-gray-600">No active orders at the moment.</p>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Settings</h2>
                                <p className="text-gray-600">Manage your account settings here.</p>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Order History</h2>
                                <p className="text-gray-600">View your past orders.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default UserDashboard;
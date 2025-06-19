import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUserGroup, HiOfficeBuilding } from 'react-icons/hi';
import logo from '../../assets/logo.png';

const AdminPanel = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <Link to="/" className="inline-block">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-28 h-10 rounded-lg flex items-center justify-center">
                                <img src={logo} alt="GGU Logo" className="w-28 h-28 object-contain" />
                            </div>
                        </div>
                    </Link>
                    <h2 className=" text-3xl font-extrabold text-gray-900">
                        Admin Panel
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Choose your login type to access the management portal
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <Link
                            to="/restaurant-login"
                            className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-primary-200"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HiOfficeBuilding className="w-8 h-8 text-accent-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Restaurant Login
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Access your restaurant dashboard to manage menus, orders, and inventory
                                </p>
                                <div className="bg-accent-50 text-accent-700 px-4 py-2 rounded-lg text-sm">
                                    For Restaurant Owners
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Link
                            to="/admin-login"
                            className="block bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-primary-200"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HiUserGroup className="w-8 h-8 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Admin Login
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Access the main admin dashboard to oversee all operations and analytics
                                </p>
                                <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm">
                                    For System Administrators
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center"
                >
            
                </motion.div>
            </div>
        </div>
    );
};

export default AdminPanel;
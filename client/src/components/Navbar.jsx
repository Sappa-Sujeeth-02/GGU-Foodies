import { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiMenu, HiX, HiLogout } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, logout } = useContext(AuthContext);

    const toggleMenu = () => setIsOpen(!isOpen);

    const scrollToSection = (sectionId) => {
        if (location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setIsOpen(false);
                setActiveSection(sectionId);
            }
        }
    };

    const handleLogoClick = () => {
        if (isLoggedIn && location.pathname === '/home') {
            navigate('/home');
        } else {
            navigate('/');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    const isActive = (path) => location.pathname === path;
    const isSectionActive = (id) => location.pathname === '/' && activeSection === id;

    useEffect(() => {
        setActiveSection('');
    }, [location.pathname]);

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <button onClick={handleLogoClick} className="flex items-center space-x-2">
                        <img
                            src="/ggu foodies.jpg"
                            alt="GGU Foodies Logo"
                            className="w-10 h-10 rounded-lg"
                        />
                        <span className="text-xl font-bold text-gray-800">GGU Foodies</span>
                    </button>

                    <div className="hidden md:flex items-center space-x-8">
                        <div className="relative">
                            {location.pathname === '/' ? (
                                <button
                                    onClick={() => scrollToSection('top')}
                                    className={`text-gray-700 hover:text-primary-600 font-medium ${isActive('/') && activeSection === '' ? 'text-primary-600' : ''}`}
                                >
                                    Home
                                    {isActive('/') && activeSection === '' && (
                                        <span className="absolute bottom-[-4px] left-0 w-full h-0.5 bg-primary-600"></span>
                                    )}
                                </button>
                            ) : (
                                <Link
                                    to="/"
                                    className={`text-gray-700 hover:text-primary-600 font-medium ${isActive('/') ? 'text-primary-600' : ''}`}
                                >
                                    Home
                                </Link>
                            )}
                        </div>

                        <div className="relative">
                            {location.pathname === '/' ? (
                                <button
                                    onClick={() => {
                                        if (isLoggedIn) {
                                            navigate('/home');
                                        } else {
                                            navigate('/login');
                                        }
                                    }}
                                    className={`text-gray-700 hover:text-primary-600 font-medium ${isSectionActive('food-courts') ? 'text-primary-600' : ''}`}
                                >
                                    All Food Courts
                                    {isSectionActive('food-courts') && (
                                        <span className="absolute bottom-[-4px] left-0 w-full h-0.5 bg-primary-600"></span>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (isLoggedIn) {
                                            navigate('/home');
                                        } else {
                                            navigate('/login');
                                        }
                                    }}
                                    className="text-gray-700 hover:text-primary-600 font-medium"
                                >
                                    All Food Courts
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            <Link
                                to="/about"
                                className={`text-gray-700 hover:text-primary-600 font-medium ${isActive('/about') ? 'text-primary-600' : ''}`}
                            >
                                About
                                {isActive('/about') && (
                                    <span className="absolute bottom-[-4px] left-0 w-full h-0.5 bg-primary-600"></span>
                                )}
                            </Link>
                        </div>

                        {/* ✅ Admin Panel opens separate app */}
                        <div className="relative">
                            <a
                                href="https://ggufoodies-admin.onrender.com" // Update with your admin panel app URL/port
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-primary-600 font-medium"
                            >
                                Admin Panel
                            </a>
                        </div>

                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="text-gray-700 hover:text-red-600 font-medium flex items-center space-x-1"
                            >
                                <HiLogout className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-primary-600 font-medium"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-white border-t border-gray-100"
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {location.pathname === '/' ? (
                                    <button
                                        onClick={() => scrollToSection('top')}
                                        className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                                    >
                                        Home
                                    </button>
                                ) : (
                                    <Link
                                        to="/"
                                        className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Home
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        if (isLoggedIn) {
                                            navigate('/home');
                                        } else {
                                            navigate('/login');
                                        }
                                        setIsOpen(false);
                                    }}
                                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                                >
                                    All Food Courts
                                </button>

                                <Link
                                    to="/about"
                                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    About
                                </Link>

                                {/* ✅ Admin Panel mobile link opens separate tab */}
                                <a
                                    href="https://ggufoodies-admin.onrender.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Admin Panel
                                </a>

                                {isLoggedIn ? (
                                    <button
                                        onClick={handleLogout}
                                        className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md flex items-center space-x-1"
                                    >
                                        <HiLogout className="w-5 h-5" />
                                        <span>Logout</span>
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;
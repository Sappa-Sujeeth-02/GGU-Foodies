import { Link, useLocation } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    const location = useLocation();

    const scrollToSection = (sectionId) => {
        if (location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/ggu foodies.jpg"
                                alt="GGU Foodies Logo"
                                className="w-10 h-10 rounded-lg"
                            />
                            <span className="text-xl font-bold">GGU Foodies</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                            Your ultimate destination for pre-ordering delicious food from GGU's finest food courts.
                            Order ahead, skip the wait!
                        </p>
                        <div className="flex space-x-4">
                            <FaFacebook className="w-6 h-6 text-gray-400 hover:text-primary-500 cursor-pointer transition-colors" />
                            <FaTwitter className="w-6 h-6 text-gray-400 hover:text-primary-500 cursor-pointer transition-colors" />
                            <FaInstagram className="w-6 h-6 text-gray-400 hover:text-primary-500 cursor-pointer transition-colors" />
                            <FaLinkedin className="w-6 h-6 text-gray-400 hover:text-primary-500 cursor-pointer transition-colors" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <div className="space-y-2">
                            {location.pathname === '/' ? (
                                <button
                                    onClick={() => scrollToSection('top')}
                                    className="block text-gray-300 hover:text-white transition-colors"
                                >
                                    Home
                                </button>
                            ) : (
                                <Link to="/" className="block text-gray-300 hover:text-white transition-colors">
                                    Home
                                </Link>
                            )}

                            {location.pathname === '/' ? (
                                <button
                                    onClick={() => scrollToSection('food-courts')}
                                    className="block text-gray-300 hover:text-white transition-colors"
                                >
                                    Food Courts
                                </button>
                            ) : (
                                <Link to="/#food-courts" className="block text-gray-300 hover:text-white transition-colors">
                                    Food Courts
                                </Link>
                            )}

                            <Link to="/about" className="block text-gray-300 hover:text-white transition-colors">
                                About Us
                            </Link>
                            <Link to="/contact" className="block text-gray-300 hover:text-white transition-colors">
                                Contact
                            </Link>
                        </div>
                    </div>

                    {/* Food Courts */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Food Courts</h3>
                        <div className="space-y-2">
                            <Link to="/cfc" className="block text-gray-300 hover:text-white transition-colors">
                                CFC (Chicken Food Court)
                            </Link>
                            <Link to="/fc" className="block text-gray-300 hover:text-white transition-colors">
                                Food Court (FC)
                            </Link>
                            <Link to="/yummmies" className="block text-gray-300 hover:text-white transition-colors">
                                Yummmies
                            </Link>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <HiLocationMarker className="w-5 h-5 text-primary-500" />
                                <span className="text-gray-300 text-sm">
                                    Godavari Global University, Rajahmundry
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <HiPhone className="w-5 h-5 text-primary-500" />
                                <span className="text-gray-300 text-sm">+91 9*********</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <HiMail className="w-5 h-5 text-primary-500" />
                                <span className="text-gray-300 text-sm">info@ggufoodies.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © 2025 GGU Foodies. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
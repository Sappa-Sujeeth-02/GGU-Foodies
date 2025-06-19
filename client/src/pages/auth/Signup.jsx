import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiPhone, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [otpData, setOtpData] = useState({
        identifier: '',
        otp: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // Allow only digits for phone
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length > 10) {
                setErrors(prev => ({
                    ...prev,
                    phone: 'Phone number must be exactly 10 digits'
                }));
                toast.error('Phone number cannot exceed 10 digits');
                return;
            }
            setFormData({
                ...formData,
                [name]: numericValue.slice(0, 10)
            });
            // Clear error if user corrects the input
            if (numericValue.length <= 10) {
                setErrors(prev => ({
                    ...prev,
                    phone: ''
                }));
            }
        } else if (name === 'password') {
            // Restrict password to 30 characters
            if (value.length > 30) {
                setErrors(prev => ({
                    ...prev,
                    password: 'Password cannot exceed 30 characters'
                }));
                toast.error('Password cannot exceed 30 characters');
                return;
            }
            setFormData({
                ...formData,
                [name]: value.slice(0, 30)
            });
            // Clear error if user corrects the input
            if (value.length <= 30) {
                setErrors(prev => ({
                    ...prev,
                    password: ''
                }));
            }
        } else if (name === 'name') {
            // Restrict name to 30 characters
            if (value.length > 30) {
                setErrors(prev => ({
                    ...prev,
                    name: 'Name cannot exceed 30 characters'
                }));
                toast.error('Name cannot exceed 30 characters');
                return;
            }
            setFormData({
                ...formData,
                [name]: value.slice(0, 30)
            });
            // Clear error if user corrects the input
            if (value.length <= 30) {
                setErrors(prev => ({
                    ...prev,
                    name: ''
                }));
            }
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        // Clear other error messages when user starts typing
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleOtpChange = (e) => {
        setOtpData({
            ...otpData,
            [e.target.name]: e.target.value
        });
    };

    const handleGenerateOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({ name: '', email: '', phone: '', password: '' });

        try {
            const { email, phone, password, name } = formData;

            // Validate name
            if (name.length === 0) {
                setErrors(prev => ({ ...prev, name: 'Name is required' }));
                toast.error('Please enter your name');
                setIsLoading(false);
                return;
            }

            // Validate at least one of email or phone is provided
            if (!email && !phone) {
                setErrors(prev => ({
                    ...prev,
                    email: 'Email or phone is required',
                    phone: 'Email or phone is required'
                }));
                toast.error('Please provide either email or phone number');
                setIsLoading(false);
                return;
            }

            // Validate phone number
            if (phone && phone.length !== 10) {
                setErrors(prev => ({
                    ...prev,
                    phone: 'Phone number must be exactly 10 digits'
                }));
                toast.error('Phone number must be exactly 10 digits');
                setIsLoading(false);
                return;
            }

            // Validate password
            if (password.length < 8) {
                setErrors(prev => ({
                    ...prev,
                    password: 'Password must be at least 8 characters'
                }));
                toast.error('Password must be at least 8 characters');
                setIsLoading(false);
                return;
            }

            // Check if email or phone already exists
            try {
                const checkResponse = await axios.post('https://ggufoodies-backend.onrender.com/api/auth/check-user', {
                    email,
                    phone
                });

                const { emailExists, phoneExists } = checkResponse.data;

                if (emailExists || phoneExists) {
                    setErrors(prev => ({
                        ...prev,
                        email: emailExists ? 'Email already exists' : '',
                        phone: phoneExists ? 'Phone number already exists' : ''
                    }));
                    if (emailExists) toast.error('Email already exists');
                    if (phoneExists) toast.error('Phone number already exists');
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                toast.error('Failed to check user details. Please try again.');
                setIsLoading(false);
                return;
            }

            // Generate OTP
            const method = email ? 'email' : 'phone';
            const identifier = email || phone;
            const response = await axios.post('https://ggufoodies-backend.onrender.com/api/otp/generate-otp', {
                email,
                phone,
                method
            });

            setOtpData({ ...otpData, identifier });
            setOtpSent(true);
            toast.success('OTP sent successfully! Please check your ' + (email ? 'email' : 'phone'));
        } catch (error) {
            toast.error(error.response?.data.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            const { email, phone } = formData;
            const method = email ? 'email' : 'phone';
            const identifier = email || phone;
            await axios.post('https://ggufoodies-backend.onrender.com/api/otp/generate-otp', {
                email,
                phone,
                method
            });
            toast.success('OTP resent successfully! Please check your ' + (email ? 'email' : 'phone'));
        } catch (error) {
            toast.error(error.response?.data.message || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Verify OTP
            const otpResponse = await axios.post('https://ggufoodies-backend.onrender.com/api/otp/verify-otp', otpData);
            toast.success(otpResponse.data.message);

            // Create account
            const signupResponse = await axios.post('https://ggufoodies-backend.onrender.com/api/auth/signup', formData);
            toast.success('Account created successfully! Redirecting to login...');
            login(signupResponse.data.token);

            // Redirect to login page
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            if (error.response?.data.message.includes('OTP')) {
                toast.error(error.response?.data.message || 'OTP verification failed.');
            } else {
                toast.error(error.response?.data.message || 'Signup failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link to="/" className="flex justify-center">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/ggu foodies.jpg"
                                alt="GGU Foodies Logo"
                                className="w-12 h-12 rounded-lg"
                            />
                            <span className="text-2xl font-bold text-gray-800">GGU Foodies</span>
                        </div>
                    </Link>

                    <div className="text-center mt-6">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiUser className="w-8 h-8 text-primary-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Create your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign up to start pre-ordering your favorite meals
                        </p>
                    </div>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
                    onSubmit={otpSent ? handleVerifyOtp : handleGenerateOtp}
                >
                    {!otpSent ? (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="off"
                                        required
                                        className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                                        placeholder="Enter your full name (max 30 chars)"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="off"
                                        className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiPhone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="off"
                                        className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                                        placeholder="Enter 10-digit phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiLockClosed className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                        placeholder="Create password (8-30 chars)"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <HiEyeOff className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <HiEye className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Password must be 8-30 characters
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    OTP Verification
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        autoComplete="off"
                                        required
                                        className="input-field pl-10"
                                        placeholder="Enter the 6-digit OTP"
                                        value={otpData.otp}
                                        onChange={handleOtpChange}
                                        maxLength="6"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    We've sent a 6-digit OTP to {otpData.identifier}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isLoading}
                                className="w-full text-primary-600 hover:text-primary-500 font-medium text-sm"
                            >
                                {isLoading ? 'Resending OTP...' : 'Resend OTP'}
                            </button>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors duration-200"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : otpSent ? (
                                'Verify OTP'
                            ) : (
                                'Generate OTP'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default Signup;
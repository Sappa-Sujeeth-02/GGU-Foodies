import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPhone, HiMail, HiLockClosed } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // Allow only digits for phone
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length > 10) {
                toast.error('Phone number cannot exceed 10 digits');
                return;
            }
            setFormData({
                ...formData,
                [name]: numericValue.slice(0, 10)
            });
        } else if (name === 'newPassword' || name === 'confirmPassword') {
            // Restrict password fields to 30 characters
            if (value.length > 30) {
                toast.error('Password cannot exceed 30 characters');
                return;
            }
            setFormData({
                ...formData,
                [name]: value.slice(0, 30)
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { email, phone } = formData;
            if (!email || !phone) {
                throw new Error('Both email and phone are required');
            }

            const response = await axios.post('https://ggufoodies-backend.onrender.com/api/otp/generate-otp', {
                email,
                phone,
                method: 'email' // Default to email for forgot password
            });
            toast.success(`OTP sent to your email for password reset`);
            setStep(2);
        } catch (error) {
            toast.error(error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);

        try {
            const { email, phone } = formData;
            const response = await axios.post('https://ggufoodies-backend.onrender.com/api/otp/generate-otp', {
                email,
                phone,
                method: 'email'
            });
            toast.success('OTP resent successfully to your email');
        } catch (error) {
            toast.error(error.response?.data.message || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('https://ggufoodies-backend.onrender.com/api/otp/verify-otp', {
                identifier: formData.email,
                otp: formData.otp
            });
            toast.success(response.data.message);
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('https://ggufoodies-backend.onrender.com/api/auth/reset-password', {
                email: formData.email,
                phone: formData.phone,
                newPassword: formData.newPassword
            });
            toast.success('Password changed successfully! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data.message || 'Failed to reset password. Please try again.');
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
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Forgot Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {step === 1 && 'Enter your email and phone number to receive OTP'}
                        {step === 2 && 'Enter the OTP sent to your email for password reset'}
                        {step === 3 && 'Create a new password (8-30 characters) for your account'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mt-8 bg-white p-8 rounded-xl shadow-lg"
                >
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
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
                                        required
                                        className="input-field pl-10"
                                        placeholder="Enter your email address"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
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
                                        required
                                        className="input-field pl-10"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-3"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                                ) : (
                                    'Send OTP'
                                )}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP
                                </label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    maxLength="6"
                                    className="input-field text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    value={formData.otp}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-3"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                                ) : (
                                    'Verify OTP'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={isLoading}
                                className="w-full text-primary-600 hover:text-primary-500 font-medium"
                            >
                                Resend OTP
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-primary-600 hover:text-primary-500 font-medium"
                            >
                                Back to Information
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiLockClosed className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        required
                                        className="input-field pl-10"
                                        placeholder="Enter new password (8-30 characters)"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiLockClosed className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="input-field pl-10"
                                        placeholder="Confirm new password (8-30 characters)"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-3"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-6">
                        <Link
                            to="/login"
                            className="text-primary-600 hover:text-primary-500 font-medium"
                        >
                            Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
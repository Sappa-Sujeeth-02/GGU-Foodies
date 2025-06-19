import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  User, 
  MapPin, 
  Building, 
  Save, 
  Camera, 
  Eye, 
  EyeOff,
  Lock,
  AlertCircle,
  CheckCircle,
  Edit,
  Mail,
  X,
  Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RestaurantContext } from '../../context/RestaurantContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { restaurant, rToken, backendURL } = useContext(RestaurantContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    restaurantname: '',
    address: '',
    restaurantemail: '',
    phone: '',
    image: '',
    password: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState('');

  useEffect(() => {
    if (restaurant) {
      setFormData({
        restaurantname: restaurant.restaurantname || '',
        address: restaurant.address || '',
        restaurantemail: restaurant.restaurantemail || '',
        phone: restaurant.phone || '',
        image: restaurant.image || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [restaurant]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.restaurantname.trim()) {
      newErrors.restaurantname = 'Restaurant name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        setErrors(prev => ({ ...prev, image: 'No file selected' }));
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Please upload a JPEG or PNG image' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
        setErrors(prev => ({ ...prev, image: '' }));
      };
      reader.onerror = () => {
        setErrors(prev => ({ ...prev, image: 'Failed to read image' }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      setErrors(prev => ({ ...prev, image: 'Error uploading image' }));
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'phone' && (!/^\d*$/.test(value) || value.length > 10)) {
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const verifyOldPassword = async () => {
    try {
      const response = await axios.post(
        `${backendURL}/api/restaurant/verify-password`,
        { password: oldPassword },
        { headers: { rtoken: rToken } }
      );
      if (response.data.success) {
        setShowPasswordModal(false);
        setIsEditing(true);
        setOldPassword('');
        setPasswordModalError('');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setPasswordModalError(error.response?.data?.message || 'Failed to verify password');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('restaurantname', formData.restaurantname.trim());
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('phone', formData.phone.trim());
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }

      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append('image', fileInputRef.current.files[0]);
      }

      for (let [key, value] of formDataToSend.entries()) {
        console.log(`FormData ${key}:`, value);
      }

      const response = await axios.put(
        `${backendURL}/api/restaurant/profile`,
        formDataToSend,
        {
          headers: {
            rtoken: rToken,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
        setIsEditing(false);
        setTimeout(() => {
          setSuccessMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors(prev => ({ ...prev, submit: error.response?.data?.message || 'Failed to update profile' }));
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      restaurantname: restaurant?.restaurantname || '',
      address: restaurant?.address || '',
      restaurantemail: restaurant?.restaurantemail || '',
      phone: restaurant?.phone || '',
      image: restaurant?.image || '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setShowPasswordModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 overflow-x-hidden">
      {/* Password Verification Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2 sm:px-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Verify Current Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword('');
                  setPasswordModalError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-3 sm:mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    passwordModalError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showOldPassword ? 'Hide password' : 'Show password'}
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              {passwordModalError && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {passwordModalError}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword('');
                  setPasswordModalError('');
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyOldPassword}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto my-4 sm:my-6">
        <div className="flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-xl">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold">Food Court Profile</h2>
              <p className="text-xs sm:text-sm text-red-100">View or update your food court details</p>
            </div>
          </div>
        </div>

        {(successMessage || errors.submit) && (
          <div className="mx-3 mt-3">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                {successMessage}
              </div>
            )}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.submit}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Court ID
            </label>
            <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <span className="text-sm text-gray-900 font-semibold truncate">
                {restaurant?.restaurantid || 'ID Not Available'}
              </span>
              <span className="text-xs text-gray-500 bg-gray-200 px-1 py-0.5 rounded-full">Non-editable</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Court Image
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-gray-200 ${
                  isEditing ? 'cursor-pointer' : 'cursor-default'
                } relative group`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                {formData.image ? (
                  <img 
                    src={formData.image} 
                    alt="Restaurant" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      setFormData(prev => ({ ...prev, image: '' }));
                      setErrors(prev => ({ ...prev, image: 'Failed to load image' }));
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                disabled={!isEditing}
              />
            </div>
            {errors.image && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {errors.image}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Court Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                required
                value={formData.restaurantname}
                onChange={(e) => handleInputChange('restaurantname', e.target.value)}
                disabled={!isEditing}
                className={`w-full pl-9 sm:pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  !isEditing ? 'bg-gray-50 text-gray-500' : errors.restaurantname ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.restaurantname && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {errors.restaurantname}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                maxLength="10"
                placeholder="Enter 10-digit phone number"
                className={`w-full pl-9 sm:pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  !isEditing ? 'bg-gray-50 text-gray-500' : errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <textarea
                rows={3}
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                className={`w-full pl-9 sm:pl-10 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                  !isEditing ? 'bg-gray-50 text-gray-500' : errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {errors.address}
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <span className="text-sm text-gray-900 truncate">{formData.restaurantemail || 'Email Not Available'}</span>
              <span className="text-xs text-gray-500 bg-gray-200 px-1 py-0.5 rounded-full">Non-editable</span>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3 bg-blue-50 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">Change Password (Optional)</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter new password"
                    className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-sm text-gray-900 font-mono">••••••••</span>
                <span className="text-xs text-gray-500 bg-gray-200 px-1 py-0.5 rounded-full">Hidden for security</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2 sm:pt-4 border-t border-gray-200">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleEditClick}
                className="flex items-center justify-center space-x-1 sm:space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm w-full sm:w-auto"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center space-x-1 sm:space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 text-sm w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
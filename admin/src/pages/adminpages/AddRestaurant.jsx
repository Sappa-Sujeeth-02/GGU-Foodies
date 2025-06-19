import React, { useState, useContext } from 'react';
import { Upload, X, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext';

function AddRestaurant() {
  const [formData, setFormData] = useState({
    restaurantid: '',
    restaurantname: '',
    restaurantemail: '',
    restaurantpassword: '',
    phone: '',
    address: '',
    availability: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { addRestaurant } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (!/^\d*$/.test(value) || value.length > 10) {
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    const fileInput = document.getElementById('image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.restaurantid.trim()) {
      newErrors.restaurantid = 'Restaurant ID is required';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(formData.restaurantid)) {
      newErrors.restaurantid = 'Restaurant ID must contain both letters and numbers';
    }

    if (!formData.restaurantname.trim()) {
      newErrors.restaurantname = 'Restaurant name is required';
    }

    if (!formData.restaurantemail.trim()) {
      newErrors.restaurantemail = 'Restaurant email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.restaurantemail)) {
      newErrors.restaurantemail = 'Invalid email format';
    }

    if (!formData.restaurantpassword.trim()) {
      newErrors.restaurantpassword = 'Password is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Restaurant address is required';
    }

    if (!imageFile) {
      newErrors.image = 'Restaurant image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await addRestaurant(formData, imageFile);

      setFormData({
        restaurantid: '',
        restaurantname: '',
        restaurantemail: '',
        restaurantpassword: '',
        phone: '',
        address: '',
        availability: true,
      });
      setImagePreview(null);
      setImageFile(null);
      setErrors({});

      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Submit error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to add restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.restaurantid.trim() &&
    formData.restaurantname.trim() &&
    formData.restaurantemail.trim() &&
    formData.restaurantpassword.trim() &&
    formData.phone.trim() &&
    formData.address.trim() &&
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(formData.restaurantid) &&
    /^\d{10}$/.test(formData.phone) &&
    imageFile !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add Food Court</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Restaurant ID */}
          <div>
            <label htmlFor="restaurantid" className="block text-sm font-medium text-gray-700 mb-2">
              Food Court ID *
            </label>
            <input
              type="text"
              id="restaurantid"
              name="restaurantid"
              value={formData.restaurantid}
              onChange={handleInputChange}
              placeholder="Enter restaurant ID (e.g., GGU123)"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.restaurantid ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.restaurantid && (
              <p className="mt-1 text-sm text-red-600">{errors.restaurantid}</p>
            )}
          </div>

          {/* Restaurant Name */}
          <div>
            <label htmlFor="restaurantname" className="block text-sm font-medium text-gray-700 mb-2">
              Food Court Name *
            </label>
            <input
              type="text"
              id="restaurantname"
              name="restaurantname"
              value={formData.restaurantname}
              onChange={handleInputChange}
              placeholder="Enter restaurant name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.restaurantname ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.restaurantname && (
              <p className="mt-1 text-sm text-red-600">{errors.restaurantname}</p>
            )}
          </div>

          {/* Restaurant Email */}
          <div>
            <label htmlFor="restaurantemail" className="block text-sm font-medium text-gray-700 mb-2">
              Food Court Email *
            </label>
            <input
              type="email"
              id="restaurantemail"
              name="restaurantemail"
              value={formData.restaurantemail}
              onChange={handleInputChange}
              placeholder="Enter restaurant email"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.restaurantemail ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.restaurantemail && (
              <p className="mt-1 text-sm text-red-600">{errors.restaurantemail}</p>
            )}
          </div>

          {/* Restaurant Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Restaurant Password */}
          <div>
            <label htmlFor="restaurantpassword" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              id="restaurantpassword"
              name="restaurantpassword"
              value={formData.restaurantpassword}
              onChange={handleInputChange}
              placeholder="Enter password"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.restaurantpassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.restaurantpassword && (
              <p className="mt-1 text-sm text-red-600">{errors.restaurantpassword}</p>
            )}
          </div>

          {/* Restaurant Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Court Image *
            </label>
            {!imagePreview ? (
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to upload restaurant image
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG or JPEG (max 5MB)</p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  required
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Restaurant preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* Restaurant Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Food Court Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter complete address"
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none ${
                errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Availability Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability Status
            </label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, availability: !prev.availability }))}
                className="flex items-center"
              >
                {formData.availability ? (
                  <ToggleRight className="h-8 w-8 text-green-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-red-500" />
                )}
              </button>
              <span
                className={`text-sm font-medium ${
                  formData.availability ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formData.availability ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`
                w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${isFormValid && !isSubmitting
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding Food Court...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Add Food Court</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Form Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Restaurant ID must contain both letters and numbers (e.g., GGU123)</li>
            <li>• Restaurant name, email, phone, password, address, and image are required fields</li>
            <li>• Phone number must be exactly 10 digits</li>
            <li>• Image must be in PNG, JPG, or JPEG format (max 5MB)</li>
            <li>• You can set the initial availability status</li>
            <li>• Availability can be changed later from the All Restaurants page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AddRestaurant;
import React, { useState, useRef } from 'react';
import { Upload, Save, X, ImageIcon, AlertCircle, Trash2 } from 'lucide-react';
import { RestaurantContext } from '../../context/RestaurantContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';

function AddFoodItem() {
  const { rToken, backendURL } = React.useContext(RestaurantContext);
  const [formData, setFormData] = useState({
    dishname: '',
    dineinPrice: '',
    takeawayPrice: '0',
    category: '',
    foodtype: 'Vegetarian',
    description: '',
    dishphoto: null,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const categories = [
    'Beverages',
    'Breakfast Items',
    'Noodles & Fried Rice',
    'Biryanis & Meals',
    'Chicken Specials',
    'Veg Specials & Curries',
    'Egg Dishes',
    'Snacks/Sides',
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.dishname.trim()) {
      newErrors.dishname = 'Dish name is required';
    }

    if (!formData.dineinPrice || parseFloat(formData.dineinPrice) <= 0) {
      newErrors.dineinPrice = 'Valid dine-in price is required';
    }

    if (formData.takeawayPrice && parseFloat(formData.takeawayPrice) < 0) {
      newErrors.takeawayPrice = 'Take away charges cannot be negative';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.dishphoto) {
      newErrors.dishphoto = 'Dish photo is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a JPEG or PNG image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, dishphoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, dishphoto: '' }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, dishphoto: null }));
    setPreviewUrl('');
    setErrors(prev => ({ ...prev, dishphoto: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('dishname', formData.dishname.trim());
      formDataToSend.append('dineinPrice', parseFloat(formData.dineinPrice));
      formDataToSend.append('takeawayPrice', parseFloat(formData.takeawayPrice));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('foodtype', formData.foodtype);
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('dishphoto', formData.dishphoto);

      const response = await axios.post(
        `${backendURL}/api/restaurant/add-item`,
        formDataToSend,
        {
          headers: {
            'rtoken': rToken,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setFormData({
          dishname: '',
          dineinPrice: '',
          takeawayPrice: '0',
          category: '',
          foodtype: 'Vegetarian',
          description: '',
          dishphoto: null,
        });
        setPreviewUrl('');
        setSuccessMessage('Food item added successfully!');
        toast.success('Food item added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        toast.error(response.data.message || 'Failed to add food item');
      }
    } catch (error) {
      console.error('Error adding food item:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add food item';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Food Item</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Fill in the details to add a new item to your menu</p>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm sm:text-base">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dish Photo <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
                aria-label="Choose image"
              >
                <Upload className="w-5 h-5" />
                <span>Choose Image</span>
              </button>
              <input
                type="file"
                accept="image/jpeg,image/png"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
                aria-label="Upload image file"
              />
              {previewUrl && (
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={previewUrl} 
                      alt="Dish preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1 text-red-600 hover:text-red-800"
                    aria-label="Remove selected image"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
              {!previewUrl && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            {errors.dishphoto && (
              <p id="dishphoto-error" className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.dishphoto}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dish Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter dish name"
              value={formData.dishname}
              onChange={(e) => handleInputChange('dishname', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.dishname ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } text-sm sm:text-base`}
              aria-invalid={!!errors.dishname}
              aria-describedby={errors.dishname ? 'dishname-error' : undefined}
            />
            {errors.dishname && (
              <p id="dishname-error" className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.dishname}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } text-sm sm:text-base`}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p id="category-error" className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.category}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dine-in Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                placeholder="0.00"
                value={formData.dineinPrice}
                onChange={(e) => handleInputChange('dineinPrice', e.target.value)}
                onWheel={(e) => e.target.blur()}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.dineinPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } text-sm sm:text-base`}
                aria-invalid={!!errors.dineinPrice}
                aria-describedby={errors.dineinPrice ? 'dineinPrice-error' : undefined}
              />
            </div>
            {errors.dineinPrice && (
              <p id="dineinPrice-error" className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.dineinPrice}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Take Away Charges (add amount if charge extra for takeaway else keep 0) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.takeawayPrice}
                onChange={(e) => handleInputChange('takeawayPrice', e.target.value)}
                onWheel={(e) => e.target.blur()}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.takeawayPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } text-sm sm:text-base`}
                aria-invalid={!!errors.takeawayPrice}
                aria-describedby={errors.takeawayPrice ? 'takeawayPrice-error' : undefined}
              />
            </div>
            {errors.takeawayPrice && (
              <p id="takeawayPrice-error" className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.takeawayPrice}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Type <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.foodtype === 'Vegetarian'}
                  onChange={() => handleInputChange('foodtype', 'Vegetarian')}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                  aria-checked={formData.foodtype === 'Vegetarian'}
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  Vegetarian
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.foodtype === 'Non-Vegetarian'}
                  onChange={() => handleInputChange('foodtype', 'Non-Vegetarian')}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                  aria-checked={formData.foodtype === 'Non-Vegetarian'}
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                  Non-Vegetarian
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Enter dish description here..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } text-sm sm:text-base`}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                dishname: '',
                dineinPrice: '',
                takeawayPrice: '0',
                category: '',
                foodtype: 'Vegetarian',
                description: '',
                dishphoto: null,
              });
              setPreviewUrl('');
              setErrors({});
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 text-sm sm:text-base"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Add Item</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddFoodItem;
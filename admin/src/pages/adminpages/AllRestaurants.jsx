import React, { useState, useEffect, useContext } from 'react';
import { Search, MapPin, ToggleLeft, ToggleRight, Star, Edit, Trash2, X } from 'lucide-react';
import { AdminContext } from '../../context/AdminContext';
import toast from 'react-hot-toast';
import axios from 'axios';

function AllRestaurants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [deleteRestaurant, setDeleteRestaurant] = useState(null);
  const [passwordModal, setPasswordModal] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { getRestaurants, backendURL, aToken, logout } = useContext(AdminContext);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const fetchedRestaurants = await getRestaurants();
        const restaurantData = Array.isArray(fetchedRestaurants)
          ? fetchedRestaurants
          : fetchedRestaurants?.restaurants || [];
        const { data } = await axios.get(`${backendURL}/api/admin/restaurants`, {
          headers: { aToken },
        });
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch restaurants');
        }
        const fullRestaurantData = data.restaurants;
        const mappedRestaurants = restaurantData.map(restaurant => {
          const fullRestaurant = fullRestaurantData.find(r => r.restaurantid === restaurant.id) || {};
          const email = fullRestaurant.restaurantemail || restaurant.email || '';
          return {
            ...restaurant,
            id: restaurant.id,
            email,
            restaurantemail: fullRestaurant.restaurantemail || '',
            phone: fullRestaurant.phone || '', // Include phone number
          };
        });
        setRestaurants(mappedRestaurants);
      } catch (error) {
        toast.error('Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [getRestaurants, backendURL, aToken]);

  const toggleAvailability = async (id) => {
    try {
      const { data } = await axios.put(
        `${backendURL}/api/admin/restaurants/${id}/availability`,
        { isAvailable: !restaurants.find((r) => r.id === id).isAvailable },
        { headers: { aToken } }
      );

      if (data.success) {
        setRestaurants((prev) =>
          prev.map((restaurant) =>
            restaurant.id === id
              ? { ...restaurant, isAvailable: data.restaurant.availability }
              : restaurant
          )
        );
        toast.success('Availability updated successfully');
      } else {
        toast.error(data.message || 'Failed to update availability');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) return;
    setIsEditing(true);
    try {
      const { data } = await axios.put(
        `${backendURL}/api/admin/restaurants/${editRestaurant.id}`,
        {
          restaurantname: editRestaurant.name,
          address: editRestaurant.address,
          restaurantemail: editRestaurant.email,
          phone: editRestaurant.phone, // Include phone in payload
        },
        { headers: { aToken } }
      );

      if (data.success) {
        setRestaurants((prev) =>
          prev.map((restaurant) =>
            restaurant.id === editRestaurant.id
              ? {
                  ...restaurant,
                  name: data.restaurant.restaurantname,
                  address: data.restaurant.address,
                  email: data.restaurant.restaurantemail,
                  restaurantemail: data.restaurant.restaurantemail,
                  phone: data.restaurant.phone, // Update phone in state
                }
              : restaurant
          )
        );
        setEditRestaurant(null);
        toast.success('Restaurant updated successfully');
      } else {
        toast.error(data.message || 'Failed to update restaurant');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update restaurant');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setPasswordModal(deleteRestaurant);
    setDeleteRestaurant(null);
    setPassword('');
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setPasswordError('');

    try {
      const { data } = await axios.post(
        `${backendURL}/api/admin/verify-password`,
        { password },
        { headers: { aToken } }
      );

      if (data.success) {
        const deleteResponse = await axios.delete(
          `${backendURL}/api/admin/restaurants/${passwordModal.id}`,
          { headers: { aToken } }
        );

        if (deleteResponse.data.success) {
          setRestaurants((prev) =>
            prev.filter((restaurant) => restaurant.id !== passwordModal.id)
          );
          setPasswordModal(null);
          setPassword('');
          toast.success('Restaurant and associated data deleted successfully');
        } else {
          setPasswordError(deleteResponse.data.message || 'Failed to delete restaurant');
          toast.error(deleteResponse.data.message || 'Failed to delete restaurant');
        }
      } else {
        setPasswordError(data.message || 'Incorrect password');
        toast.error(data.message || 'Incorrect password');
      }
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.message === 'Incorrect password') {
        setPasswordError('Incorrect password');
        toast.error('Incorrect password');
      } else if (error.response?.status === 401) {
        setPasswordError('Session expired. Please log in again.');
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        setPasswordError(error.response?.data?.message || 'Failed to verify password');
        toast.error(error.response?.data?.message || 'Failed to verify password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRestaurants = restaurants
    .filter((restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'availability') {
        return b.isAvailable ? 1 : -1;
      }
      if (sortBy === 'orders') {
        return b.orderCount - a.orderCount;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return a.name.localeCompare(b.name);
    });

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />);
    }

    if (halfStar) {
      stars.push(<Star key="half" className="h-4 w-4 text-yellow-400 fill-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    }

    while (stars.length < 5) {
      stars.push(<Star key={`empty-${stars.length}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">All Food Courts</h1>
        <div className="text-sm text-gray-500">
          {restaurants.length} Food Courts total
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="name">Sort by Name</option>
            <option value="availability">Sort by Availability</option>
            <option value="orders">Sort by Order Count</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading restaurants...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          try {
                            setEditRestaurant({
                              id: restaurant.id,
                              name: restaurant.name,
                              email: restaurant.restaurantemail || restaurant.email || '',
                              phone: restaurant.phone || '', // Include phone
                              address: restaurant.address,
                              rating: restaurant.rating,
                              orderCount: restaurant.orderCount,
                              isAvailable: restaurant.isAvailable,
                              image: restaurant.image,
                              restaurantemail: restaurant.restaurantemail || restaurant.email || '',
                            });
                          } catch (error) {
                            toast.error('Failed to open edit modal');
                          }
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-100"
                        title="Edit Restaurant"
                      >
                        <Edit className="h-5 w-5 text-blue-500" />
                      </button>
                      <button
                        onClick={() => setDeleteRestaurant(restaurant)}
                        className="p-1.5 rounded-full hover:bg-gray-100"
                        title="Delete Restaurant"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                      <button
                        onClick={() => toggleAvailability(restaurant.id)}
                        className="flex-shrink-0"
                      >
                        {restaurant.isAvailable ? (
                          <ToggleRight className="h-6 w-6 text-green-500 hover:text-green-600 transition-colors" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-red-500 hover:text-red-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">{restaurant.address}</p>
                      <p className="text-sm text-gray-600">Phone: {restaurant.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">{renderStars(restaurant.rating)}</div>
                    <span className="text-sm text-gray-600">{restaurant.rating.toFixed(1)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        restaurant.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {restaurant.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {restaurant.orderCount} orders
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </>
      )}

      {editRestaurant && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Food Court</h2>
              <button onClick={() => setEditRestaurant(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editRestaurant.name || ''}
                  onChange={(e) => setEditRestaurant({ ...editRestaurant, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editRestaurant.email || ''}
                  onChange={(e) => setEditRestaurant({ ...editRestaurant, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editRestaurant.phone || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      setEditRestaurant({ ...editRestaurant, phone: value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                  disabled={isEditing}
                  pattern="\d{10}"
                  title="Phone number must be exactly 10 digits"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={editRestaurant.address || ''}
                  onChange={(e) => setEditRestaurant({ ...editRestaurant, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="3"
                  required
                  disabled={isEditing}
                />
              </div>
              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className={`flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors ${
                    isEditing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isEditing}
                >
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditRestaurant(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isEditing}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteRestaurant && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
              <button onClick={() => setDeleteRestaurant(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete <span className="font-semibold">{deleteRestaurant.name}</span>?
            </p>
            <p className="text-sm text-red-600 mb-4">
              Warning: This will delete all related data, including food items, orders, and other associated records.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteRestaurant(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {passwordModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Verify Admin Password</h2>
              <button
                onClick={() => {
                  setPasswordModal(null);
                  setPassword('');
                  setPasswordError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className={`w-full px-4 py-2 border ${
                    passwordError ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500`}
                  required
                  disabled={isSubmitting}
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className={`flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verifying...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModal(null);
                    setPassword('');
                    setPasswordError('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllRestaurants;
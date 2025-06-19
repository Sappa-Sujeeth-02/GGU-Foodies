import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Edit,
  Eye,
  EyeOff,
  Star,
  Leaf,
  ChefHat,
  X,
  Trash2,
} from 'lucide-react';
import { useContext } from 'react';
import { RestaurantContext } from '../../context/RestaurantContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function Menu() {
  const { rToken, backendURL } = useContext(RestaurantContext);
  const [foodItems, setFoodItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterVeg, setFilterVeg] = useState('all');
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteItem, setDeleteItem] = useState(null); // State for item to delete
  const menuContainerRef = useRef(null);
  const mainContainerRef = useRef(null);

  const categories = [
    'All',
    'Beverages',
    'Breakfast Items',
    'Noodles & Fried Rice',
    'Biryanis & Meals',
    'Chicken Specials',
    'Veg Specials & Curries',
    'Egg Dishes',
    'Snacks/Sides',
  ];

  // Fetch food items
  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${backendURL}/api/restaurant/menu`, {
          headers: { rtoken: rToken },
        });
        if (response.data.success) {
          setFoodItems(response.data.foodItems);
        } else {
          toast.error(response.data.message || 'Failed to fetch menu');
        }
      } catch (error) {
        toast.error('Failed to fetch menu');
      } finally {
        setIsLoading(false);
      }
    };
    if (rToken) {
      fetchMenu();
    }
  }, [rToken, backendURL]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (editItem || deleteItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editItem, deleteItem]);

  // Toggle availability
  const toggleAvailability = async (itemId, event) => {
    event.preventDefault();
    const windowScrollPosition = window.scrollY;
    const containerScrollPosition = menuContainerRef.current ? menuContainerRef.current.scrollTop : 0;
    const mainScrollPosition = mainContainerRef.current ? mainContainerRef.current.scrollTop : 0;

    try {
      const item = foodItems.find((item) => item.id === itemId);
      if (!item) {
        toast.error('Item not found');
        return;
      }
      const response = await axios.put(
        `${backendURL}/api/restaurant/menu/${itemId}`,
        { availability: !item.isAvailable },
        { headers: { rtoken: rToken } }
      );
      if (response.data.success) {
        setFoodItems(
          foodItems.map((item) =>
            item.id === itemId
              ? { ...item, isAvailable: response.data.foodItem.isAvailable }
              : item
          )
        );
        setTimeout(() => {
          if (mainContainerRef.current) {
            mainContainerRef.current.scrollTop = mainScrollPosition;
          }
          if (menuContainerRef.current) {
            menuContainerRef.current.scrollTop = containerScrollPosition;
          }
          window.scrollTo(0, windowScrollPosition);
        }, 50);
        toast.success(`Availability set to ${response.data.foodItem.isAvailable ? 'Available' : 'Not Available'}`);
      } else {
        toast.error(response.data.message || 'Failed to update availability');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    }
  };

  // Handle edit click
  const handleEditClick = (item, event) => {
    event.preventDefault();
    const windowScrollPosition = window.scrollY;
    const containerScrollPosition = menuContainerRef.current ? menuContainerRef.current.scrollTop : 0;
    const mainScrollPosition = mainContainerRef.current ? mainContainerRef.current.scrollTop : 0;

    setEditItem({ ...item });

    setTimeout(() => {
      if (mainContainerRef.current) {
        mainContainerRef.current.scrollTop = mainScrollPosition;
      }
      if (menuContainerRef.current) {
        menuContainerRef.current.scrollTop = containerScrollPosition;
      }
      window.scrollTo(0, windowScrollPosition);
    }, 50);
  };

  // Handle delete click
  const handleDeleteClick = (item, event) => {
    event.preventDefault();
    setDeleteItem(item);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `${backendURL}/api/restaurant/menu/${deleteItem.id}`,
        { headers: { rtoken: rToken } }
      );
      if (response.data.success) {
        setFoodItems(foodItems.filter((item) => item.id !== deleteItem.id));
        setDeleteItem(null);
        toast.success('Food item deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete item');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${backendURL}/api/restaurant/menu/${editItem.id}`,
        {
          dishname: editItem.name,
          category: editItem.category,
          dineinPrice: editItem.price,
          takeawayPrice: editItem.takeawayPrice,
          foodtype: editItem.isVeg ? 'Vegetarian' : 'Non-Vegetarian',
          description: editItem.description,
          availability: editItem.isAvailable,
        },
        { headers: { rtoken: rToken } }
      );
      if (response.data.success) {
        setFoodItems(
          foodItems.map((item) =>
            item.id === editItem.id ? response.data.foodItem : item
          )
        );
        setEditItem(null);
        toast.success('Food item updated successfully');
      } else {
        toast.error(response.data.message || 'Failed to update item');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  };

  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesVegFilter =
      filterVeg === 'all' ||
      (filterVeg === 'veg' && item.isVeg) ||
      (filterVeg === 'non-veg' && !item.isVeg);

    return matchesSearch && matchesCategory && matchesVegFilter;
  });

  function FoodCard({ item }) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="relative">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex space-x-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              <Leaf className="w-3 h-3 inline mr-1" />
              {item.isVeg ? 'Veg' : 'Non-Veg'}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => toggleAvailability(item.id, e)}
              onMouseDown={(e) => e.preventDefault()}
              className={`p-1.5 rounded-full ${
                item.isAvailable
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-500 hover:bg-gray-600'
              } text-white transition-colors duration-200`}
              title={item.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
            >
              {item.isAvailable ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 pr-2 truncate">
              {item.name}
            </h3>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
              <span className="text-xs sm:text-sm text-gray-600">{item.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mb-2">{item.category}</p>

          <div className="min-h-[40px] mb-2">
            {item.description && (
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{item.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="text-base sm:text-lg font-bold text-gray-900">₹{item.price}</div>
              <div className="text-xs sm:text-sm text-gray-500">
                Takeaway: +₹{item.takeawayPrice}
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {item.isAvailable ? 'Available' : 'Not Available'}
            </div>
          </div>

          <div className="flex space-x-2 mt-auto">
            <button
              onClick={(e) => handleEditClick(item, e)}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Item</span>
            </button>
            <button
              onClick={(e) => handleDeleteClick(item, e)}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={mainContainerRef} className="p-3 sm:p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Menu Management</h1>
        <div className="text-xs sm:text-sm text-gray-500">
          {filteredItems.length} items found
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search food items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filterVeg}
            onChange={(e) => setFilterVeg(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Items</option>
            <option value="veg">Vegetarian Only</option>
            <option value="non-veg">Non-Vegetarian Only</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading menu...</p>
        </div>
      ) : (
        <div
          ref={menuContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {editItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Item</h2>
              <button onClick={() => setEditItem(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {categories
                    .filter((cat) => cat !== 'All')
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={editItem.price}
                  onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) })}
                  onWheel={(e) => e.target.blur()} // Prevent wheel scroll
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Takeaway Charge Price (₹)
                </label>
                <input
                  type="number"
                  value={editItem.takeawayPrice}
                  onChange={(e) =>
                    setEditItem({ ...editItem, takeawayPrice: parseFloat(e.target.value) })
                  }
                  onWheel={(e) => e.target.blur()} // Prevent wheel scroll
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editItem.description || ''}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editItem.isVeg}
                  onChange={(e) => setEditItem({ ...editItem, isVeg: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="text-xs sm:text-sm font-medium text-gray-700">Vegetarian</label>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-xs sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Confirm Deletion</h2>
              <button onClick={() => setDeleteItem(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">{deleteItem.name}</span>? This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-xs sm:text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteItem(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-xs sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-xs sm:text-sm text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}

export default Menu;
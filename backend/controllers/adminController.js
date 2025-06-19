import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import restaurantModel from '../models/restaurantModel.js';
import foodItemModel from '../models/foodItemModel.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import cloudinary from 'cloudinary';

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.json({ success: false, message: error.message });
  }
};

const addRestaurant = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const { restaurantid, restaurantname, restaurantemail, restaurantpassword, phone, address, availability } = req.body;
    const image = req.files?.image;

    if (!restaurantid || !restaurantname || !restaurantemail || !restaurantpassword || !phone || !address) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
    }

    const existingRestaurant = await restaurantModel.findOne({
      $or: [{ restaurantid }, { restaurantemail }],
    });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: `Duplicate found: ${existingRestaurant.restaurantid === restaurantid ? 'Restaurant ID' : 'Email'} already exists`,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(restaurantpassword, salt);

    let imageUrl = '';
    if (image) {
      console.log('Uploading image:', image.name);
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: 'ggu_foodies/restaurants' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(image.data);
      });
      imageUrl = uploadResult.secure_url;
      console.log('Image uploaded:', imageUrl);
    }

    const restaurant = new restaurantModel({
      restaurantid,
      restaurantname,
      restaurantemail,
      restaurantpassword: hashedPassword,
      phone,
      address,
      availability: availability === 'true' || availability === true,
      image: imageUrl,
      rating: 0,
      orderCount: 0,
    });

    await restaurant.save();

    res.json({
      success: true,
      message: 'Restaurant added successfully',
      restaurant: {
        restaurantid,
        restaurantname,
        restaurantemail,
        phone,
        address,
        availability: restaurant.availability,
        image: imageUrl,
        rating: 0,
        orderCount: 0,
      },
    });
  } catch (error) {
    console.error('Add restaurant error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurantModel.find().select(
      'restaurantid restaurantname restaurantemail phone address availability image rating orderCount'
    );
    res.json({
      success: true,
      restaurants,
    });
  } catch (error) {
    console.error('Get restaurants error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const updateRestaurantAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const restaurant = await restaurantModel.findOneAndUpdate(
      { restaurantid: id },
      { availability: isAvailable },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      restaurant: {
        restaurantid: restaurant.restaurantid,
        restaurantname: restaurant.restaurantname,
        restaurantemail: restaurant.restaurantemail,
        phone: restaurant.phone,
        address: restaurant.address,
        availability: restaurant.availability,
        image: restaurant.image,
        rating: restaurant.rating,
        orderCount: restaurant.orderCount,
      },
    });
  } catch (error) {
    console.error('Update availability error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { restaurantname, address, restaurantemail, phone } = req.body;

    if (!restaurantname || !address || !restaurantemail || !phone) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
    }

    const existingRestaurant = await restaurantModel.findOne({
      restaurantemail,
      restaurantid: { $ne: id },
    });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists for another restaurant',
      });
    }

    const restaurant = await restaurantModel.findOneAndUpdate(
      { restaurantid: id },
      { restaurantname, address, restaurantemail, phone },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant: {
        restaurantid: restaurant.restaurantid,
        restaurantname: restaurant.restaurantname,
        restaurantemail: restaurant.restaurantemail,
        phone: restaurant.phone,
        address: restaurant.address,
        availability: restaurant.availability,
        image: restaurant.image,
        rating: restaurant.rating,
        orderCount: restaurant.orderCount,
      },
    });
  } catch (error) {
    console.error('Update restaurant error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const verifyAdminPassword = async (req, res) => {
  try {
    const { password } = req.body;
    console.log('Verify password attempt with body:', req.body);
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }
    if (password === process.env.ADMIN_PASSWORD) {
      console.log('Password verified successfully');
      res.json({ success: true, message: 'Password verified successfully' });
    } else {
      console.log('Incorrect password provided');
      res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    console.error('Verify admin password error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await restaurantModel.findOne({ restaurantid: id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    console.log(`Deleting restaurant with restaurantid: ${id}, MongoDB _id: ${restaurant._id}`);

    const allFoodItems = await foodItemModel.find({});
    console.log(`All food items in collection:`, allFoodItems);

    let foodItems = await foodItemModel.find({ restaurantid: id });
    console.log(`Found ${foodItems.length} food items with restaurantid: ${id}`, foodItems);

    let deleteResult = await foodItemModel.deleteMany({ restaurantid: id });
    console.log(`Deleted ${deleteResult.deletedCount} food items with restaurantid: ${id}`);

    if (deleteResult.deletedCount === 0) {
      console.log(`Attempting fallback deletion with restaurant _id: ${restaurant._id}`);
      foodItems = await foodItemModel.find({ restaurantid: restaurant._id.toString() });
      console.log(`Found ${foodItems.length} food items with restaurant _id: ${restaurant._id}`, foodItems);
      deleteResult = await foodItemModel.deleteMany({ restaurantid: restaurant._id.toString() });
      console.log(`Deleted ${deleteResult.deletedCount} food items with restaurant _id: ${restaurant._id}`);
    }

    await restaurantModel.deleteOne({ restaurantid: id });

    res.json({
      success: true,
      message: 'Restaurant and associated data deleted successfully',
    });
  } catch (error) {
    console.error('Delete restaurant error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const restaurantCount = await restaurantModel.countDocuments();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      stats: {
        totalRestaurants: restaurantCount,
        totalUsers: userCount,
        totalOrders: orderCount,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getDailyOrderTrends = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $exists: true, $ne: null, $type: ['date', 'timestamp'] }, // Ensure createdAt is a valid date
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: { date: '$createdAt', timezone: 'Asia/Kolkata' } },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { '_id': 1 },
      },
    ]);

    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyOrders = dayMap.map((day, index) => ({
      day,
      orders: orders.find((o) => o._id === index + 1)?.orders || 0,
    }));

    res.json({
      success: true,
      dailyOrders,
    });
  } catch (error) {
    console.error('Get daily order trends error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
const getRevenuePerRestaurant = async (req, res) => {
  try {
    const restaurants = await restaurantModel
      .find()
      .select('restaurantname totalRevenue')
      .lean();

    const revenueData = restaurants.map((r) => ({
      name: r.restaurantname,
      revenue: r.totalRevenue || 0,
    }));

    res.json({
      success: true,
      revenueData,
    });
  } catch (error) {
    console.error('Get revenue per restaurant error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const getMostSoldItems = async (req, res) => {
  try {
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

    const foodItems = await foodItemModel
      .aggregate([
        {
          $match: { totalOrders: { $gt: 0 } }, // Only include items with orders
        },
        {
          $group: {
            _id: '$category',
            totalOrders: { $sum: '$totalOrders' },
          },
        },
        {
          $sort: { totalOrders: -1 },
        },
        {
          $limit: 5,
        },
      ])
      .exec();

    const total = foodItems.reduce((sum, item) => sum + (item.totalOrders || 0), 0);
    const colors = ['#E50914', '#FF6B6B', '#FFB3B3', '#FFC8C8', '#FFE0E0'];

    const topItemsData = foodItems.map((item, index) => ({
      name: item._id,
      value: total ? Number(((item.totalOrders / total) * 100).toFixed(1)) : 0,
      color: colors[index % colors.length],
    }));

    // Ensure all categories are included, even those with zero orders
    const allCategoriesData = categories.map((category, index) => {
      const found = topItemsData.find((item) => item.name === category);
      return found || {
        name: category,
        value: 0,
        color: colors[index % colors.length],
      };
    });

    res.json({
      success: true,
      topItemsData: allCategoriesData,
    });
  } catch (error) {
    console.error('Get most sold items error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

export {
  adminLogin,
  addRestaurant,
  getRestaurants,
  updateRestaurantAvailability,
  updateRestaurant,
  verifyAdminPassword,
  deleteRestaurant,
  getDashboardStats,
  getDailyOrderTrends,
  getRevenuePerRestaurant,
  getMostSoldItems,
};
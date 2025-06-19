import restaurantModel from '../models/restaurantModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import foodItemModel from '../models/foodItemModel.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Restaurant Login
const restaurantLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const restaurant = await restaurantModel.findOne({ restaurantemail: email });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, restaurant.restaurantpassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: restaurant._id, email: restaurant.restaurantemail },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
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
    console.error('Restaurant login error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Get Restaurant Profile
const getRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findById(req.restaurant.id).select(
      'restaurantid restaurantname restaurantemail phone address availability image rating orderCount'
    );
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, restaurant });
  } catch (error) {
    console.error('Get restaurant profile error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Update Restaurant Profile
const updateRestaurantProfile = async (req, res) => {
  try {
    const { restaurantname, address, phone, password, availability } = req.body;
    const image = req.files?.image;

    // Validate required fields
    if (!restaurantname || !address || !phone) {
      return res.status(400).json({ success: false, message: 'Restaurant name, address, and phone are required' });
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
    }

    // Validate password length if provided
    if (password && password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const updateData = { restaurantname, address, phone, availability };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.restaurantpassword = await bcrypt.hash(password, salt);
    }

    if (image) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ggu_foodies/restaurants' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(image.data);
      });
      updateData.image = uploadResult.secure_url;
    }

    const restaurant = await restaurantModel.findByIdAndUpdate(
      req.restaurant.id,
      updateData,
      { new: true, select: 'restaurantid restaurantname restaurantemail phone address availability image rating orderCount' }
    );

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      restaurant,
    });
  } catch (error) {
    console.error('Update restaurant profile error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Verify Restaurant Password
const verifyRestaurantPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const restaurant = await restaurantModel.findById(req.restaurant.id).select('restaurantpassword');
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const isMatch = await bcrypt.compare(password, restaurant.restaurantpassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    res.json({ success: true, message: 'Password verified successfully' });
  } catch (error) {
    console.error('Verify restaurant password error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Add Food Item
const addFoodItem = async (req, res) => {
  try {
    const { dishname, dineinPrice, takeawayPrice, category, foodtype, description } = req.body;
    const dishphoto = req.files?.dishphoto;

    if (!dishname || !dineinPrice || !takeawayPrice || !category || !foodtype) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const restaurantid = req.restaurant.id;

    const restaurant = await restaurantModel.findById(restaurantid).select('restaurantid');
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const lastItem = await foodItemModel
      .find({ restaurantid })
      .sort({ foodItemId: -1 })
      .limit(1);

    let nextNumber = 1;
    if (lastItem.length > 0) {
      const lastId = lastItem[0].foodItemId;
      const match = lastId.match(/-FI(\d{3})$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const foodItemId = `${restaurant.restaurantid}-FI${String(nextNumber).padStart(3, '0')}`;

    let dishphotoUrl = '';
    if (dishphoto) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ggu_foodies/food_items' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(dishphoto.data);
      });
      dishphotoUrl = uploadResult.secure_url;
    }

    const newFoodItem = new foodItemModel({
      foodItemId,
      restaurantid,
      dishname: dishname.trim(),
      dishphoto: dishphotoUrl,
      category,
      dineinPrice: parseFloat(dineinPrice),
      takeawayPrice: parseFloat(takeawayPrice),
      foodtype,
      description: description ? description.trim() : '',
      availability: true,
      rating: 0,
      ratingsCount: 0,
      totalOrders: 0,
      totalRevenue: 0,
    });

    await newFoodItem.save();

    res.status(201).json({
      success: true,
      message: 'Food item added successfully',
      foodItem: {
        foodItemId: newFoodItem.foodItemId,
        dishname: newFoodItem.dishname,
        dineinPrice: newFoodItem.dineinPrice,
        takeawayPrice: newFoodItem.takeawayPrice,
        category: newFoodItem.category,
        foodtype: newFoodItem.foodtype,
        description: newFoodItem.description,
        dishphoto: newFoodItem.dishphoto,
        availability: newFoodItem.availability,
        rating: newFoodItem.rating,
      },
    });
  } catch (error) {
    console.error('Add food item error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Get Restaurant Menu
const getRestaurantMenu = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const foodItems = await foodItemModel.find({ restaurantid: restaurantId }).select(
      'foodItemId dishname dishphoto category dineinPrice takeawayPrice foodtype description availability rating'
    );

    if (!foodItems) {
      return res.status(404).json({ success: false, message: 'No food items found' });
    }

    res.json({
      success: true,
      foodItems: foodItems.map(item => ({
        id: item.foodItemId,
        name: item.dishname,
        image: item.dishphoto,
        category: item.category,
        price: item.dineinPrice,
        takeawayPrice: item.takeawayPrice,
        isVeg: item.foodtype === 'Vegetarian',
        description: item.description,
        isAvailable: item.availability,
        rating: item.rating,
      })),
    });
  } catch (error) {
    console.error('Get restaurant menu error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Update a food item
const updateFoodItem = async (req, res) => {
  try {
    const { foodItemId } = req.params;
    const { dishname, category, dineinPrice, takeawayPrice, foodtype, description, availability } = req.body;
    const dishphoto = req.files?.dishphoto;

    console.log('Received update request body:', req.body);

    const restaurantId = req.restaurant.id;

    const foodItem = await foodItemModel.findOne({ foodItemId, restaurantid: restaurantId });
    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const updateData = {};
    if (dishname !== undefined) updateData.dishname = dishname.trim();
    if (category !== undefined) updateData.category = category;
    if (dineinPrice !== undefined && !isNaN(parseFloat(dineinPrice))) {
      updateData.dineinPrice = parseFloat(dineinPrice);
    }
    if (takeawayPrice !== undefined && !isNaN(parseFloat(takeawayPrice))) {
      updateData.takeawayPrice = parseFloat(takeawayPrice);
    }
    if (foodtype !== undefined) updateData.foodtype = foodtype;
    if (description !== undefined) updateData.description = description.trim() || '';
    if (availability !== undefined) updateData.availability = availability;

    if (dishphoto) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ggu_foodies/food_items' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(dishphoto.data);
      });
      updateData.dishphoto = uploadResult.secure_url;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    const updatedItem = await foodItemModel.findOneAndUpdate(
      { foodItemId, restaurantid: restaurantId },
      { $set: updateData },
      { new: true, select: 'foodItemId dishname dishphoto category dineinPrice takeawayPrice foodtype description availability rating' }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    res.json({
      success: true,
      message: 'Food item updated successfully',
      foodItem: {
        id: updatedItem.foodItemId,
        name: updatedItem.dishname,
        image: updatedItem.dishphoto,
        category: updatedItem.category,
        price: updatedItem.dineinPrice,
        takeawayPrice: updatedItem.takeawayPrice,
        isVeg: updatedItem.foodtype === 'Vegetarian',
        description: updatedItem.description,
        isAvailable: updatedItem.availability,
        rating: updatedItem.rating,
      },
    });
  } catch (error) {
    console.error('Update food item error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Delete a food item
const deleteFoodItem = async (req, res) => {
  try {
    const { foodItemId } = req.params;
    const restaurantId = req.restaurant.id;

    const foodItem = await foodItemModel.findOne({ foodItemId, restaurantid: restaurantId });
    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    await foodItemModel.deleteOne({ foodItemId, restaurantid: restaurantId });

    res.json({
      success: true,
      message: 'Food item deleted successfully',
    });
  } catch (error) {
    console.error('Delete food item error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Get All Restaurants (Public)
const getAllRestaurantsPublic = async (req, res) => {
  try {
    const restaurants = await restaurantModel.find();
    res.status(200).json({ success: true, restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get All Food Items (Public)
const getAllFoodItems = async (req, res) => {
  try {
    const foodItems = await foodItemModel.find().populate('restaurantid');
    res.status(200).json({ success: true, foodItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get Restaurant Orders
const getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const restaurant = await restaurantModel.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const orders = await Order.find({ restaurantid: restaurantId })
      .populate('userId', 'name phone')
      .lean();

    res.json({
      success: true,
      orders: orders.map(order => ({
        ...order,
        orderType: order.orderType === 'dining' ? 'dining' : 'takeaway',
        totalAmount: order.total,
      })),
    });
  } catch (error) {
    console.error('Get restaurant orders error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Accept Order
const acceptOrder = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const { orderId } = req.params;

    const restaurant = await restaurantModel.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (!restaurant.availability) {
      return res.status(400).json({ success: false, message: 'Restaurant is closed' });
    }

    const order = await Order.findOne({ orderId, restaurantid: restaurantId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order cannot be accepted' });
    }

    order.status = 'confirmed';
    order.confirmedAt = new Date();
    await order.save();

    const populatedOrder = await Order.findOne({ orderId })
      .populate('userId', 'name phone')
      .lean();

    res.json({
      success: true,
      message: 'Order accepted successfully',
      order: populatedOrder,
    });
  } catch (error) {
    console.error('Accept order error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurant.id;

    const order = await Order.findOne({ orderId, restaurantid: restaurantId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Start Preparing Order
const startPreparingOrder = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId, restaurantid: restaurantId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Order cannot be prepared' });
    }

    order.status = 'preparing';
    await order.save();

    const populatedOrder = await Order.findOne({ orderId })
      .populate('userId', 'name phone')
      .lean();

    res.json({
      success: true,
      message: 'Order preparation started',
      order: populatedOrder,
    });
  } catch (error) {
    console.error('Start preparing order error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Mark Order as Prepared
const markOrderPrepared = async (req, res) => {
  try {
    const { orderId } = req.params;
    const restaurantId = req.restaurant.id;

    const order = await Order.findOne({ orderId, restaurantid: restaurantId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'preparing') {
      return res.status(400).json({ success: false, message: 'Order cannot be marked as prepared' });
    }

    order.status = 'ready';
    await order.save();

    res.json({ success: true, message: 'Order marked as prepared' });
  } catch (error) {
    console.error('Mark prepared order error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Complete Order
const completeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const restaurantId = req.restaurant.id;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    const order = await Order.findOne({ orderId, restaurantid: restaurantId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'ready') {
      return res.status(400).json({ success: false, message: 'Order is not ready to be completed' });
    }

    if (String(order.otp) !== String(otp)) {
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    // Mark the order as completed
    order.status = 'completed';
    await order.save();

    // Update restaurant's order count and total revenue
    await restaurantModel.findByIdAndUpdate(
      restaurantId,
      {
        $inc: { orderCount: 1, totalRevenue: order.total },
      },
      { new: true }
    );

    // Update each food item's totalOrders and totalRevenue
    for (const item of order.items) {
      const { name, quantity, price } = item;

      // Find the corresponding food item by dishname and restaurantid
      const foodItem = await foodItemModel.findOne({
        dishname: name,
        restaurantid: restaurantId,
      });

      if (foodItem) {
        // Calculate revenue for this item (price * quantity)
        const itemRevenue = price * quantity;

        // Update totalOrders and totalRevenue atomically
        await foodItemModel.findOneAndUpdate(
          { _id: foodItem._id },
          {
            $inc: {
              totalOrders: quantity, // Increment by the quantity ordered
              totalRevenue: itemRevenue, // Increment by price * quantity
            },
          },
          { new: true }
        );
      } else {
        console.warn(`Food item "${name}" not found for restaurant ${restaurantId}`);
      }
    }

    res.json({ success: true, message: 'Order completed successfully' });
  } catch (error) {
    console.error('Complete order error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Update Restaurant Availability
const updateRestaurantAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    // Validate that availability is provided and is a boolean
    if (availability === undefined || typeof availability !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Availability must be a boolean value' });
    }

    const restaurant = await restaurantModel.findByIdAndUpdate(
      req.restaurant.id,
      { availability },
      { new: true, select: 'restaurantid restaurantname restaurantemail phone address availability image rating orderCount' }
    );

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.json({
      success: true,
      message: `Restaurant is now ${availability ? 'Open' : 'Closed'}`,
      restaurant,
    });
  } catch (error) {
    console.error('Update restaurant availability error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Get Dashboard Data
const getDashboardData = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    const restaurant = await restaurantModel.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Get current date in Asia/Kolkata
    const now = new Date();
    // Create a date object in IST using toLocaleString
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    // Define todayStart (00:00 IST) and todayEnd (23:59:59.999 IST)
    const todayStart = new Date(istDate.getFullYear(), istDate.getMonth(), istDate.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999); // Set to end of the day

    // Yesterday's start and end
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Last 7 days (including today)
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(todayStart.getDate() - 6);

    // This month and last month date ranges
    const thisMonthStart = new Date(istDate.getFullYear(), istDate.getMonth(), 1);
    const lastMonthStart = new Date(istDate.getFullYear(), istDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setMilliseconds(lastMonthEnd.getMilliseconds() - 1); // End of last month

    // Stats: Total Orders and Total Profit (already stored in restaurant model)
    const totalOrders = restaurant.orderCount;
    const totalProfit = restaurant.totalRevenue;

    // Today's Orders and Profit
    const todayOrdersData = await Order.aggregate([
      {
        $match: {
          restaurantid: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: todayStart, $lte: todayEnd },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          todayOrders: { $sum: 1 },
          todayProfit: { $sum: '$total' },
        },
      },
    ]);

    const todayOrders = todayOrdersData.length > 0 ? todayOrdersData[0].todayOrders : 0;
    const todayProfit = todayOrdersData.length > 0 ? todayOrdersData[0].todayProfit : 0;

    // Yesterday's Orders and Profit (for percentage change)
    const yesterdayOrdersData = await Order.aggregate([
      {
        $match: {
          restaurantid: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          yesterdayOrders: { $sum: 1 },
          yesterdayProfit: { $sum: '$total' },
        },
      },
    ]);

    const yesterdayOrders = yesterdayOrdersData.length > 0 ? yesterdayOrdersData[0].yesterdayOrders : 0;
    const yesterdayProfit = yesterdayOrdersData.length > 0 ? yesterdayOrdersData[0].yesterdayProfit : 0;

    // Calculate percentage changes for today vs. yesterday
    const todayOrdersChange = yesterdayOrders !== 0
      ? Math.round(((todayOrders - yesterdayOrders) / yesterdayOrders) * 100)
      : todayOrders > 0 ? 100 : 0;
    const todayProfitChange = yesterdayProfit !== 0
      ? Math.round(((todayProfit - yesterdayProfit) / yesterdayProfit) * 100)
      : todayProfit > 0 ? 100 : 0;

    // This Month's Orders and Profit (for percentage change)
    const thisMonthOrdersData = await Order.aggregate([
      {
        $match: {
          restaurantid: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: thisMonthStart },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          thisMonthOrders: { $sum: 1 },
          thisMonthProfit: { $sum: '$total' },
        },
      },
    ]);

    const thisMonthOrders = thisMonthOrdersData.length > 0 ? thisMonthOrdersData[0].thisMonthOrders : 0;
    const thisMonthProfit = thisMonthOrdersData.length > 0 ? thisMonthOrdersData[0].thisMonthProfit : 0;

    // Last Month's Orders and Profit (for percentage change)
    const lastMonthOrdersData = await Order.aggregate([
      {
        $match: {
          restaurantid: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          lastMonthOrders: { $sum: 1 },
          lastMonthProfit: { $sum: '$total' },
        },
      },
    ]);

    const lastMonthOrders = lastMonthOrdersData.length > 0 ? lastMonthOrdersData[0].lastMonthOrders : 0;
    const lastMonthProfit = lastMonthOrdersData.length > 0 ? lastMonthOrdersData[0].lastMonthProfit : 0;

    // Calculate percentage changes for this month vs. last month
    const totalOrdersChange = lastMonthOrders !== 0
      ? Math.round(((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100)
      : thisMonthOrders > 0 ? 100 : 0;
    const totalProfitChange = lastMonthProfit !== 0
      ? Math.round(((thisMonthProfit - lastMonthProfit) / lastMonthProfit) * 100)
      : thisMonthProfit > 0 ? 100 : 0;

    // Daily Order Trends (last 7 days)
    const dailyOrderTrendsData = await Order.aggregate([
      {
        $match: {
          restaurantid: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: sevenDaysAgo },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Kolkata',
            },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Map the last 7 days to ensure we have data for each day
    const dailyOrderTrends = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const dayName = date.toLocaleString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' });
      // Format date in Asia/Kolkata timezone to match the aggregation _id
      const dateString = date.toLocaleString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Kolkata'
      }).split('/').reverse().join('-'); // Converts to YYYY-MM-DD in Asia/Kolkata
      const dayData = dailyOrderTrendsData.find(d => d._id === dateString);
      dailyOrderTrends.push({
        day: dayName,
        orders: dayData ? dayData.orders : 0,
      });
    }

    // Revenue by Category
    const revenueByCategoryData = await foodItemModel.aggregate([
      {
        $match: {
          restaurantid: restaurantId.toString(),
          totalRevenue: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: '$category',
          revenue: { $sum: '$totalRevenue' },
        },
      },
      {
        $project: {
          category: '$_id',
          revenue: 1,
          _id: 0,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Most Sold Items
    const mostSoldItemsData = await foodItemModel.aggregate([
      {
        $match: {
          restaurantid: restaurantId.toString(),
          totalOrders: { $gt: 0 },
        },
      },
      {
        $sort: { totalOrders: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          name: '$dishname',
          count: '$totalOrders',
          _id: 0,
        },
      },
    ]);

    const totalSoldItems = mostSoldItemsData.reduce((sum, item) => sum + item.count, 0);
    const mostSoldItems = mostSoldItemsData.map(item => ({
      ...item,
      percentage: totalSoldItems > 0 ? Math.round((item.count / totalSoldItems) * 100) : 0,
    }));

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalProfit,
        todayOrders,
        todayProfit,
        totalOrdersChange: totalOrdersChange >= 0 ? `+${totalOrdersChange}% from last month` : `${totalOrdersChange}% from last month`,
        totalProfitChange: totalProfitChange >= 0 ? `+${totalProfitChange}% from last month` : `${totalProfitChange}% from last month`,
        todayOrdersChange: todayOrdersChange >= 0 ? `+${todayOrdersChange}% from yesterday` : `${todayOrdersChange}% from yesterday`,
        todayProfitChange: todayProfitChange >= 0 ? `+${todayProfitChange}% from yesterday` : `${todayProfitChange}% from yesterday`,
      },
      dailyOrderTrends,
      revenueByCategory: revenueByCategoryData,
      mostSoldItems,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// Rate Food Item
const rateFoodItem = async (req, res) => {
    try {
        const { foodItemId, rating, orderId } = req.body;
        const userId = req.user.id; // Assuming user is authenticated

        // Validate input
        if (!foodItemId || !rating || rating < 1 || rating > 5 || !orderId) {
            return res.status(400).json({
                success: false,
                message: 'Food item ID, rating (1-5), and order ID are required',
            });
        }

        // Find the order to verify it belongs to the user and is completed
        const order = await Order.findOne({ orderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Order must be completed to submit ratings',
            });
        }

        if (order.hasRated) {
            return res.status(400).json({
                success: false,
                message: 'You have already rated this order',
            });
        }

        // Find the food item by foodItemId
        const foodItem = await foodItemModel.findOne({ foodItemId });
        if (!foodItem) {
            return res.status(404).json({
                success: false,
                message: `Food item with ID ${foodItemId} not found`,
            });
        }

        // Check if the food item is part of the order
        const orderItem = order.items.find((item) => item.foodItemId === foodItemId);
        if (!orderItem) {
            return res.status(400).json({
                success: false,
                message: 'This food item was not part of the order',
            });
        }

        // Check if user already rated this food item for this order
        const existingRatingIndex = foodItem.userRatings.findIndex(
            (r) => r.userId.toString() === userId && r.orderId === orderId
        );

        if (existingRatingIndex !== -1) {
            // Update existing rating
            foodItem.userRatings[existingRatingIndex].rating = rating;
        } else {
            // Add new rating
            foodItem.userRatings.push({ userId, rating, orderId });
            foodItem.ratingsCount += 1;
        }

        // Calculate new average rating for the food item
        const totalRatings = foodItem.userRatings.reduce((sum, r) => sum + r.rating, 0);
        foodItem.rating = Number((totalRatings / foodItem.userRatings.length).toFixed(2));

        await foodItem.save();

        // Update the order's hasRated field
        order.hasRated = true;
        await order.save();

        // Update the restaurant's overall rating
        const restaurant = await restaurantModel.findById(foodItem.restaurantid);
        if (restaurant) {
            const allFoodItems = await foodItemModel.find({
                restaurantid: restaurant._id,
                ratingsCount: { $gt: 0 },
            });

            if (allFoodItems.length > 0) {
                const totalRestaurantRatings = allFoodItems.reduce(
                    (sum, item) => sum + item.rating * item.ratingsCount,
                    0
                );
                const totalRestaurantRatingsCount = allFoodItems.reduce(
                    (sum, item) => sum + item.ratingsCount,
                    0
                );
                restaurant.rating = Number(
                    (totalRestaurantRatings / totalRestaurantRatingsCount).toFixed(2)
                );
                await restaurant.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Rating submitted successfully',
            foodItem: {
                foodItemId: foodItem.foodItemId,
                dishname: foodItem.dishname,
                rating: foodItem.rating,
                ratingsCount: foodItem.ratingsCount,
            },
        });
    } catch (error) {
        console.error('Rate food item error:', error.stack);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

export {
  restaurantLogin,
  getRestaurantProfile,
  updateRestaurantProfile,
  verifyRestaurantPassword,
  addFoodItem,
  getRestaurantMenu,
  updateFoodItem,
  deleteFoodItem,
  getAllRestaurantsPublic,
  getAllFoodItems,
  getRestaurantOrders,
  acceptOrder,
  cancelOrder,
  startPreparingOrder,
  markOrderPrepared,
  completeOrder,
  updateRestaurantAvailability,
  getDashboardData,
  rateFoodItem
};
import express from 'express';
import FoodItem from '../models/foodItemModel.js';
import Restaurant from '../models/restaurantModel.js';

const router = express.Router();

// Get all food items
router.get('/all-food-items', async (req, res) => {
    try {
        const foodItems = await FoodItem.find().populate('restaurantid', 'restaurantname');
        if (!foodItems.length) {
            return res.status(404).json({ success: false, message: 'No food items found' });
        }
        res.status(200).json({
            success: true,
            foodItems: foodItems.map(item => ({
                _id: item._id, // Include _id
                dishname: item.dishname,
                dishphoto: item.dishphoto,
                restaurantid: item.restaurantid,
                category: item.category,
                dineinPrice: item.dineinPrice,
                description: item.description,
                availability: item.availability,
            })),
        });
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all restaurants
router.get('/restaurants', async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        if (!restaurants.length) {
            return res.status(404).json({ success: false, message: 'No restaurants found' });
        }
        res.status(200).json({
            success: true,
            restaurants: restaurants.map(restaurant => ({
                _id: restaurant._id,
                restaurantname: restaurant.restaurantname,
                image: restaurant.image,
                address: restaurant.address,
                availability: restaurant.availability,
                rating: restaurant.rating || 4.5,
            })),
        });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
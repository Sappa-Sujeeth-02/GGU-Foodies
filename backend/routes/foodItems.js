import express from 'express';
import FoodItem from '../models/foodItemModel.js';
import Order from '../models/Order.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/ratings', async (req, res) => {
    const { orderId, ratings } = req.body;
    const userId = req.user.userId;

    try {
        const order = await Order.findOne({ orderId, userId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'completed') {
            return res.status(400).json({ message: 'Order must be completed to submit ratings' });
        }

        if (order.hasRated) {
            return res.status(400).json({ message: 'You have already rated this order' });
        }

        const foodItems = await FoodItem.find({
            foodItemId: { $in: order.items.map((item) => item.foodItemId) },
        });

        for (const { foodItemId, rating } of ratings) {
            const foodItem = foodItems.find((item) => item.foodItemId === foodItemId);
            if (!foodItem) {
                return res.status(404).json({ message: `Food item ${foodItemId} not found` });
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

            // Calculate new average rating
            const totalRatings = foodItem.userRatings.reduce((sum, r) => sum + r.rating, 0);
            foodItem.rating = Number((totalRatings / foodItem.userRatings.length).toFixed(2));

            await foodItem.save();
        }

        // Update the order's hasRated field
        order.hasRated = true;
        await order.save();

        res.status(200).json({ message: 'Ratings submitted successfully' });
    } catch (error) {
        console.error('Error submitting ratings:', error);
        res.status(500).json({ message: 'Failed to submit ratings', error: error.message });
    }
});

router.get('/ratings/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.userId;

    try {
        const order = await Order.findOne({ orderId, userId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const foodItems = await FoodItem.find({
            foodItemId: { $in: order.items.map((item) => item.foodItemId) },
        });

        const hasRatedInFoodItems = foodItems.some((item) =>
            item.userRatings.some((rating) => rating.userId.toString() === userId && rating.orderId === orderId)
        );

        // Use the hasRated field from the Order as the primary source, but also check foodItems for consistency
        const hasRated = order.hasRated || hasRatedInFoodItems;

        res.status(200).json({ hasRated });
    } catch (error) {
        console.error('Error checking ratings:', error);
        res.status(500).json({ message: 'Failed to check ratings', error: error.message });
    }
});

export default router;
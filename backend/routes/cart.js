import express from 'express';
import Cart from '../models/Cart.js';
import FoodItem from '../models/foodItemModel.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();
router.use(authMiddleware);

// Add item to cart
router.post('/add', async (req, res) => {
    const { foodItemId, quantity } = req.body;

    try {
        // Validate food item
        const foodItem = await FoodItem.findById(foodItemId).populate('restaurantid', 'restaurantname');
        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) {
            cart = new Cart({ userId: req.user.userId, items: [] });
        }

        // Check if cart already has items and enforce same food court rule
        if (cart.items.length > 0) {
            const existingCourt = cart.items[0].restaurant; // Get the restaurant of the first item
            const newItemCourt = foodItem.restaurantid.restaurantname;
            if (existingCourt !== newItemCourt) {
                return res.status(400).json({ message: 'Add items from the same food court only.' });
            }
        }

        // Check if item already exists in cart
        const itemIndex = cart.items.findIndex(item => item.foodItemId.toString() === foodItemId);
        if (itemIndex >= 0) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                foodItemId,
                name: foodItem.dishname,
                description: foodItem.description,
                price: foodItem.dineinPrice,
                takeawayPrice: foodItem.takeawayPrice, // Add takeawayPrice to cart item
                quantity,
                image: foodItem.dishphoto,
                restaurant: foodItem.restaurantid.restaurantname,
            });
        }

        await cart.save();
        res.status(200).json({ message: 'Item added to cart', items: cart.items });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
    }
});

// Update item quantity
router.put('/update/:itemName', async (req, res) => {
    const { quantity } = req.body;
    const itemName = decodeURIComponent(req.params.itemName);

    try {
        const cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.name === itemName);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        res.status(200).json({ message: 'Cart updated', items: cart.items });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update cart', error: error.message });
    }
});

// Remove item from cart
router.delete('/remove/:itemName', async (req, res) => {
    const itemName = decodeURIComponent(req.params.itemName);

    try {
        const cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.name !== itemName);
        await cart.save();
        res.status(200).json({ message: 'Item removed from cart', items: cart.items });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
    }
});

// Get cart
router.get('/', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) {
            return res.status(200).json({ items: [] });
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
    }
});

export default router;
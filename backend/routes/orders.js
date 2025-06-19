import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import FoodItem from '../models/foodItemModel.js';
import authMiddleware from '../middlewares/auth.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();
router.use(authMiddleware);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order and payment
router.post('/create', async (req, res) => {
    const { orderType, subtotal, serviceCharge, total } = req.body;

    try {
        // Get user's cart and populate foodItemId to access restaurantid
        const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.foodItemId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Ensure all items are from the same restaurant
        const restaurantIds = [...new Set(cart.items.map(item => item.foodItemId?.restaurantid?.toString()))];
        if (restaurantIds.length > 1 || !restaurantIds[0]) {
            return res.status(400).json({ message: 'All items must be from the same restaurant' });
        }
        const restaurantid = restaurantIds[0];

        // Use the total sent from the frontend instead of recalculating
        console.log('Received from frontend:', { subtotal, serviceCharge, total });

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: total * 100, // Use the total sent from frontend (in paise)
            currency: 'INR',
            receipt: `order_${Date.now()}`,
        });

        console.log('Razorpay Order Created:', razorpayOrder);

        // Create our order (but don't save yet)
        const order = new Order({
            userId: req.user.userId,
            restaurantid, // Add restaurantid
            items: cart.items.map(item => ({
                foodItemId: item.foodItemId.foodItemId, // Include foodItemId
                name: item.name,
                description: item.description,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                restaurant: item.restaurant,
            })),
            orderType,
            subtotal,
            serviceCharge,
            total,
            status: 'pending',
        });

        res.status(200).json({
            message: 'Order created successfully',
            order: order.toObject(),
            razorpayOrder,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
});

// Verify payment and save order
router.post('/verify', async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order } = req.body;

    try {
        // Verify payment
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed' });
        }

        // Remove the _id field from the order object
        delete order._id;

        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000);

        // Create and save the order with the OTP and restaurantid
        const newOrder = new Order({
            ...order,
            status: 'pending', // Set status to pending after payment
            createdAt: new Date(),
            otp,
            restaurantid: order.restaurantid, // Ensure restaurantid is included
        });
        await newOrder.save();

        // Clear the cart
        await Cart.deleteOne({ userId: req.user.userId });

        // Emit socket event to the specific user's room
        const orderToEmit = newOrder.toObject();
        console.log(`Emitting orderUpdate to user ${order.userId}:`, orderToEmit);
        req.io.to(order.userId.toString()).emit('orderUpdate', orderToEmit);

        res.status(200).json({
            message: 'Payment successful and order created',
            order: newOrder,
        });
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ message: 'Failed to verify payment', error: error.message });
    }
});

// Get user's orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId })
            .populate('restaurantid', 'restaurantname address phone restaurantemail') // Updated to include phone and email
            .sort({ createdAt: -1 })
            .limit(10);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Cancel order (before confirmed)
router.post('/:orderId/cancel', async (req, res) => {
    try {
        const order = await Order.findOne({
            orderId: req.params.orderId,
            userId: req.user.userId,
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order cannot be cancelled after confirmation' });
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
        await order.save();

        // Emit socket event to the specific user's room
        const orderToEmit = order.toObject();
        console.log(`Emitting orderUpdate to user ${order.userId}:`, orderToEmit);
        req.io.to(order.userId.toString()).emit('orderUpdate', orderToEmit);

        res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel order' });
    }
});

// Update OTP for an existing order
router.put('/:orderId/update-otp', async (req, res) => {
    const { otp } = req.body;

    try {
        const order = await Order.findOne({
            orderId: req.params.orderId,
            userId: req.user.userId,
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.otp = otp;
        await order.save();

        // Emit socket event to the specific user's room
        const orderToEmit = order.toObject();
        console.log(`Emitting orderUpdate to user ${order.userId}:`, orderToEmit);
        req.io.to(order.userId.toString()).emit('orderUpdate', orderToEmit);

        res.status(200).json({ message: 'OTP updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update OTP' });
    }
});

// Update order status (for admin/food court staff)
router.post('/:orderId/update-status', async (req, res) => {
    const { status } = req.body;
    const { orderId } = req.params;

    try {
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Update confirmedAt timestamp if status is changing to confirmed
        if (status === 'confirmed' && order.status === 'pending') {
            order.confirmedAt = new Date();
        }

        order.status = status;
        await order.save();

        // Emit socket event to the specific user's room
        const orderToEmit = order.toObject();
        console.log(`Emitting orderUpdate to user ${order.userId}:`, orderToEmit);
        req.io.to(order.userId.toString()).emit('orderUpdate', orderToEmit);

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
});

export default router;
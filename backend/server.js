import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import './config/cloudinary.js'; // Cloudinary configuration handled here
import cors from 'cors';
import fileUpload from 'express-fileupload';
import connectDB from './config/mongodb.js';
import authRoutes from './routes/auth.js';
import otpRoutes from './routes/otp.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoute from './routes/adminRoute.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import foodItemRoutes from './routes/foodItems.js';
import cron from 'node-cron'; // Add node-cron import
import Order from './models/Order.js'; // Add Order model import for cron job

// Validate Cloudinary environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary configuration failed: Missing environment variables');
    process.exit(1);
}

const app = express();

// Connect to MongoDB
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    abortOnLimit: true,
}));
app.use((req, res, next) => {
    if (req.files) { // Only log if req.files is defined
        console.log('File upload middleware - req.files:', req.files);
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoute);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/food-items', foodItemRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('API is working');
});

// Cron job to decrement estimatedTime every minute
cron.schedule('* * * * *', async () => {
    try {
        const result = await Order.updateMany(
            { 
                status: { $in: ['confirmed', 'preparing'] }, 
                estimatedTime: { $gt: 0 } 
            },
            { $inc: { estimatedTime: -1 } }
        );
        console.log(`Decremented estimatedTime for ${result.modifiedCount} orders`);
    } catch (error) {
        console.error('Cron job error:', error.stack);
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
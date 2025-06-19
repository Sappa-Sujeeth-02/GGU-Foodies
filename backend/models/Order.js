import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({

    foodItemId: { // Added to track specific food item
        type: String,
        required: true,
    }, name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    restaurant: {
        type: String,
        required: true,
    },
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restaurantid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    items: [orderItemSchema],
    orderType: {
        type: String,
        enum: ['dining', 'takeaway'],
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    serviceCharge: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending',
    },
    estimatedTime: {
        type: Number, // in minutes
        default: 15,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    confirmedAt: {
        type: Date,
    },
    cancelledAt: {
        type: Date,
    },
    otp: {
        type: Number,
    },
    hasRated: {
        type: Boolean,
        default: false, // Default to false; set to true after ratings are submitted
    },
});

// Auto-increment orderId
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        try {
            const lastOrder = await Order.findOne().sort({ orderId: -1 }).limit(1);
            this.orderId = lastOrder ? lastOrder.orderId + 1 : 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
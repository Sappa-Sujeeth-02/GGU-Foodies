import mongoose from 'mongoose';

// Helper function to update restaurant rating
const updateRestaurantRating = async (restaurantId) => {
  try {
    const foodItems = await mongoose.model('FoodItem').find({
      restaurantid: restaurantId,
      rating: { $gt: 0 },
    });

    console.log(`📌 Found ${foodItems.length} rated food items for restaurant ID ${restaurantId}`);

    if (foodItems.length === 0) {
      await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, { rating: 0 });
      console.log('✅ No ratings found. Set restaurant rating to 0');
      return;
    }

    const totalRating = foodItems.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = Number((totalRating / foodItems.length).toFixed(2));

    console.log(`✅ Total Ratings: ${totalRating}, Average Rating: ${averageRating}`);

    await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
      rating: averageRating,
    });

    console.log(`✅ Updated restaurant (${restaurantId}) rating to ${averageRating}`);
  } catch (error) {
    console.error('❌ Error updating restaurant rating:', error.stack);
  }
};

const foodItemSchema = new mongoose.Schema(
  {
    foodItemId: {
      type: String,
      required: true,
      unique: true,
    },
    restaurantid: {
      type: String,
      required: true,
      ref: 'Restaurant',
    },
    dishname: {
      type: String,
      required: true,
      trim: true,
    },
    dishphoto: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Beverages',
        'Breakfast Items',
        'Noodles & Fried Rice',
        'Biryanis & Meals',
        'Chicken Specials',
        'Veg Specials & Curries',
        'Egg Dishes',
        'Snacks/Sides',
      ],
    },
    dineinPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    takeawayPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    foodtype: {
      type: String,
      required: true,
      enum: ['Vegetarian', 'Non-Vegetarian'],
    },
    description: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    userRatings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
    availability: {
      type: Boolean,
      default: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Post-save hook to update restaurant rating
foodItemSchema.post('save', async function (doc) {
  try {
    await updateRestaurantRating(doc.restaurantid);
  } catch (error) {
    console.error('Error in post-save hook:', error.stack);
  }
});

// Post-update hook to handle updates to userRatings or rating
foodItemSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) {
    await updateRestaurantRating(doc.restaurantid);
  }
});

const foodItemModel = mongoose.model('FoodItem', foodItemSchema);

export default foodItemModel;
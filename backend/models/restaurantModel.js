import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  restaurantid: {
    type: String,
    required: true,
    unique: true,
  },
  restaurantname: {
    type: String,
    required: true,
  },
  restaurantemail: {
    type: String,
    required: true,
    unique: true,
  },
  restaurantpassword: {
    type: String,
    required: true,
  },
  phone: { // Added phone field
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
  },
  address: {
    type: String,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  orderCount: {
    type: Number,
    default: 0,
  },
  totalRevenue: { 
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  minimize: false,
});

const restaurantModel = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

export default restaurantModel;
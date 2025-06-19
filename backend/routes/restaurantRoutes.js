import express from 'express';
import {
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
} from '../controllers/restaurantController.js';
import authRestaurant from '../middlewares/authRestaurant.js';

const router = express.Router();

router.post('/restaurant-login', restaurantLogin);
router.get('/profile', authRestaurant, getRestaurantProfile);
router.put('/profile', authRestaurant, updateRestaurantProfile);
router.post('/verify-password', authRestaurant, verifyRestaurantPassword);
router.post('/add-item', authRestaurant, addFoodItem);
router.get('/menu', authRestaurant, getRestaurantMenu);
router.put('/menu/:foodItemId', authRestaurant, updateFoodItem);
router.delete('/menu/:foodItemId', authRestaurant, deleteFoodItem);
router.get('/restaurants', getAllRestaurantsPublic);
router.get('/all-food-items', getAllFoodItems);
router.get('/orders', authRestaurant, getRestaurantOrders);
router.put('/orders/:orderId/accept', authRestaurant, acceptOrder);
router.put('/orders/:orderId/cancel', authRestaurant, cancelOrder);
router.put('/orders/:orderId/preparing', authRestaurant, startPreparingOrder);
router.put('/orders/:orderId/prepared', authRestaurant, markOrderPrepared);
router.put('/orders/:orderId/complete', authRestaurant, completeOrder);
router.put('/availability', authRestaurant, updateRestaurantAvailability);
router.get('/dashboard', authRestaurant, getDashboardData); 

export default router;
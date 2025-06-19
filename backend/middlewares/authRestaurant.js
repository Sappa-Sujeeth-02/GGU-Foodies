import jwt from 'jsonwebtoken';

const authRestaurant = async (req, res, next) => {
  try {
    const token = req.header('rtoken');
    console.log('Token received:', token); // Debug token
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug decoded payload
    req.restaurant = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message, error.stack);
    return res.status(401).json({ success: false, message: `Invalid token: ${error.message}` });
  }
};

export default authRestaurant;
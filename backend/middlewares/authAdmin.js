import jwt from 'jsonwebtoken';

const authAdmin = (req, res, next) => {
  try {
    const token = req.headers.atoken;
    console.log('AuthAdmin: Token received:', token ? 'Present' : 'Missing');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('AuthAdmin: Token decoded:', decoded);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not an admin' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.error('AuthAdmin: Token validation error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default authAdmin;
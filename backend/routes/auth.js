import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Signup route (after OTP verification)
router.post('/signup', async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ name, email, phone, password, isVerified: true });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ message: 'Account created successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Signup failed. Please try again.' });
    }
});

router.post('/check-user', async (req, res) => {
    const { email, phone } = req.body;
    try {
        const userByEmail = await User.findOne({ email });
        const userByPhone = await User.findOne({ phone });
        res.json({
            emailExists: !!userByEmail,
            phoneExists: !!userByPhone
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while checking user details' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your account' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
});

// Reset Password route
router.post('/reset-password', async (req, res) => {
    const { email, phone, newPassword } = req.body;

    try {
        const user = await User.findOne({ email, phone });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or phone number' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reset password' });
    }
});

// Admin Login route
router.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: 'Admin login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Admin login failed. Please try again.' });
    }
});

// Restaurant Login route
router.post('/restaurant-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: 'restaurant' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: 'Restaurant login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Restaurant login failed. Please try again.' });
    }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('name email phone');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    const { name, phone } = req.body;

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if phone is already used by another user
        if (phone && phone !== user.phone) {
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;
        await user.save();

        res.status(200).json({ _id: user._id, name: user.name, email: user.email, phone: user.phone });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

export default router;
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secret_key';

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const sanitizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (sanitizedUsername.length < 3) {
            return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
        }

        const existing = await User.findOne({ where: { username: sanitizedUsername } });
        if (existing) {
            return res.status(409).json({ error: 'Username is already registered. Please choose another or log in.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = 'customer'; // RESTRICT: Public signup is ALWAYS user/customer

        const user = await User.create({ username: sanitizedUsername, password: hashedPassword, role: userRole });
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'User registration failed. Please try again.' });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!['admin', 'staff'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role for staff creation' });
        }
        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const sanitizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        const existing = await User.findOne({ where: { username: sanitizedUsername } });
        if (existing) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username: sanitizedUsername, password: hashedPassword, role });
        res.status(201).json({ message: 'Staff/Admin created successfully', userId: user.id });
    } catch (error) {
        console.error('Staff creation error:', error);
        res.status(500).json({ error: 'Staff creation failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const sanitizedUsername = username.trim().toLowerCase();
        const user = await User.findOne({ where: { username: sanitizedUsername } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username },
            SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login service temporarily unavailable' });
    }
};

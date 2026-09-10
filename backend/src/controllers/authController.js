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
        const userRole = 'customer'; // RESTRICT: Public signup is STRICTLY customer. Admin/Staff signup is disabled.

        const user = await User.create({ username: sanitizedUsername, password: hashedPassword, role: userRole });
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'User registration failed. Please try again.' });
    }
};

// Only Master Admin (pranith) can add staff users
exports.createStaff = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin' || req.user.username.toLowerCase() !== 'pranith') {
            return res.status(403).json({
                error: 'Unauthorized: Only Master Admin (pranith) has license to add staff'
            });
        }

        const { username, password, role } = req.body;
        const targetRole = role === 'admin' ? 'admin' : 'staff';

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
            return res.status(409).json({ error: `User '${sanitizedUsername}' already exists` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username: sanitizedUsername, password: hashedPassword, role: targetRole });
        res.status(201).json({
            message: `Staff member '${sanitizedUsername}' created successfully with role: ${targetRole}`,
            userId: user.id
        });
    } catch (error) {
        console.error('Staff creation error:', error);
        res.status(500).json({ error: 'Staff creation failed' });
    }
};

// Fetch staff members for Master Admin view
exports.getStaffUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                role: ['admin', 'staff']
            },
            attributes: ['id', 'username', 'role', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff list' });
    }
};

// Remove staff member (cannot delete pranith)
exports.deleteStaffUser = async (req, res) => {
    try {
        const targetUser = await User.findByPk(req.params.id);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (targetUser.username.toLowerCase() === 'pranith') {
            return res.status(400).json({ error: 'Cannot delete the Master Admin account (pranith)' });
        }
        await targetUser.destroy();
        res.json({ success: true, message: `Staff user '${targetUser.username}' removed successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove staff user' });
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

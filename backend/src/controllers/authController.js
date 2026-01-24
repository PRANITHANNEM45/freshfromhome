const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secret_key';

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = 'customer'; // RESTRICT: Public signup is ALWAYS user/customer

        const user = await User.create({ username, password: hashedPassword, role: userRole });
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        res.status(500).json({ error: 'User registration failed', details: error.message });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!['admin', 'staff'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role for staff creation' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashedPassword, role });
        res.status(201).json({ message: 'Staff/Admin created successfully', userId: user.id });
    } catch (error) {
        res.status(500).json({ error: 'Staff creation failed', details: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

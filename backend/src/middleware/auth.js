const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
        return res.status(401).json({ error: 'Access denied: No authorization header provided' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Access denied: Invalid token format. Format must be Bearer <token>' });
    }

    const token = parts[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Access denied: Token is invalid or expired' });
    }
};

const verifyAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
        return res.status(403).json({ error: 'Requires Admin/Staff Access' });
    }
    next();
};

// Strict Master Admin check: Only 'pranith' with role 'admin' has license to manage staff
const verifyMasterAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin' || req.user.username.toLowerCase() !== 'pranith') {
        return res.status(403).json({
            error: 'Access Denied: Only Master Admin (pranith) has license to create and manage staff accounts.'
        });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin, verifyMasterAdmin };

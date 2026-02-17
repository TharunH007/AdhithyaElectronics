const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Protecting route. Token found (last 5 chars):', token.slice(-5));
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified. User ID from token:', decoded.id);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.warn('User not found in DB for ID:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user no longer exists' });
            }

            console.log('User found in DB:', req.user.name);
            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.warn('No token found in request headers');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };

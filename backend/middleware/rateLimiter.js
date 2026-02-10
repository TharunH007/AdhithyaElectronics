const rateLimit = require('express-rate-limit');

// Rate limiter for login attempts
const loginLimiter = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for registration
const registerLimiter = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    message: 'Too many registration attempts from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for password reset requests
const passwordResetLimiter = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    message: 'Too many password reset requests from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    registerLimiter,
    passwordResetLimiter,
};

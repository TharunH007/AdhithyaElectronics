const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateUserProfile,
    getCustomers,
    getCustomerById,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { loginLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/login', loginLimiter, authUser);
router.post('/', registerLimiter, registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.put('/profile', protect, updateUserProfile);

// Admin routes
router.get('/customers', protect, admin, getCustomers);
router.get('/customers/:id', protect, admin, getCustomerById);

module.exports = router;

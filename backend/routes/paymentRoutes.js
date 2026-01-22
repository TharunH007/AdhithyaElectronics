const express = require('express');
const router = express.Router();
const {
    createPaymentOrder,
    verifyPayment,
    getRazorpayKey,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/order').post(protect, createPaymentOrder);
router.route('/verify').post(protect, verifyPayment);
router.route('/key').get(getRazorpayKey); // Public or Protected? Protected is safer but key is public. Usually public.

module.exports = router;

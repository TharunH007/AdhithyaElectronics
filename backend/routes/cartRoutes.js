const express = require('express');
const router = express.Router();
const {
    syncCart,
    getCart,
    clearCartDB,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getCart)
    .post(protect, syncCart)
    .delete(protect, clearCartDB);

module.exports = router;

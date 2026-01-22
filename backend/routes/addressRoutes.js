const express = require('express');
const router = express.Router();
const { getAddresses, addAddress, deleteAddress } = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAddresses)
    .post(protect, addAddress);

router.route('/:id')
    .delete(protect, deleteAddress);

module.exports = router;

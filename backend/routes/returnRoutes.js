const express = require('express');
const router = express.Router();
const {
    createReturnRequest,
    getMyReturns,
    getReturnRequests,
    updateReturnStatus,
} = require('../controllers/returnController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReturnRequest)
    .get(protect, admin, getReturnRequests);

router.route('/myreturns').get(protect, getMyReturns);

router.route('/:id/status').put(protect, admin, updateReturnStatus);

module.exports = router;

const express = require('express');
const { createPayment, getPayment } = require('../controllers/payment.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createPayment);
router.get('/:bookingId', requireAuth, getPayment);

module.exports = router;

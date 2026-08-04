const express = require('express');
const { createBooking, listBookings, cancelBooking } = require('../controllers/booking.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createBooking);
router.get('/', requireAuth, listBookings);
router.delete('/:id', requireAuth, cancelBooking);

module.exports = router;

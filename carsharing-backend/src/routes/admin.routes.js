const express = require('express');
const { getStats, updateBookingStatus, deleteBooking, listUsers } = require('../controllers/admin.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.put('/bookings/:id/status', updateBookingStatus);
router.delete('/bookings/:id', deleteBooking);

module.exports = router;

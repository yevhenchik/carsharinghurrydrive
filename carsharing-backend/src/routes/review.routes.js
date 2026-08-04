const express = require('express');
const { createReview, listCarReviews } = require('../controllers/review.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createReview);
router.get('/car/:carId', listCarReviews);

module.exports = router;

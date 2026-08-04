const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;

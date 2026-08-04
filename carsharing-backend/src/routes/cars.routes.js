const express = require('express');
const { listCars, getCar, createCar, updateCar, deleteCar } = require('../controllers/cars.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', listCars);
router.get('/:id', getCar);
router.post('/', requireAuth, requireAdmin, createCar);
router.put('/:id', requireAuth, requireAdmin, updateCar);
router.delete('/:id', requireAuth, requireAdmin, deleteCar);

module.exports = router;

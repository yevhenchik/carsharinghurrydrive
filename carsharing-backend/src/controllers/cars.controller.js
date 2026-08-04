const prisma = require('../config/db');

// GET /cars?brand=&minPrice=&maxPrice=&transmission=&fuel=&seats=
async function listCars(req, res) {
  try {
    const { brand, minPrice, maxPrice, transmission, fuel, seats } = req.query;

    const where = {
      status: 'AVAILABLE',
      ...(brand && {
        OR: [
          { brand: { startsWith: brand, mode: 'insensitive' } },
          { model: { startsWith: brand, mode: 'insensitive' } },
        ],
      }),
      ...(transmission && { transmission }),
      ...(fuel && { fuel }),
      ...(seats && { seats: Number(seats) }),
      ...((minPrice || maxPrice) && {
        pricePerHour: {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) }),
        },
      }),
    };

    const cars = await prisma.car.findMany({ where, orderBy: { pricePerHour: 'asc' } });
    return res.json(cars);
  } catch (err) {
    console.error('listCars error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// GET /cars/:id
async function getCar(req, res) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: req.params.id },
      include: { reviews: { include: { user: { select: { name: true } } } } },
    });

    if (!car) {
      return res.status(404).json({ error: 'Автомобіль не знайдено' });
    }

    return res.json(car);
  } catch (err) {
    console.error('getCar error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// POST /cars (admin)
async function createCar(req, res) {
  try {
    const { brand, model, year, pricePerHour, transmission, fuel, seats, image } = req.body;

    if (!brand || !model || !year || !pricePerHour || !transmission || !fuel || !seats) {
      return res.status(400).json({ error: "Не всі обов'язкові поля заповнені" });
    }

    const car = await prisma.car.create({
      data: { brand, model, year: Number(year), pricePerHour, transmission, fuel, seats: Number(seats), image },
    });

    return res.status(201).json(car);
  } catch (err) {
    console.error('createCar error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// PUT /cars/:id (admin)
async function updateCar(req, res) {
  try {
    const car = await prisma.car.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json(car);
  } catch (err) {
    console.error('updateCar error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// DELETE /cars/:id (admin)
async function deleteCar(req, res) {
  try {
    await prisma.car.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    console.error('deleteCar error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

module.exports = { listCars, getCar, createCar, updateCar, deleteCar };

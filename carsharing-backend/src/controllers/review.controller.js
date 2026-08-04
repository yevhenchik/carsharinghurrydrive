const prisma = require('../config/db');

// POST /reviews  { carId, rating, comment }
// Дозволено лише якщо у користувача є завершене (COMPLETED) бронювання цього авто
async function createReview(req, res) {
  try {
    const { carId, rating, comment } = req.body;

    if (!carId || !rating) {
      return res.status(400).json({ error: "Поля carId, rating обов'язкові" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating має бути від 1 до 5' });
    }

    const completedBooking = await prisma.booking.findFirst({
      where: { userId: req.user.id, carId, bookingStatus: 'COMPLETED' },
    });

    if (!completedBooking) {
      return res.status(403).json({ error: 'Залишити відгук можна лише після завершеної оренди цього авто' });
    }

    const review = await prisma.review.create({
      data: { userId: req.user.id, carId, rating: Number(rating), comment },
    });

    return res.status(201).json(review);
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// GET /reviews/car/:carId
async function listCarReviews(req, res) {
  try {
    const reviews = await prisma.review.findMany({
      where: { carId: req.params.carId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(reviews);
  } catch (err) {
    console.error('listCarReviews error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

module.exports = { createReview, listCarReviews };

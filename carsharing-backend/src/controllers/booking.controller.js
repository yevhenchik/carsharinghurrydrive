const prisma = require('../config/db');

/**
 * Перевіряє, чи є в цього авто активне бронювання, що перетинається
 * з [startDate, endDate]. Активними вважаються PENDING і CONFIRMED.
 */
async function hasOverlap(carId, startDate, endDate, excludeBookingId = null) {
  const overlapping = await prisma.booking.findFirst({
    where: {
      carId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      bookingStatus: { in: ['PENDING', 'CONFIRMED'] },
      // класична умова перетину інтервалів: existing.start < new.end AND existing.end > new.start
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
  });
  return Boolean(overlapping);
}

function calcHours(start, end) {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// POST /booking (потребує requireAuth)
async function createBooking(req, res) {
  try {
    const { carId, startDate, endDate } = req.body;

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ error: "Поля carId, startDate, endDate обов'язкові" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end) || start >= end) {
      return res.status(400).json({ error: 'Некоректний діапазон дат' });
    }
    if (start < new Date()) {
      return res.status(400).json({ error: 'Дата початку не може бути в минулому' });
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      return res.status(404).json({ error: 'Автомобіль не знайдено' });
    }
    if (car.status !== 'AVAILABLE') {
      return res.status(409).json({ error: 'Автомобіль наразі недоступний' });
    }

    const overlap = await hasOverlap(carId, start, end);
    if (overlap) {
      return res.status(409).json({ error: 'Автомобіль вже заброньовано на ці дати' });
    }

    const hours = calcHours(start, end);
    const totalPrice = Number(car.pricePerHour) * hours;

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        carId,
        startDate: start,
        endDate: end,
        totalPrice,
        bookingStatus: 'PENDING',
      },
      include: { car: true },
    });

    return res.status(201).json(booking);
  } catch (err) {
    console.error('createBooking error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// GET /booking (історія поточного користувача; admin бачить усі через ?all=true)
async function listBookings(req, res) {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const showAll = isAdmin && req.query.all === 'true';

    const bookings = await prisma.booking.findMany({
      where: showAll ? {} : { userId: req.user.id },
      include: {
        car: true,
        payment: true,
        // ім'я користувача потрібне лише в адмінському вигляді (?all=true)
        ...(showAll && { user: { select: { name: true, email: true } } }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(bookings);
  } catch (err) {
    console.error('listBookings error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// DELETE /booking/:id (скасування — тільки власник або admin)
async function cancelBooking(req, res) {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });

    if (!booking) {
      return res.status(404).json({ error: 'Бронювання не знайдено' });
    }
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Немає доступу до цього бронювання' });
    }
    if (booking.bookingStatus === 'COMPLETED') {
      return res.status(409).json({ error: 'Завершене бронювання не можна скасувати' });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { bookingStatus: 'CANCELLED' },
      include: { car: true, payment: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error('cancelBooking error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

module.exports = { createBooking, listBookings, cancelBooking };

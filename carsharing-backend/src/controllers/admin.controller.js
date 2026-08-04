const prisma = require('../config/db');

// GET /admin/stats
async function getStats(req, res) {
  try {
    const [usersCount, carsCount, activeBookings, revenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.car.count(),
      prisma.booking.count({ where: { bookingStatus: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.payment.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    return res.json({
      usersCount,
      carsCount,
      activeBookings,
      totalRevenue: revenueAgg._sum.amount || 0,
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// PUT /admin/bookings/:id/status  { bookingStatus }
async function updateBookingStatus(req, res) {
  try {
    const { bookingStatus } = req.body;
    const allowed = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

    if (!allowed.includes(bookingStatus)) {
      return res.status(400).json({ error: `bookingStatus має бути одним з: ${allowed.join(', ')}` });
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { bookingStatus },
    });

    // Коли оренда завершується — авто знову стає доступним
    if (bookingStatus === 'COMPLETED' || bookingStatus === 'CANCELLED') {
      await prisma.car.update({
        where: { id: booking.carId },
        data: { status: 'AVAILABLE' },
      });
    }

    return res.json(booking);
  } catch (err) {
    console.error('updateBookingStatus error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// DELETE /admin/bookings/:id — повне видалення запису (не скасування статусу)
async function deleteBooking(req, res) {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });

    if (!booking) {
      return res.status(404).json({ error: 'Бронювання не знайдено' });
    }

    await prisma.booking.delete({ where: { id: req.params.id } });

    if (['PENDING', 'CONFIRMED'].includes(booking.bookingStatus)) {
      await prisma.car.update({
        where: { id: booking.carId },
        data: { status: 'AVAILABLE' },
      });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('deleteBooking error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// GET /admin/users
async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(users);
  } catch (err) {
    console.error('listUsers error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

module.exports = { getStats, updateBookingStatus, deleteBooking, listUsers };

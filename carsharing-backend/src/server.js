require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const carsRoutes = require('./routes/cars.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const { stripeWebhook } = require('./controllers/payment.controller');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));

// Stripe webhook потребує "сирого" тіла запиту для перевірки підпису,
// тому підключається ДО express.json()
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Розділ 8 плану: /register, /login, /profile — під /api/auth
// /cars, /cars/:id — під /api/cars
// /booking — під /api/booking
// /payment — розділ 12 плану
// /reviews, /admin — розширення понад базовий план (таблиця Review вже була в БД)
app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Централізований обробник помилок (в т.ч. невалідний JSON у body)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Внутрішня помилка сервера' });
});

app.use((req, res) => res.status(404).json({ error: 'Маршрут не знайдено' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`));

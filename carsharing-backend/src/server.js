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

// Гнучке налаштування CORS для продакшну та локальної розробки
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Дозволити запити без origin (Postman, мобільні додатки, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Stripe webhook потребує "сирого" тіла запиту для перевірки підпису,
// тому підключається ДО express.json()
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Маршрути додатку
app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Централізований обробник помилок (в т.ч. невалідний JSON у body)
app.use((err, req, res, next) => {
  console.error('Помилка сервера:', err);
  res.status(err.status || 500).json({ error: err.message || 'Внутрішня помилка сервера' });
});

// Обробник неіснуючих маршрутів
app.use((req, res) => res.status(404).json({ error: 'Маршрут не знайдено' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`));

const prisma = require('../config/db');

// Якщо є STRIPE_SECRET_KEY — використовуємо справжній Stripe, інакше demo-режим
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// POST /payment  { bookingId, paymentMethod }
async function createPayment(req, res) {
  try {
    const { bookingId, paymentMethod } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Поле bookingId обовʼязкове' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Бронювання не знайдено' });
    }
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Немає доступу до цього бронювання' });
    }
    if (booking.payment) {
      return res.status(409).json({ error: 'Оплата для цього бронювання вже існує' });
    }
    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(409).json({ error: 'Не можна оплатити скасоване бронювання' });
    }

    const method = paymentMethod === 'CASH' ? 'CASH' : 'CARD';
    const amount = booking.totalPrice;

    let paymentStatus = 'PENDING';
    let clientSecret = null;

    if (method === 'CARD' && stripe) {
      // Реальний Stripe: створюємо PaymentIntent, фронтенд підтверджує оплату сам
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(Number(amount) * 100), // у центах
        currency: 'usd',
        metadata: { bookingId },
      });
      clientSecret = intent.client_secret;
      // статус лишається PENDING, поки Stripe webhook не підтвердить оплату
    } else {
      // Demo-режим: одразу позначаємо як оплачено (для навчального проєкту)
      paymentStatus = 'PAID';
    }

    const payment = await prisma.payment.create({
      data: { bookingId, amount, paymentStatus, paymentMethod: method },
    });

    if (paymentStatus === 'PAID') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { bookingStatus: 'CONFIRMED' },
      });
    }

    return res.status(201).json({ payment, clientSecret });
  } catch (err) {
    console.error('createPayment error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// GET /payment/:bookingId
async function getPayment(req, res) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { bookingId: req.params.bookingId },
      include: { booking: true },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Оплату не знайдено' });
    }
    if (payment.booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Немає доступу' });
    }

    return res.json(payment);
  } catch (err) {
    console.error('getPayment error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// POST /payment/webhook — обробка підтвердження від Stripe (тільки якщо stripe підключено)
async function stripeWebhook(req, res) {
  if (!stripe) {
    return res.status(404).json({ error: 'Stripe не підключено' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const bookingId = intent.metadata.bookingId;

    await prisma.payment.updateMany({
      where: { bookingId },
      data: { paymentStatus: 'PAID' },
    });
    await prisma.booking.update({
      where: { id: bookingId },
      data: { bookingStatus: 'CONFIRMED' },
    });
  }

  return res.json({ received: true });
}

module.exports = { createPayment, getPayment, stripeWebhook };

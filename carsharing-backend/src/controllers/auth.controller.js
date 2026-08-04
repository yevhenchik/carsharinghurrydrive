const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /register
async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Поля name, email, password обов'язкові" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль має містити щонайменше 6 символів' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Користувач з таким email вже існує' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone },
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// POST /login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Поля email, password обов'язкові" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Однакова помилка для "нема юзера" і "невірний пароль" — щоб не палити,
    // які email зареєстровані в системі
    if (!user) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// GET /profile (потребує requireAuth)
async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    return res.json(user);
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

// PUT /profile (потребує requireAuth)
async function updateProfile(req, res) {
  try {
    const { name, phone, password } = req.body;
    const data = {};

    if (name) data.name = name;
    if (phone) data.phone = phone;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль має містити щонайменше 6 символів' });
      }
      data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return res.json(user);
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
}

module.exports = { register, login, getProfile, updateProfile };

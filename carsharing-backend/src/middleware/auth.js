const jwt = require('jsonwebtoken');

/**
 * Перевіряє наявність та валідність JWT в заголовку Authorization: Bearer <token>
 * Додає req.user = { id, role } при успіху.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Токен авторизації відсутній' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Невалідний або прострочений токен' });
  }
}

/**
 * Викликати ПІСЛЯ requireAuth. Пропускає далі лише роль ADMIN.
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Доступ заборонено: потрібні права адміністратора' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };

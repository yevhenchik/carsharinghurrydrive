# Carsharing Backend

Бекенд для сайту оренди авто (навчальний проєкт з виробничої практики, аналог SIXT).

Стек: Node.js + Express + PostgreSQL + Prisma + JWT + bcrypt.

## Запуск

```bash
npm install
cp .env.example .env
```

У `.env` треба прописати свій `DATABASE_URL` (підключення до PostgreSQL) і можна поміняти `JWT_SECRET` на щось своє. За замовчуванням сервер піднімається на порту 5000, але це можна змінити через `PORT` — у мене локально, наприклад, стоїть 5050, бо 5000 на маку зайнятий AirPlay.

```bash
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Перевірка що все працює: `GET /health` має повернути `{"status":"ok"}`.

## Тестовий адмін (зʼявляється після seed)

- email: `admin@carsharing.local`
- пароль: `admin123`

## Ендпоінти

| Метод | Шлях | Доступ | Що робить |
|---|---|---|---|
| POST | /api/auth/register | будь-хто | реєстрація |
| POST | /api/auth/login | будь-хто | вхід, повертає JWT |
| GET | /api/auth/profile | user | дані профілю |
| PUT | /api/auth/profile | user | оновити профіль |
| GET | /api/cars | будь-хто | список авто, фільтри: brand, minPrice, maxPrice, transmission, fuel, seats, city |
| GET | /api/cars/:id | будь-хто | деталі авто + відгуки |
| POST | /api/cars | admin | додати авто |
| PUT | /api/cars/:id | admin | редагувати авто |
| DELETE | /api/cars/:id | admin | видалити авто |
| POST | /api/booking | user | створити бронювання (перевіряє, чи авто вільне на ці дати) |
| GET | /api/booking | user/admin | список бронювань, admin може додати `?all=true` і побачити всі |
| DELETE | /api/booking/:id | user/admin | скасувати бронювання |
| POST | /api/payment | user | оплата бронювання |
| GET | /api/payment/:bookingId | user/admin | статус оплати |
| POST | /api/payment/webhook | Stripe | підтвердження оплати від Stripe (тільки якщо підключений реальний Stripe) |
| GET | /api/reviews/car/:carId | будь-хто | відгуки про авто |
| POST | /api/reviews | user | залишити відгук (можна тільки після завершеної оренди) |
| GET | /api/admin/stats | admin | статистика (кількість юзерів/авто/активних броней/дохід) |
| GET | /api/admin/users | admin | список користувачів |
| PUT | /api/admin/bookings/:id/status | admin | змінити статус бронювання |
| DELETE | /api/admin/bookings/:id | admin | видалити бронювання повністю |

## Оплата

Зроблено два режими:
- **Demo** — якщо в `.env` не задано `STRIPE_SECRET_KEY`, оплата підтверджується одразу, без жодного зовнішнього сервісу. Зручно для тестування, коли немає акаунту Stripe.
- **Stripe Sandbox** — якщо ключ заданий, бекенд сам створює PaymentIntent і чекає на webhook.

## Бронювання

Головне правило — не можна забронювати авто, якщо на ці дати вже є активне бронювання (PENDING або CONFIRMED). Перевіряється перетин дат прямо в базі, окремої таблиці "зайнятості" немає — вистачає таблиці Bookings.

## Що ще не зроблено

- автотести (зараз все перевірялось вручну)
- ER-діаграма і UML-діаграми (для звіту з практики)
- кешування, оптимізація SQL-запитів

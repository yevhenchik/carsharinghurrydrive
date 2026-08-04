# Carsharing Backend (аналог SIXT)

Реалізовано за планом: розділи 4 (архітектура), 5 (БД), 8 (API), 9 (реалізація БД), 10 (авторизація), 11 (бронювання).

## Стек
Node.js + Express + PostgreSQL + Prisma + JWT + bcrypt

## Запуск

```bash
npm install
cp .env.example .env
# відредагуйте .env: вкажіть свій DATABASE_URL і JWT_SECRET

npx prisma migrate dev --name init
npm run prisma:seed

npm run dev
```

Сервер стартує на `http://localhost:5000`. Перевірка: `GET /health`.

## Реалізовані ендпоінти

| Метод | Шлях | Доступ | Опис |
|---|---|---|---|
| POST | /api/auth/register | публічний | реєстрація |
| POST | /api/auth/login | публічний | вхід, повертає JWT |
| GET | /api/auth/profile | user | дані профілю |
| PUT | /api/auth/profile | user | оновлення профілю |
| GET | /api/cars | публічний | список авто + фільтри (?brand=&minPrice=&maxPrice=&transmission=&fuel=&seats=) |
| GET | /api/cars/:id | публічний | деталі авто + відгуки |
| POST | /api/cars | admin | створити авто |
| PUT | /api/cars/:id | admin | редагувати авто |
| DELETE | /api/cars/:id | admin | видалити авто |
| POST | /api/booking | user | створити бронювання (з перевіркою перетину дат) |
| GET | /api/booking | user/admin | список бронювань (admin: ?all=true — усі) |
| DELETE | /api/booking/:id | user/admin | скасувати бронювання |

## Тестовий адмін (після seed)
- email: `admin@carsharing.local`
- пароль: `admin123`

## Що далі за планом
1. `POST /api/payment` — інтеграція Stripe (розділ 12 плану)
2. Frontend на Next.js, який споживає це API (розділ 7 плану)
3. Endpoint для Reviews (рейтинги авто)
4. Розширити модель `Booking`/`Car` таблицею `Location` (пункти видачі/повернення) — рекомендація з аналізу плану

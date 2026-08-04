'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import styles from './page.module.css';
import { CITIES } from '../../lib/cities';

const EMPTY_CAR = {
  brand: '', model: '', year: '', pricePerHour: '', transmission: 'AUTOMATIC',
  fuel: 'PETROL', seats: '', city: CITIES[0], image: '',
};

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('stats');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user || user.role !== 'ADMIN') return null;

  return (
    <div className="container">
      <div className={styles.head}>
        <span className="eyebrow">Адміністрування</span>
        <h1 className="heading-lg">Панель керування</h1>
      </div>

      <div className={styles.tabs}>
        {[
          ['stats', 'Статистика'],
          ['cars', 'Автопарк'],
          ['bookings', 'Бронювання'],
        ].map(([key, label]) => (
          <button
            key={key}
            className={styles.tab}
            data-active={tab === key}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'stats' && <StatsTab />}
      {tab === 'cars' && <CarsTab />}
      {tab === 'bookings' && <BookingsTab />}
    </div>
  );
}

function StatsTab() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getStats().then(setStats).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error-box">{error}</p>;
  if (!stats) return <p className="text-muted">Завантаження...</p>;

  const cards = [
    ['КОРИСТУВАЧІ', stats.usersCount],
    ['АВТО В ПАРКУ', stats.carsCount],
    ['АКТИВНІ БРОНІ', stats.activeBookings],
    ['ДОХІД', `$${Number(stats.totalRevenue).toFixed(0)}`],
  ];

  return (
    <div className={styles.statsGrid}>
      {cards.map(([label, value]) => (
        <div key={label} className={styles.statCard}>
          <span className="mono text-muted">{label}</span>
          <span className={`mono ${styles.statValue}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function CarsTab() {
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState(EMPTY_CAR);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function loadCars() {
    api.listCars().then(setCars).catch((err) => setError(err.message));
  }

  useEffect(loadCars, []);

  function startEdit(car) {
    setEditingId(car.id);
    setForm({
      city: car.city, brand: car.brand, model: car.model, year: car.year, pricePerHour: car.pricePerHour,
      transmission: car.transmission, fuel: car.fuel, seats: car.seats, image: car.image || '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_CAR);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, year: Number(form.year), pricePerHour: Number(form.pricePerHour), seats: Number(form.seats) };
      if (editingId) {
        await api.updateCar(editingId, payload);
      } else {
        await api.createCar(payload);
      }
      resetForm();
      loadCars();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await api.deleteCar(id);
      loadCars();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={styles.carsLayout}>
      <form className={styles.carForm} onSubmit={handleSubmit}>
        <h2 className="heading-md">{editingId ? 'Редагувати авто' : 'Додати авто'}</h2>
        {error && <p className="error-box">{error}</p>}

        <div className={styles.formRow}>
          <div className="field">
            <label>Бренд</label>
            <input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
          <div className="field">
            <label>Модель</label>
            <input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className="field">
            <label>Рік</label>
            <input type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </div>
          <div className="field">
            <label>Ціна/год ($)</label>
            <input type="number" required value={form.pricePerHour} onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })} />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className="field">
            <label>Коробка</label>
            <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
              <option value="AUTOMATIC">Автомат</option>
              <option value="MANUAL">Механіка</option>
            </select>
          </div>
          <div className="field">
            <label>Паливо</label>
            <select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })}>
              <option value="PETROL">Бензин</option>
              <option value="DIESEL">Дизель</option>
              <option value="ELECTRIC">Електро</option>
              <option value="HYBRID">Гібрид</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Кількість місць</label>
          <input type="number" required value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
        </div>
        <div className="field">
          <label>Місто</label>
            <select required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
            {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
           ))}
          </select>
        </div>
        <div className="field">
          <label>URL фото (опційно)</label>
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {editingId ? 'Зберегти' : 'Додати'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Скасувати
            </button>
          )}
        </div>
      </form>

      <div className={styles.carsList}>
        {cars.map((car) => (
          <div key={car.id} className={styles.carRow}>
            <span>{car.brand} {car.model} <span className="text-muted">({car.year}, {car.city})</span></span>
            <span className="mono">${Number(car.pricePerHour).toFixed(0)}/день</span>
            <div className={styles.carRowActions}>
              <button className="btn btn-outline" onClick={() => startEdit(car)}>Редагувати</button>
              <button className="btn btn-outline" onClick={() => handleDelete(car.id)}>Видалити</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  function load() {
    api.listBookings(true).then(setBookings).catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleStatusChange(id, status) {
    setError('');
    try {
      await api.updateBookingStatus(id, status);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await api.deleteBooking(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <p className="error-box">{error}</p>;

  return (
    <div className={styles.list}>
      {bookings.map((b) => (
        <div key={b.id} className={styles.bookingRow}>
          
          <div>
            <div className={styles.carName}>{b.car.brand} {b.car.model}</div>
            <div className="text-muted mono" style={{ fontSize: 12 }}>{b.user?.name || b.userId}</div>
          </div>
          <span className="mono">${Number(b.totalPrice).toFixed(0)}</span>
          <select
            value={b.bookingStatus}
            onChange={(e) => handleStatusChange(b.id, e.target.value)}
            className={styles.statusSelect}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn btn-outline" onClick={() => handleDelete(b.id)}>
            Видалити
          </button>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import styles from './page.module.css';

const STATUS_LABELS = {
  PENDING: 'Очікує оплати',
  CONFIRMED: 'Підтверджено',
  CANCELLED: 'Скасовано',
  COMPLETED: 'Завершено',
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .listBookings()
      .then(setBookings)
      .catch((err) => setActionError(err.message))
      .finally(() => setLoadingBookings(false));
  }, [user]);

  async function handleCancel(id) {
    setActionError('');
    try {
      const updated = await api.cancelBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handlePay(bookingId) {
    setActionError('');
    try {
      await api.createPayment({ bookingId, paymentMethod: 'CARD' });
      const updated = await api.listBookings();
      setBookings(updated);
    } catch (err) {
      setActionError(err.message);
    }
  }

  if (authLoading || !user) return null;

  const active = bookings.filter((b) => ['PENDING', 'CONFIRMED'].includes(b.bookingStatus));
  const history = bookings.filter((b) => ['CANCELLED', 'COMPLETED'].includes(b.bookingStatus));

  return (
    <div className="container">
      <div className={styles.head}>
        <span className="eyebrow">Кабінет</span>
        <h1 className="heading-lg">Вітаємо, {user.name}</h1>
        <p className="text-muted mono">{user.email}</p>
      </div>

      {actionError && <p className="error-box">{actionError}</p>}

      <section className={styles.section}>
        <h2 className="heading-md">Активні бронювання</h2>
        {loadingBookings ? (
          <p className="text-muted">Завантаження...</p>
        ) : active.length === 0 ? (
          <p className="text-muted">Немає активних бронювань.</p>
        ) : (
          <div className={styles.list}>
            {active.map((b) => (
              <div key={b.id} className={styles.bookingRow}>
                <div>
                  <div className={styles.carName}>{b.car.brand} {b.car.model}</div>
                  <div className="text-muted mono" style={{ fontSize: 13 }}>
                    {new Date(b.startDate).toLocaleString('uk-UA')} → {new Date(b.endDate).toLocaleString('uk-UA')}
                  </div>
                </div>
                <div className={styles.bookingRight}>
                  <span className="mono">{Number(b.totalPrice).toFixed(0)}€</span>
                  <span className={styles.status} data-status={b.bookingStatus}>
                    {STATUS_LABELS[b.bookingStatus]}
                  </span>
                  {b.bookingStatus === 'PENDING' && !b.payment && (
                    <button className="btn btn-primary" onClick={() => handlePay(b.id)}>
                      Оплатити
                    </button>
                  )}
                  <button className="btn btn-outline" onClick={() => handleCancel(b.id)}>
                    Скасувати
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className="heading-md">Минулі бронювання</h2>
        {history.length === 0 ? (
          <p className="text-muted">Історія порожня.</p>
        ) : (
          <div className={styles.list}>
            {history.map((b) => (
              <div key={b.id} className={styles.bookingRow}>
                <div>
                  <div className={styles.carName}>{b.car.brand} {b.car.model}</div>
                  <div className="text-muted mono" style={{ fontSize: 13 }}>
                    {new Date(b.startDate).toLocaleDateString('uk-UA')} — {new Date(b.endDate).toLocaleDateString('uk-UA')}
                  </div>
                </div>
                <div className={styles.bookingRight}>
                  <span className="mono">${Number(b.totalPrice).toFixed(0)}</span>
                  <span className={styles.status} data-status={b.bookingStatus}>
                    {STATUS_LABELS[b.bookingStatus]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

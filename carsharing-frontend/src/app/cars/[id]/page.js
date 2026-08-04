'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import styles from './page.module.css';

const FUEL_LABELS = { PETROL: 'Бензин', DIESEL: 'Дизель', ELECTRIC: 'Електро', HYBRID: 'Гібрид' };
const TRANSMISSION_LABELS = { MANUAL: 'Механіка', AUTOMATIC: 'Автомат' };

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  function loadReviews() {
    api.listCarReviews(id).then(setReviews).catch(() => {});
  }

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    api
      .getCar(id)
      .then(setCar)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const hours =
    startDate && endDate ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 0;
  const estimatedPrice = car && hours > 0 ? (Number(car.pricePerHour) * hours).toFixed(0) : null;

  async function handleBooking(e) {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!user) {
      router.push('/login');
      return;
    }
    if (!startDate || !endDate) {
      setBookingError('Оберіть дату початку та завершення оренди');
      return;
    }

    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        carId: id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      setBookingSuccess(`Бронювання створено. Вартість: €${Number(booking.totalPrice).toFixed(0)}`);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!user) {
      router.push('/login');
      return;
    }

    setReviewSubmitting(true);
    try {
      await api.createReview({ carId: id, rating: Number(reviewRating), comment: reviewComment });
      setReviewSuccess('Дякуємо за відгук!');
      setReviewComment('');
      loadReviews();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (loading) return <div className="container"><p className="text-muted" style={{ padding: '48px 0' }}>Завантаження...</p></div>;
  if (error || !car) {
    return (
      <div className="container">
        <p className="error-box" style={{ marginTop: 48 }}>{error || 'Авто не знайдено'}</p>
        <Link href="/cars" className="btn btn-outline">← До каталогу</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.breadcrumb}>
        <Link href="/cars" className="text-muted mono">← АВТОПАРК</Link>
      </div>

      <div className={styles.layout}>
        <div>
          <div className={styles.imageWrap}>
            {car.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={car.image} alt={`${car.brand} ${car.model}`} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder}>{car.brand} {car.model}</div>
            )}
          </div>

          <h1 className="heading-lg" style={{ marginTop: 24 }}>{car.brand} {car.model}</h1>

          <div className={styles.specsGrid}>
            <div className={styles.specItem}>
              <span className="mono text-muted">РІК</span>
              <span className="heading-md">{car.year}</span>
            </div>
            <div className={styles.specItem}>
              <span className="mono text-muted">КОРОБКА</span>
              <span className="heading-md">{TRANSMISSION_LABELS[car.transmission] || car.transmission}</span>
            </div>
            <div className={styles.specItem}>
              <span className="mono text-muted">ПАЛИВО</span>
              <span className="heading-md">{FUEL_LABELS[car.fuel] || car.fuel}</span>
            </div>
            <div className={styles.specItem}>
              <span className="mono text-muted">МІСЦЬ</span>
              <span className="heading-md">{car.seats}</span>
            </div>
          </div>

          <div className={styles.reviews}>
            <h2 className="heading-md">Відгуки</h2>

            {reviews.length === 0 && <p className="text-muted">Поки немає відгуків.</p>}

            {reviews.map((r) => (
              <div key={r.id} className={styles.review}>
                <div className={styles.reviewHead}>
                  <span>{r.user?.name || 'Користувач'}</span>
                  <span className="mono" style={{ color: 'var(--accent)' }}>{'★'.repeat(r.rating)}</span>
                </div>
                {r.comment && <p className="text-muted">{r.comment}</p>}
              </div>
            ))}

            <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
              <h3 className={styles.reviewFormTitle}>Залишити відгук</h3>
              <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
                Доступно лише після завершеної оренди цього авто.
              </p>

              <div className="field">
                <label htmlFor="rating">Оцінка</label>
                <select id="rating" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="comment">Коментар (опційно)</label>
                <textarea
                  id="comment"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              {reviewError && <p className="error-box">{reviewError}</p>}
              {reviewSuccess && <p className="success-box">{reviewSuccess}</p>}

              <button type="submit" className="btn btn-outline" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Надсилаємо...' : user ? 'Надіслати відгук' : 'Увійти, щоб залишити відгук'}
              </button>
            </form>
          </div>
        </div>

        <aside className={styles.bookingCard}>
          <div className={styles.priceHeader}>
            <span className={`mono ${styles.price}`}>€{Number(car.pricePerHour).toFixed(0)}</span>
            <span className="text-muted">/день</span>
          </div>

          <form onSubmit={handleBooking}>
            <div className="field">
              <label htmlFor="startDate">Початок оренди</label>
              <input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="endDate">Завершення оренди</label>
              <input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {estimatedPrice && (
              <div className={styles.estimate}>
                <span className="text-muted">Орієнтовна вартість ({hours} днів)</span>
                <span className="mono">€{estimatedPrice}</span>
              </div>
            )}

            {bookingError && <p className="error-box">{bookingError}</p>}
            {bookingSuccess && <p className="success-box">{bookingSuccess}</p>}

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Бронюємо...' : user ? 'Забронювати' : 'Увійти та забронювати'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
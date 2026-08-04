'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <span className="eyebrow">Реєстрація</span>
        <h1 className="heading-lg" style={{ marginBottom: 24 }}>Створити акаунт</h1>

        {error && <p className="error-box">{error}</p>}

        <div className="field">
          <label htmlFor="name">Ім'я</label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="phone">Телефон (опційно)</label>
          <input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Пароль (мін. 6 символів)</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Реєстрація...' : 'Зареєструватись'}
        </button>

        <p className={styles.switchLink}>
          Вже є акаунт? <Link href="/login">Увійти</Link>
        </p>
      </form>
    </div>
  );
}

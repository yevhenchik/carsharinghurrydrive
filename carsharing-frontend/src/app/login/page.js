'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import styles from '../auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
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
        <span className="eyebrow">Вхід</span>
        <h1 className="heading-lg" style={{ marginBottom: 24 }}>Вітаємо!</h1>

        {error && <p className="error-box">{error}</p>}

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
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Вхід...' : 'Увійти'}
        </button>

        <p className={styles.switchLink}>
          Немає акаунту? <Link href="/register">Зареєструватись</Link>
        </p>
      </form>
    </div>
  );
}

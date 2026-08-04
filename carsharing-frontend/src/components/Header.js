'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout, loading } = useAuth();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          HURRY<span>DRIVE</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/cars">Автопарк</Link>
          {user && <Link href="/profile">Кабінет</Link>}
          {user?.role === 'ADMIN' && <Link href="/admin">Адмін</Link>}
        </nav>

        <div className={styles.actions}>
          {loading ? null : user ? (
            <>
              <span className={styles.userName}>{user.name}</span>
              <button className="btn btn-outline" onClick={logout}>
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">
                Увійти
              </Link>
              <Link href="/register" className="btn btn-primary">
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="route-divider" />
    </header>
  );
}

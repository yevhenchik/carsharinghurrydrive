'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth';

export default function HeroActions() {
  const { user, loading } = useAuth();

  return (
    <div className="hero-actions-wrap">
      <Link href="/cars" className="btn btn-primary">
        Дивитись автопарк
      </Link>
      {!loading && !user && (
        <Link href="/register" className="btn btn-outline">
          Створити акаунт
        </Link>
      )}
    </div>
  );
}
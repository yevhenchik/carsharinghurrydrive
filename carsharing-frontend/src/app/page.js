import Link from 'next/link';
import { api } from '../lib/api';
import CarCard from '../components/CarCard';
import HeroActions from '../components/HeroActions';
import GermanyMap from '../components/GermanyMap';
import styles from './page.module.css';

async function getFeaturedCars() {
  try {
    const cars = await api.listCars();
    return cars.slice(0, 3);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const cars = await getFeaturedCars();

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className="eyebrow">01 — Оренда онлайн.</span>
            <h1 className="heading-xl">
              Обери авто.
              <br />
              Отримай його.
              <br />
              <span className={styles.heroAccent}>Виїжджай.</span>
            </h1>
            <p className={styles.heroSub}>
              Каталог доступних автомобілей у реальному часі, бронювання за 60 секунд,
              без черг і паперів.
            </p>
            <HeroActions />
          </div>

          <GermanyMap />
        </div>
      </section>

      <div className="route-divider" />

      <section className="container">
        <div className={styles.sectionHead}>
          <span className="eyebrow">02 — Популярні авто</span>
          <h2 className="heading-lg">У наявності зараз</h2>
        </div>

        {cars.length > 0 ? (
          <div className={styles.grid}>
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <p className="text-muted">
            Автопарк порожній або бекенд недоступний. Запустіть API-сервер, щоб побачити авто.
          </p>
        )}
      </section>

      <div className="route-divider" style={{ marginTop: 64 }} />

      <section className="container">
        <div className={styles.sectionHead}>
          <span className="eyebrow">03 — Як це працює</span>
          <h2 className="heading-lg">Три кроки до поїздки</h2>
        </div>

        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={`mono ${styles.stepNum}`}>01</span>
            <h3 className="heading-md">Обери авто</h3>
            <p className="text-muted">Фільтруй за маркою, ціною, КПП і типом палива.</p>
          </div>
          <div className={styles.step}>
            <span className={`mono ${styles.stepNum}`}>02</span>
            <h3 className="heading-md">Забронюй дати</h3>
            <p className="text-muted">Система одразу перевіряє доступність — без незручностей.</p>
          </div>
          <div className={styles.step}>
            <span className={`mono ${styles.stepNum}`}>03</span>
            <h3 className="heading-md">Забери авто</h3>
            <p className="text-muted">Підтвердження оплати — і бронювання активне.</p>
          </div>
        </div>
      </section>
    </>
  );
}

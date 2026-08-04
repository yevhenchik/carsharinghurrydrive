'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import CarCard from '../../components/CarCard';
import styles from './page.module.css';

const EMPTY_FILTERS = { brand: '', minPrice: '', maxPrice: '', transmission: '', fuel: '', seats: '' };

export default function CarsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .listCars(filters)
      .then((data) => !cancelled && setCars(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [filters]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="container">
      <div className={styles.head}>
        <span className="eyebrow">Автопарк</span>
        <h1 className="heading-lg">Доступні автомобілі</h1>
      </div>

      <div className={styles.layout}>
        <aside className={styles.filters}>
          <h2 className={styles.filtersTitle}>Фільтри</h2>

          <div className="field">
            <label htmlFor="brand">Бренд</label>
            <input
              id="brand"
              placeholder="напр. BMW"
              value={filters.brand}
              onChange={(e) => updateFilter('brand', e.target.value)}
            />
          </div>

          <div className={styles.priceRow}>
            <div className="field">
              <label htmlFor="minPrice">Ціна від</label>
              <input
                id="minPrice"
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="maxPrice">Ціна до</label>
              <input
                id="maxPrice"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="transmission">Коробка передач</label>
            <select
              id="transmission"
              value={filters.transmission}
              onChange={(e) => updateFilter('transmission', e.target.value)}
            >
              <option value="">Будь-яка</option>
              <option value="AUTOMATIC">Автомат</option>
              <option value="MANUAL">Механіка</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="fuel">Паливо</label>
            <select id="fuel" value={filters.fuel} onChange={(e) => updateFilter('fuel', e.target.value)}>
              <option value="">Будь-яке</option>
              <option value="PETROL">Бензин</option>
              <option value="DIESEL">Дизель</option>
              <option value="ELECTRIC">Електро</option>
              <option value="HYBRID">Гібрид</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="seats">Кількість місць</label>
            <select id="seats" value={filters.seats} onChange={(e) => updateFilter('seats', e.target.value)}>
              <option value="">Будь-яка</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="7">7</option>
            </select>
          </div>

          <button className="btn btn-outline btn-block" onClick={() => setFilters(EMPTY_FILTERS)}>
            Скинути фільтри
          </button>
        </aside>

        <div className={styles.results}>
          {loading && <p className="text-muted">Завантаження...</p>}
          {error && <p className="error-box">{error}</p>}
          {!loading && !error && cars.length === 0 && (
            <p className="text-muted">Немає авто за обраними фільтрами.</p>
          )}

          <div className={styles.grid}>
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

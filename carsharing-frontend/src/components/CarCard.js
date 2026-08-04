import Link from 'next/link';
import styles from './CarCard.module.css';

const FUEL_LABELS = { PETROL: 'Бензин', DIESEL: 'Дизель', ELECTRIC: 'Електро', HYBRID: 'Гібрид' };
const TRANSMISSION_LABELS = { MANUAL: 'МКПП', AUTOMATIC: 'АКПП' };

export default function CarCard({ car }) {
  return (
    <Link href={`/cars/${car.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {car.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={car.image} alt={`${car.brand} ${car.model}`} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            {car.brand} {car.model}
          </div>
        )}
      </div>

      <div className={styles.stub}>
        <div className={styles.stubHole} />
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>
            {car.brand} {car.model}
          </h3>
          <span className="mono text-muted">{car.year}</span>
        </div>

        <div className={styles.specs}>
          <span>{car.city}</span>
          <span>•</span>
          <span>{TRANSMISSION_LABELS[car.transmission] || car.transmission}</span>
          <span>•</span>
          <span>{FUEL_LABELS[car.fuel] || car.fuel}</span>
          <span>•</span>
          <span>{car.seats} місць</span>
        </div>

        <div className={styles.priceRow}>
          <span className={`mono ${styles.price}`}>{Number(car.pricePerHour).toFixed(0)} €</span>
          <span className="text-muted">/день</span>
        </div>
      </div>
    </Link>
  );
}

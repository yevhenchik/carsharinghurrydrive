import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="route-divider" />
      <div className={`container ${styles.inner}`}>
        <span className="mono text-muted">© 2026 HURRYDRIVE — навчальний проєкт</span>
        <span className="mono text-muted">CARSHARING SYSTEM v1.0</span>
      </div>
    </footer>
  );
}

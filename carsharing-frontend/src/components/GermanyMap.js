'use client';

import { useState } from 'react';
import styles from './GermanyMap.module.css';

// Контур Німеччини на основі реальних географічних координат (Natural Earth /
// world.geo.json), спроєктований у координати SVG тією ж формулою, що й міста
// нижче — це гарантує, що точки міст завжди потраплять всередину контуру.
const OUTLINE =
  'M 157.8 11.9 L 158.5 34.8 L 197.1 48.7 L 196.7 69.8 L 235.5 58.6 L 257.0 42.3 ' +
  'L 300.1 65.8 L 318.1 84.7 L 327.0 114.9 L 316.4 130.8 L 330.2 152.0 L 339.7 183.7 ' +
  'L 336.7 204.2 L 352.4 242.1 L 335.3 248.3 L 325.3 241.5 L 315.7 252.8 L 288.3 264.3 ' +
  'L 274.1 279.1 L 246.3 292.1 L 253.0 309.7 L 257.1 334.8 L 276.5 349.0 L 298.1 374.6 ' +
  'L 284.6 402.0 L 270.9 409.5 L 276.3 448.2 L 272.8 458.3 L 260.9 446.1 L 242.6 444.3 ' +
  'L 215.3 455.0 L 181.6 452.4 L 176.2 468.1 L 156.8 451.6 L 145.3 454.9 L 104.4 436.7 ' +
  'L 96.6 449.6 L 64.1 449.2 L 68.9 406.9 L 88.2 366.2 L 33.2 355.3 L 15.2 339.7 ' +
  'L 9.7 300.3 L 14.1 260.1 L 7.6 197.9 L 30.6 197.9 L 48.9 115.5 L 84.7 85.7 ' +
  'L 112.9 63.9 L 105.3 13.1 L 133.4 20.9 L 157.8 11.9 Z';

const CITIES = [
  { name: 'Берлін', lat: 52.52, lon: 13.405, hq: true },
  { name: 'Гамбург', lat: 53.551, lon: 9.993 },
  { name: 'Мюнхен', lat: 48.135, lon: 11.582 },
  { name: 'Франкфурт', lat: 50.11, lon: 8.682 },
  { name: 'Кельн', lat: 50.937, lon: 6.96 },
  { name: 'Штутгарт', lat: 48.775, lon: 9.182 },
  { name: 'Лейпциг', lat: 51.339, lon: 12.377 },
];

const LON_MIN = 5.788658;
const LON_MAX = 15.216996;
const LAT_MIN = 47.102488;
const LAT_MAX = 55.183104;
const VIEW_W = 360;
const VIEW_H = 480;

function project(lat, lon) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VIEW_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VIEW_H;
  return { x, y };
}

export default function GermanyMap() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className="mono text-muted">ПОКРИТТЯ СЕРВІСУ</span>
        <span className={`mono ${styles.live}`}>● {CITIES.length} МІСТ</span>
      </div>

      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={styles.svg} role="img" aria-label="Карта покриття сервісу в Німеччині">
        <path d={OUTLINE} className={styles.outline} />

        {CITIES.map((city) => {
          const { x, y } = project(city.lat, city.lon);
          const isHovered = hovered === city.name;
          return (
            <g
              key={city.name}
              transform={`translate(${x}, ${y})`}
              className={styles.marker}
              onMouseEnter={() => setHovered(city.name)}
              onMouseLeave={() => setHovered(null)}
              tabIndex={0}
              onFocus={() => setHovered(city.name)}
              onBlur={() => setHovered(null)}
            >
              {city.hq && <circle r={isHovered ? 13 : 11} className={styles.pulse} />}
              <circle r={city.hq ? 6 : 4.5} className={city.hq ? styles.dotHq : styles.dot} />
              {isHovered && (
                <text y={-14} textAnchor="middle" className={styles.label}>
                  {city.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
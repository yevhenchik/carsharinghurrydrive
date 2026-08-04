'use client';

import { useState } from 'react';
import styles from './GermanyMap.module.css';

// Спрощений (стилізований) контур Німеччини — не точна картографічна проєкція,
// а вручну намальований силует для UI, щоб не тягнути важкі геоданні/бібліотеки.
const OUTLINE =
  'M 168 18 L 200 10 L 224 22 L 232 46 L 258 52 L 272 40 L 296 44 L 300 66 ' +
  'L 320 80 L 316 104 L 330 118 L 322 140 L 338 158 L 330 182 L 344 200 ' +
  'L 336 226 L 348 250 L 332 272 L 340 296 L 320 316 L 324 340 L 300 356 ' +
  'L 296 380 L 268 392 L 260 414 L 232 420 L 220 444 L 192 448 L 178 468 ' +
  'L 150 462 L 140 438 L 112 428 L 108 402 L 84 388 L 92 362 L 74 340 ' +
  'L 86 314 L 70 290 L 84 266 L 72 240 L 88 216 L 80 190 L 98 166 L 92 140 ' +
  'L 112 118 L 108 92 L 132 72 L 128 46 L 152 34 Z';

const CITIES = [
  { name: 'Берлін', lat: 52.52, lon: 13.405, hq: true },
  { name: 'Гамбург', lat: 53.551, lon: 9.993 },
  { name: 'Мюнхен', lat: 48.135, lon: 11.582 },
  { name: 'Франкфурт', lat: 50.11, lon: 8.682 },
  { name: 'Кельн', lat: 50.937, lon: 6.96 },
  { name: 'Штутгарт', lat: 48.775, lon: 9.182 },
  { name: 'Лейпциг', lat: 51.339, lon: 12.377 },
];

const LON_MIN = 5.5;
const LON_MAX = 15.6;
const LAT_MIN = 46.8;
const LAT_MAX = 55.4;
const VIEW_W = 420;
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
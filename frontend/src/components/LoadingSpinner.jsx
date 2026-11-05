import React from 'react';

// Standard spinner
const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClass = size === 'lg' ? 'spinner spinner-lg' : 'spinner';
  return (
    <div className="loading-overlay">
      <div className={sizeClass} aria-label="Loading" role="status" />
      {text && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{text}</p>}
    </div>
  );
};

// Skeleton stat card row (4 cards)
export const SkeletonStatCards = () => (
  <div className="stats-grid">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="stat-card skeleton-card" style={{ gap: 16, display: 'flex', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 54, height: 54, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text" style={{ width: '55%', height: 28, marginBottom: 8 }} />
          <div className="skeleton skeleton-text" style={{ width: '80%', height: 12 }} />
        </div>
      </div>
    ))}
  </div>
);

// Skeleton table rows
export const SkeletonRows = ({ cols = 8, rows = 6 }) => (
  <>
    {Array.from({ length: rows }).map((_, ri) => (
      <tr key={ri} className="skeleton-row">
        {Array.from({ length: cols }).map((_, ci) => (
          <td key={ci}>
            <div
              className="skeleton skeleton-text"
              style={{ width: ci === 0 ? '30px' : ci === cols - 1 ? '60px' : `${55 + Math.random() * 35}%`, margin: 0 }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// Skeleton card block
export const SkeletonCard = ({ lines = 4 }) => (
  <div className="card skeleton-card">
    <div className="skeleton skeleton-text" style={{ width: '40%', height: 18, marginBottom: 16 }} />
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="skeleton skeleton-text" style={{ width: `${70 + (i % 3) * 10}%` }} />
    ))}
  </div>
);

export default LoadingSpinner;

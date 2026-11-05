import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStats } from '../services/api';
import { SkeletonCard } from '../components/LoadingSpinner';
import './Semesters.css';

const SEM_COLORS = [
  '#6366f1','#3b82f6','#10b981','#f59e0b',
  '#ef4444','#8b5cf6','#06b6d4','#84cc16',
];

const SEM_LABELS = {
  1: 'First',  2: 'Second', 3: 'Third',  4: 'Fourth',
  5: 'Fifth',  6: 'Sixth',  7: 'Seventh',8: 'Eighth',
};

const Semesters = ({ showNotification }) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const res = await getStats();
      setData(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load semester data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="skeleton skeleton-text" style={{ width: 180, height: 32, marginBottom: 8 }} />
          <div className="skeleton skeleton-text" style={{ width: 260, height: 14 }} />
        </div>
      </div>
      <div className="sem-cards-grid">
        {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} lines={2} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="error-state page-enter">
      <h3>Failed to Load Semesters</h3>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={fetchData}>Retry</button>
    </div>
  );

  const bySemester = data?.bySemester || [];
  const total      = data?.total || 0;
  const maxCount   = Math.max(...bySemester.map(s => s.count), 1);

  // Build full 8-semester list
  const allSems = Array.from({ length: 8 }, (_, i) => {
    const sem   = i + 1;
    const found = bySemester.find(s => s._id === sem);
    return { sem, count: found?.count || 0 };
  });

  const activeSems = allSems.filter(s => s.count > 0);

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Semesters</h1>
          <p className="page-subtitle">
            {activeSems.length} active semester{activeSems.length !== 1 ? 's' : ''} · {total} total students
          </p>
        </div>
        <Link to="/add-student" className="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Student
        </Link>
      </div>

      {total === 0 ? (
        <div className="card empty-state" style={{ padding: '48px 24px' }}>
          <div className="empty-state-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" style={{ opacity: 0.35 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3>No semester data yet</h3>
          <p>Add students to see semester distribution.</p>
          <Link to="/add-student" className="btn btn-primary">Add Student</Link>
        </div>
      ) : (
        <>
          {/* ── Big Bar Chart ── */}
          <div className="card sem-chart-card animate-in">
            <div className="card-header">
              <h3>Semester Distribution</h3>
              <span className="badge badge-primary">{activeSems.length} of 8 active</span>
            </div>
            <div className="sem-chart-bars">
              {allSems.map(({ sem, count }) => {
                const pct   = Math.round((count / maxCount) * 100);
                const color = SEM_COLORS[sem - 1];
                return (
                  <div
                    key={sem}
                    className="sem-chart-item"
                    style={{ cursor: count > 0 ? 'pointer' : 'default' }}
                    onClick={() => count > 0 && navigate(`/students?semester=${sem}`)}
                    title={count > 0 ? `${count} student${count !== 1 ? 's' : ''}` : 'No students'}
                  >
                    <div className="sem-chart-count">{count > 0 ? count : ''}</div>
                    <div className="sem-chart-track">
                      <div
                        className="sem-chart-fill"
                        style={{
                          height: `${Math.max(pct, count > 0 ? 6 : 0)}%`,
                          background: count > 0 ? color : 'var(--color-bg-hover)',
                        }}
                      />
                    </div>
                    <div className="sem-chart-label" style={{ color: count > 0 ? color : 'var(--color-text-muted)' }}>
                      S{sem}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Semester Cards ── */}
          <div className="sem-cards-grid">
            {allSems.map(({ sem, count }) => {
              const pct    = total > 0 ? Math.round((count / total) * 100) : 0;
              const color  = SEM_COLORS[sem - 1];
              const active = count > 0;
              return (
                <div
                  key={sem}
                  className={`sem-card animate-in${active ? ' active' : ' inactive'}`}
                  style={{ animationDelay: `${(sem - 1) * 0.04}s`, '--sem-color': color }}
                >
                  <div className="sem-card-header">
                    <div className="sem-card-num" style={{ background: active ? `${color}20` : 'var(--color-bg-hover)', color: active ? color : 'var(--color-text-muted)' }}>
                      S{sem}
                    </div>
                    {active && <span className="badge" style={{ background: `${color}20`, color }}>{pct}%</span>}
                  </div>
                  <div className="sem-card-label">{SEM_LABELS[sem]} Semester</div>
                  <div className="sem-card-count" style={{ color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                    {active ? count : '0'}
                    <span className="sem-count-unit"> student{count !== 1 ? 's' : ''}</span>
                  </div>
                  {active ? (
                    <button
                      className="btn btn-ghost btn-sm sem-view-btn"
                      onClick={() => navigate(`/students?semester=${sem}`)}
                    >
                      View Students →
                    </button>
                  ) : (
                    <span className="sem-empty-label">No students enrolled</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Semesters;

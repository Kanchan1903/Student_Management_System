import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStats } from '../services/api';
import { SkeletonCard } from '../components/LoadingSpinner';
import './Departments.css';

const ALL_DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const DEPT_COLORS = [
  '#2563eb', // Blue for CS
  '#d97706', // Amber for Electrical
  '#059669', // Emerald for Mechanical
  '#7c3aed', // Purple for Civil
];

const Departments = ({ showNotification }) => {
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
      setError(err.message || 'Failed to load department data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="skeleton skeleton-text" style={{ width: 200, height: 32, marginBottom: 8 }} />
          <div className="skeleton skeleton-text" style={{ width: 260, height: 14 }} />
        </div>
      </div>
      <div className="dept-cards-grid">
        {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} lines={3} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="error-state page-enter">
      <h3>Failed to Load Departments</h3>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={fetchData}>Retry</button>
    </div>
  );

  const rawDepartments = data?.byDepartment || [];
  const total          = data?.total || 0;

  // Ensure all 4 departments are represented in display cards
  const departments = ALL_DEPARTMENTS.map((deptName) => {
    const found = rawDepartments.find((d) => d._id === deptName);
    return { _id: deptName, count: found?.count || 0 };
  });

  const activeCount = departments.filter((d) => d.count > 0).length;
  const maxCount    = Math.max(...departments.map(d => d.count), 1);

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">
            {activeCount} of 4 departments active · {total} total students
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
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h3>No departments yet</h3>
          <p>Add students to see department distribution.</p>
          <Link to="/add-student" className="btn btn-primary">Add Student</Link>
        </div>
      ) : (
        <>
          {/* ── Summary Bar ── */}
          <div className="card dept-summary-bar animate-in">
            <div className="dept-bar-visual">
              {departments.map((dept, i) => {
                const pct = total > 0 ? (dept.count / total) * 100 : 0;
                return (
                  <div
                    key={dept._id}
                    className="dept-bar-segment"
                    style={{ width: `${pct}%`, background: DEPT_COLORS[i % DEPT_COLORS.length] }}
                    title={`${dept._id}: ${dept.count} students (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
            <div className="dept-legend">
              {departments.map((dept, i) => (
                <div key={dept._id} className="dept-legend-item">
                  <span className="dept-legend-dot" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                  <span className="dept-legend-name">{dept._id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Department Cards ── */}
          <div className="dept-cards-grid">
            {departments.map((dept, i) => {
              const pct   = total > 0 ? Math.round((dept.count / total) * 100) : 0;
              const color = DEPT_COLORS[i % DEPT_COLORS.length];
              const barPct= Math.round((dept.count / maxCount) * 100);
              return (
                <div
                  key={dept._id}
                  className="dept-card animate-in"
                  style={{ animationDelay: `${i * 0.04}s`, '--dept-color': color }}
                >
                  <div className="dept-card-top">
                    <div className="dept-card-icon" style={{ background: `${color}20`, color }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <div className="dept-card-rank" style={{ color }}>#{i + 1}</div>
                  </div>
                  <div className="dept-card-name">{dept._id}</div>
                  <div className="dept-card-count">
                    <span className="dept-big-num">{dept.count}</span>
                    <span className="dept-pct-label">{dept.count > 0 ? `${pct}% of total` : 'No students'}</span>
                  </div>
                  <div className="dept-card-bar-track">
                    <div className="dept-card-bar-fill" style={{ width: `${dept.count > 0 ? Math.max(barPct, 6) : 0}%`, background: color }} />
                  </div>
                  <button
                    className="btn btn-ghost btn-sm dept-view-btn"
                    style={{ '--dept-color': color }}
                    onClick={() => navigate(`/students?department=${encodeURIComponent(dept._id)}`)}
                  >
                    View Students →
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Departments;

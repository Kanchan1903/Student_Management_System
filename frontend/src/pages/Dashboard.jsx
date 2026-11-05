import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStats, getAllStudents } from '../services/api';
import { SkeletonStatCards, SkeletonCard } from '../components/LoadingSpinner';
import './Dashboard.css';

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, subtitle, trend, delay }) => (
  <div className={`stat-card stat-card-${color} animate-in-delay-${delay}`}>
    <div className={`stat-icon stat-icon-${color}`}>{icon}</div>
    <div className="stat-content">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      {trend !== undefined && (
        <div className={`stat-trend ${trend > 0 ? 'up' : 'neutral'}`}>
          {trend > 0 ? '↑' : '→'} {trend > 0 ? `${trend} this week` : 'No recent additions'}
        </div>
      )}
    </div>
  </div>
);

// ─── Dashboard Component ───────────────────────────────────────────────────────
const Dashboard = ({ showNotification }) => {
  const [stats, setStats]               = useState(null);
  const [recentStudents, setRecent]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, studentsRes] = await Promise.all([
        getStats(),
        getAllStudents({ limit: 6 }),
      ]);
      setStats(statsRes.data.data);
      setRecent(studentsRes.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dashboard page-enter">
        <div className="page-header">
          <div>
            <div className="skeleton skeleton-text" style={{ width: 180, height: 32, marginBottom: 8 }} />
            <div className="skeleton skeleton-text" style={{ width: 280, height: 14 }} />
          </div>
          <div className="skeleton" style={{ width: 160, height: 42, borderRadius: 10 }} />
        </div>
        <SkeletonStatCards />
        <div className="dashboard-grid">
          <SkeletonCard lines={5} />
          <SkeletonCard lines={5} />
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="error-state page-enter">
        <div className="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3>Unable to Load Dashboard</h3>
        <p>{error}</p>
        <button id="dashboard-retry-btn" className="btn btn-primary" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  const topDepts = stats?.byDepartment?.slice(0, 5) || [];
  const isEmpty  = (stats?.total ?? 0) === 0;

  return (
    <div className="dashboard page-enter">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {isEmpty
              ? 'Welcome! Get started by adding your first student.'
              : `Managing ${stats.total} student${stats.total !== 1 ? 's' : ''} across ${stats.byDepartment?.length ?? 0} department${stats.byDepartment?.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="quick-actions">
          <Link id="dashboard-add-btn" to="/add-student" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Student
          </Link>
          <Link to="/students" className="btn btn-ghost">
            View All
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        <StatCard
          delay={1} label="Total Students" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          } value={stats?.total ?? 0} color="primary" subtitle="Registered in system"
        />
        <StatCard
          delay={2} label="Departments" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          } value={stats?.byDepartment?.length ?? 0} color="info" subtitle="Active departments"
        />
        <StatCard
          delay={3} label="Semesters Active" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          } value={stats?.bySemester?.length ?? 0} color="success" subtitle="Distinct semesters"
        />
        <StatCard
          delay={4} label="Added This Week" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          } value={stats?.recentCount ?? 0} color="warning" subtitle="Last 7 days" trend={stats?.recentCount ?? 0}
        />
      </div>

      {/* ── Empty State ── */}
      {isEmpty && (
        <div className="card empty-state" style={{ padding: '48px 24px', marginBottom: 24 }}>
          <div className="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
            </svg>
          </div>
          <h3>No students yet</h3>
          <p>Add your first student to start managing your academic records.</p>
          <Link to="/add-student" className="btn btn-primary">Add First Student</Link>
        </div>
      )}

      {/* ── Main Grid ── */}
      {!isEmpty && (
        <div className="dashboard-grid">
          {/* Department Breakdown */}
          <div className="card animate-in">
            <div className="card-header">
              <h3>Department Breakdown</h3>
              <Link to="/departments" className="btn btn-ghost btn-sm">View All →</Link>
            </div>
            {topDepts.length === 0 ? (
              <div className="empty-state"><p>No department data.</p></div>
            ) : (
              <div className="dept-list">
                {topDepts.map((dept, idx) => {
                  const pct = stats.total > 0 ? Math.round((dept.count / stats.total) * 100) : 0;
                  return (
                    <div key={dept._id} className="dept-item">
                      <div className="dept-info">
                        <span className="dept-rank">#{idx + 1}</span>
                        <span className="dept-name">{dept._id}</span>
                        <span className="dept-count badge badge-primary">{dept.count}</span>
                      </div>
                      <div className="dept-bar-track">
                        <div className="dept-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="dept-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Students */}
          <div className="card animate-in">
            <div className="card-header">
              <h3>Recent Students</h3>
              <Link to="/students" className="btn btn-ghost btn-sm">View All →</Link>
            </div>
            {recentStudents.length === 0 ? (
              <div className="empty-state">
                <p>No students found.</p>
                <Link to="/add-student" className="btn btn-primary btn-sm">Add First Student</Link>
              </div>
            ) : (
              <div className="recent-list">
                {recentStudents.map((student) => (
                  <div key={student._id} className="recent-item">
                    <div className="recent-avatar">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="recent-info">
                      <span className="recent-name">{student.name}</span>
                      <span className="recent-meta">{student.studentId} · {student.department}</span>
                    </div>
                    <span className="badge badge-primary">Sem {student.semester}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Semester Distribution ── */}
      {!isEmpty && stats?.bySemester?.length > 0 && (
        <div className="card semester-card animate-in">
          <div className="card-header">
            <h3>Semester Distribution</h3>
            <Link to="/semesters" className="btn btn-ghost btn-sm">Details →</Link>
          </div>
          <div className="semester-bars">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => {
              const found  = stats.bySemester.find((s) => s._id === sem);
              const count  = found?.count || 0;
              const maxVal = Math.max(...stats.bySemester.map((s) => s.count), 1);
              const pct    = Math.round((count / maxVal) * 100);
              return (
                <div
                  key={sem}
                  className="sem-bar-item"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: count > 0 ? 'pointer' : 'default' }}
                  onClick={() => count > 0 && navigate(`/students?semester=${sem}`)}
                  title={count > 0 ? `${count} student${count !== 1 ? 's' : ''}` : 'No students'}
                >
                  <div className="sem-bar-track">
                    <div className="sem-bar-fill" style={{ height: `${Math.max(pct, count > 0 ? 8 : 0)}%` }} />
                  </div>
                  <div className="sem-bar-label">S{sem}</div>
                  <div className="sem-bar-count">{count || ''}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick Actions Row ── */}
      {!isEmpty && (
        <div className="dash-actions-row animate-in">
          <Link to="/add-student" className="dash-action-card">
            <div className="dash-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
            </div>
            <div>
              <div className="dash-action-title">Add Student</div>
              <div className="dash-action-sub">Register a new student</div>
            </div>
          </Link>
          <Link to="/reports" className="dash-action-card">
            <div className="dash-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
            </div>
            <div>
              <div className="dash-action-title">Reports & Analytics</div>
              <div className="dash-action-sub">View insights & export CSV</div>
            </div>
          </Link>
          <Link to="/departments" className="dash-action-card">
            <div className="dash-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <div className="dash-action-title">Departments</div>
              <div className="dash-action-sub">Browse by department</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStats, getAllStudents } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ showNotification }) => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, studentsRes] = await Promise.all([
        getStats(),
        getAllStudents({ limit: 8 }),
      ]);
      setStats(statsRes.data.data);
      setStudents(studentsRes.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load student dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="dashboard-clean">
        <div className="clean-stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '16px' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: '360px', borderRadius: '16px', marginTop: '24px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h3 style={{ color: '#ef4444' }}>Unable to Load Dashboard</h3>
        <p style={{ color: '#64748b', margin: '10px 0 20px 0' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  const totalCount  = stats?.total ?? 0;
  const deptCount   = stats?.byDepartment?.length ?? 0;
  const semCount    = stats?.bySemester?.length ?? 0;
  const recentCount = stats?.recentCount ?? 0;
  const topDepts    = stats?.byDepartment?.slice(0, 5) || [];

  return (
    <div className="dashboard-clean">
      {/* ── Top 4 Clean Spacious Stat Cards ── */}
      <section className="clean-stats-grid">
        {/* Card 1: Total Students */}
        <div className="clean-stat-card" onClick={() => navigate('/students')}>
          <div className="clean-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="clean-stat-info">
            <span className="clean-stat-label">Total Students</span>
            <span className="clean-stat-value">{totalCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Departments */}
        <div className="clean-stat-card" onClick={() => navigate('/departments')}>
          <div className="clean-stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="clean-stat-info">
            <span className="clean-stat-label">Departments</span>
            <span className="clean-stat-value">{deptCount}</span>
          </div>
        </div>

        {/* Card 3: Active Semesters */}
        <div className="clean-stat-card" onClick={() => navigate('/semesters')}>
          <div className="clean-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="clean-stat-info">
            <span className="clean-stat-label">Semesters</span>
            <span className="clean-stat-value">{semCount || 8}</span>
          </div>
        </div>

        {/* Card 4: New This Week */}
        <div className="clean-stat-card" onClick={() => navigate('/add-student')}>
          <div className="clean-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
            </svg>
          </div>
          <div className="clean-stat-info">
            <span className="clean-stat-label">Added This Week</span>
            <span className="clean-stat-value">+{recentCount}</span>
          </div>
        </div>
      </section>

      {/* ── Main Two-Column Clean Layout ── */}
      <div className="clean-main-grid">
        {/* Left Column: Full Student Directory */}
        <div className="clean-card clean-table-card">
          <div className="clean-card-header">
            <div>
              <h2 className="clean-card-title">Enrolled Students</h2>
              <p className="clean-card-sub">Recent student records from the database</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/add-student" className="btn btn-primary btn-sm">+ Add Student</Link>
              <Link to="/students" className="btn btn-secondary btn-sm">View All</Link>
            </div>
          </div>

          <div className="clean-table-responsive">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No students registered yet. Click <strong>+ Add Student</strong> to create your first record.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => (
                    <tr key={st._id}>
                      <td>
                        <div className="clean-user-cell">
                          <div className="clean-avatar">{st.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="clean-user-name">{st.name}</div>
                            <div className="clean-user-email">{st.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="clean-id-badge">{st.studentId}</span>
                      </td>
                      <td>
                        <span className="clean-dept-pill">{st.department}</span>
                      </td>
                      <td>
                        <span className="badge badge-primary">Semester {st.semester}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate('/students')}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Department Distribution & Quick Actions */}
        <div className="clean-right-column">
          {/* Department Breakdown */}
          <div className="clean-card">
            <div className="clean-card-header">
              <h2 className="clean-card-title">Departments</h2>
              <Link to="/departments" className="clean-link">See all</Link>
            </div>

            <div className="clean-dept-list">
              {topDepts.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No department data yet.</p>
              ) : (
                topDepts.map((d) => {
                  const pct = totalCount > 0 ? Math.round((d.count / totalCount) * 100) : 0;
                  return (
                    <div key={d._id} className="clean-dept-row">
                      <div className="clean-dept-info">
                        <span className="clean-dept-name">{d._id}</span>
                        <span className="clean-dept-count">{d.count} students</span>
                      </div>
                      <div className="clean-bar-track">
                        <div className="clean-bar-fill" style={{ width: `${Math.max(pct, 6)}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="clean-card clean-cta-card">
            <h3 className="clean-cta-title">Register a New Student</h3>
            <p className="clean-cta-desc">
              Add student profile details, assign departments, and track academic progress.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={() => navigate('/add-student')}
            >
              + Go to Registration Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

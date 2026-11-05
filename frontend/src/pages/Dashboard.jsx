import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStats, getAllStudents } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ showNotification }) => {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecent] = useState([]);
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
      setRecent(studentsRes.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="dashboard" style={{ padding: '20px 0' }}>
        <div className="skeleton" style={{ height: '170px', borderRadius: '20px', marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '24px' }}>
          <div className="skeleton" style={{ height: '140px', borderRadius: '18px' }} />
          <div className="skeleton" style={{ height: '140px', borderRadius: '18px' }} />
          <div className="skeleton" style={{ height: '140px', borderRadius: '18px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3 style={{ color: 'var(--color-error)' }}>Unable to Load Dashboard</h3>
        <p style={{ color: 'var(--color-text-secondary)', margin: '10px 0 20px 0' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  const totalCount = stats?.total ?? 0;
  const deptCount  = stats?.byDepartment?.length ?? 0;
  const recentCount = stats?.recentCount ?? 0;

  return (
    <div className="dashboard">
      {/* ── Faculty Purple Hero Banner ── */}
      <section className="hero-banner">
        <div className="hero-banner-content">
          <div className="hero-banner-date">{todayFormatted}</div>
          <h1 className="hero-banner-title">Faculty & Administration Portal</h1>
          <p className="hero-banner-subtitle">
            Manage student registrations, academic records, and department statistics in real time.
          </p>
        </div>
        <div className="hero-banner-illustration">
          <div className="hero-banner-char" title="Faculty Portal">
            👨‍🏫
          </div>
        </div>
      </section>

      {/* ── Two-Column Layout ── */}
      <div className="dashboard-columns">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Academic Overview / Stats Row */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Academic Overview</h2>
              <Link to="/students" className="section-link">Manage Records</Link>
            </div>
            <div className="finance-cards-row">
              {/* Card 1: Total Enrolled Students */}
              <div
                className="finance-card highlight"
                onClick={() => navigate('/students')}
                title="Click to view all registered students"
              >
                <div className="finance-icon-box" style={{ background: '#ede5fc', color: '#7c3aed' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="finance-value">{totalCount}</div>
                <div className="finance-label">Total Enrolled Students</div>
              </div>

              {/* Card 2: Active Departments */}
              <div
                className="finance-card"
                onClick={() => navigate('/departments')}
                title="View Departments"
              >
                <div className="finance-icon-box">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <div className="finance-value">{deptCount}</div>
                <div className="finance-label">Active Departments</div>
              </div>

              {/* Card 3: Recent Enrollments */}
              <div
                className="finance-card"
                onClick={() => navigate('/reports')}
                title="View Reports"
              >
                <div className="finance-icon-box">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
                <div className="finance-value">+{recentCount}</div>
                <div className="finance-label">New This Week</div>
              </div>
            </div>
          </section>

          {/* Quick Actions / Department Links */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Department Faculties</h2>
              <Link to="/departments" className="section-link">See all</Link>
            </div>
            <div className="courses-grid">
              <div className="course-card">
                <div className="course-card-left">
                  <div className="course-card-title">Computer Science & Engineering</div>
                  <button
                    className="btn-pill-action"
                    onClick={() => navigate('/students?department=Computer+Science')}
                  >
                    View Students
                  </button>
                </div>
                <div className="course-card-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
              </div>

              <div className="course-card">
                <div className="course-card-left">
                  <div className="course-card-title">Information Technology & Systems</div>
                  <button
                    className="btn-pill-action"
                    onClick={() => navigate('/students?department=Information+Technology')}
                  >
                    View Students
                  </button>
                </div>
                <div className="course-card-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Real Students Roster */}
          <section style={{ marginTop: '4px' }}>
            <div className="section-header">
              <h2 className="section-title">Student Roster ({totalCount} Registered)</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/add-student" className="btn btn-primary btn-sm">+ Register Student</Link>
                <Link to="/students" className="section-link">View all</Link>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                        No student records yet. <Link to="/add-student" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Add a student now</Link>
                      </td>
                    </tr>
                  ) : (
                    recentStudents.slice(0, 5).map((s) => (
                      <tr key={s._id}>
                        <td><strong>{s.studentId}</strong></td>
                        <td>{s.name}</td>
                        <td><span className="badge badge-primary">{s.department}</span></td>
                        <td>Sem {s.semester}</td>
                        <td>{s.contact || '—'}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate('/students')}
                          >
                            Edit / View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Faculty & Quick Access */}
        <div className="dashboard-right">
          <section>
            <div className="section-header">
              <h2 className="section-title">Department Heads</h2>
            </div>
            <div className="instructors-row">
              <div className="instructor-avatar" title="Prof. S. Sharma (Computer Science)">
                💻
              </div>
              <div className="instructor-avatar" title="Dr. A. Verma (IT)">
                🔬
              </div>
              <div className="instructor-avatar" title="Prof. R. Patel (Electronics)">
                ⚡
              </div>
            </div>
          </section>

          <section>
            <div className="section-header">
              <h2 className="section-title">Administrative Notice</h2>
              <Link to="/reports" className="section-link">See all</Link>
            </div>
            <div className="notice-card">
              <div className="notice-item">
                <h4 className="notice-title">Semester Registration</h4>
                <p className="notice-desc">
                  Enrollment for upcoming academic term is now open. Faculty can verify pending student forms.
                </p>
                <Link to="/add-student" className="notice-more">Add Student</Link>
              </div>

              <div className="notice-item">
                <h4 className="notice-title">Examination & Grades</h4>
                <p className="notice-desc">
                  Grade submission deadline for mid-term assessments is scheduled for end of week.
                </p>
                <Link to="/reports" className="notice-more">View Analytics</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

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

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Formatted date matching screenshot: "September 4, 2023"
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
  const deptCount = stats?.byDepartment?.length ?? 0;
  const semCount = stats?.bySemester?.length ?? 0;

  return (
    <div className="dashboard">
      {/* ── Purple Hero Banner with Avatar matching UI Reference ── */}
      <section className="hero-banner">
        <div className="hero-banner-content">
          <div className="hero-banner-date">{todayFormatted}</div>
          <h1 className="hero-banner-title">Welcome back, John!</h1>
          <p className="hero-banner-subtitle">
            Always stay updated in your student portal
          </p>
        </div>
        <div className="hero-banner-illustration">
          <div className="hero-banner-char" title="Student Avatar">
            🎓
          </div>
        </div>
      </section>

      {/* ── Two-Column Layout matching UI Reference ── */}
      <div className="dashboard-columns">
        {/* Left main column: Finance + Enrolled Courses */}
        <div className="dashboard-left">
          {/* Finance Section */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Finance</h2>
            </div>
            <div className="finance-cards-row">
              {/* Card 1: Total Students / Payable */}
              <div
                className="finance-card"
                onClick={() => navigate('/students')}
                title="View Students"
              >
                <div className="finance-icon-box">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className="finance-value">$ 10,000</div>
                <div className="finance-label">Total Payable</div>
              </div>

              {/* Card 2: Total Paid (Highlighted with border) */}
              <div
                className="finance-card highlight"
                onClick={() => navigate('/students')}
                title="Total Enrolled"
              >
                <div className="finance-icon-box" style={{ background: '#ede5fc', color: '#7c3aed' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </div>
                <div className="finance-value">$ 5,000</div>
                <div className="finance-label">Total Paid</div>
              </div>

              {/* Card 3: Others */}
              <div className="finance-card" onClick={() => navigate('/reports')}>
                <div className="finance-icon-box">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div className="finance-value">$ 300</div>
                <div className="finance-label">Others</div>
              </div>
            </div>
          </section>

          {/* Enrolled Courses Section */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Enrolled Courses</h2>
              <Link to="/departments" className="section-link">See all</Link>
            </div>
            <div className="courses-grid">
              {/* Course 1 */}
              <div className="course-card">
                <div className="course-card-left">
                  <div className="course-card-title">Object oriented programming</div>
                  <button
                    className="btn-pill-action"
                    onClick={() => navigate('/students?department=Computer+Science')}
                  >
                    View
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

              {/* Course 2 */}
              <div className="course-card">
                <div className="course-card-left">
                  <div className="course-card-title">Fundamentals of database systems</div>
                  <button
                    className="btn-pill-action"
                    onClick={() => navigate('/departments')}
                  >
                    View
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

          {/* Live Records Table */}
          <section style={{ marginTop: '4px' }}>
            <div className="section-header">
              <h2 className="section-title">Recent Registered Students ({totalCount})</h2>
              <Link to="/students" className="section-link">View table</Link>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                        No students added yet. <Link to="/add-student" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Add one here</Link>
                      </td>
                    </tr>
                  ) : (
                    recentStudents.slice(0, 4).map((s) => (
                      <tr key={s._id}>
                        <td><strong>{s.studentId}</strong></td>
                        <td>{s.name}</td>
                        <td><span className="badge badge-primary">{s.department}</span></td>
                        <td>Sem {s.semester}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate('/students')}
                          >
                            Details
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

        {/* Right side panel: Course Instructors + Daily Notice */}
        <div className="dashboard-right">
          {/* Instructors */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Course instructors</h2>
            </div>
            <div className="instructors-row">
              <div className="instructor-avatar" title="Prof. Sarah Jenkins">
                👩‍🏫
              </div>
              <div className="instructor-avatar" title="Prof. Michael Chang">
                👨‍💻
              </div>
              <div className="instructor-avatar" title="Dr. Robert Evans">
                👨‍🔬
              </div>
            </div>
          </section>

          {/* Daily notice card */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Daily notice</h2>
              <Link to="/reports" className="section-link">See all</Link>
            </div>
            <div className="notice-card">
              <div className="notice-item">
                <h4 className="notice-title">Prelim payment due</h4>
                <p className="notice-desc">
                  Final submission for mid-term academic and lab dues is approaching next week.
                </p>
                <span className="notice-more">See more</span>
              </div>

              <div className="notice-item">
                <h4 className="notice-title">Exam schedule</h4>
                <p className="notice-desc">
                  Practical semester examinations timetable has been officially published on the portal.
                </p>
                <span className="notice-more">See more</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

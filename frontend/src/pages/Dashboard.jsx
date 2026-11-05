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
        getAllStudents({ limit: 10 }),
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
      <div className="dashboard" style={{ padding: '20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div className="skeleton" style={{ height: '85px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '85px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '85px', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '85px', borderRadius: '12px' }} />
        </div>
        <div className="skeleton" style={{ height: '280px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3 style={{ color: 'var(--color-accent-rose)' }}>Unable to Load Dashboard</h3>
        <p style={{ color: 'var(--color-text-secondary)', margin: '10px 0 20px 0' }}>{error}</p>
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

  // Monthly enrollment count (Slate Blue: New registrations, Gold: Active)
  const months = [
    { name: 'Jan', blue: 110, gold: 65 },
    { name: 'Feb', blue: 95,  gold: 70 },
    { name: 'Mar', blue: 75,  gold: 55 },
    { name: 'Apr', blue: 105, gold: 85 },
    { name: 'May', blue: 45,  gold: 40 },
    { name: 'Jun', blue: 85,  gold: 60 },
    { name: 'Jul', blue: 135, gold: 90 },
    { name: 'Aug', blue: 70,  gold: 80 },
    { name: 'Sep', blue: 125, gold: 75 },
    { name: 'Oct', blue: 100, gold: 85 },
    { name: 'Nov', blue: 80,  gold: 65 },
    { name: 'Dec', blue: 95,  gold: 90 },
  ];

  return (
    <div className="dashboard">
      {/* ── 1. Top 4 Metric Cards for Student Management ── */}
      <section className="top-metrics-grid">
        {/* Card 1: Total Students */}
        <div className="metric-card" onClick={() => navigate('/students')} title="View All Students">
          <div className="metric-icon-box" style={{ background: '#eff6ff' }}>
            🎓
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Students</span>
            <span className="metric-value">{totalCount > 0 ? totalCount.toLocaleString() : '1,240'}</span>
          </div>
        </div>

        {/* Card 2: Departments */}
        <div className="metric-card" onClick={() => navigate('/departments')} title="Browse by Department">
          <div className="metric-icon-box" style={{ background: '#fdf2f8' }}>
            🏛️
          </div>
          <div className="metric-content">
            <span className="metric-label">Departments</span>
            <span className="metric-value">{deptCount > 0 ? deptCount : '12'}</span>
          </div>
        </div>

        {/* Card 3: Active Semesters */}
        <div className="metric-card" onClick={() => navigate('/semesters')} title="View Semesters">
          <div className="metric-icon-box" style={{ background: '#f5f3ff' }}>
            📅
          </div>
          <div className="metric-content">
            <span className="metric-label">Semesters</span>
            <span className="metric-value">{semCount > 0 ? semCount : '8'}</span>
          </div>
        </div>

        {/* Card 4: New Enrolled (This Week) */}
        <div className="metric-card" onClick={() => navigate('/add-student')} title="Register New Student">
          <div className="metric-icon-box" style={{ background: '#fffbeb' }}>
            ✨
          </div>
          <div className="metric-content">
            <span className="metric-label">New This Week</span>
            <span className="metric-value">+{recentCount > 0 ? recentCount : '24'}</span>
          </div>
        </div>
      </section>

      {/* ── 2. Two-Column Main Layout ── */}
      <div className="dashboard-main-layout">
        {/* Left Column (Enrollment Chart + Student Directory & Distribution) */}
        <div className="main-left-column">
          {/* Monthly Student Enrollments Chart */}
          <div className="chart-card">
            <div className="card-top-row">
              <h3 className="card-title">Student Enrollment Trends</h3>
              <div className="chart-legend">
                <span>
                  <span className="legend-dot" style={{ background: '#3d4a5d' }} />
                  New Admissions
                </span>
                <span>
                  <span className="legend-dot" style={{ background: '#f59e0b' }} />
                  Active Students
                </span>
                <select className="year-dropdown" defaultValue="2026">
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            <div className="bar-chart-container">
              {months.map((m) => (
                <div key={m.name} className="bar-month-group">
                  <div className="bars-pair">
                    <div className="bar-col bar-blue" style={{ height: `${m.blue}px` }} title={`New: ${m.blue}`} />
                    <div className="bar-col bar-gold" style={{ height: `${m.gold}px` }} title={`Active: ${m.gold}`} />
                  </div>
                  <span className="month-label">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Split: Recent Student Roster & Semester Distribution */}
          <div className="bottom-split-row">
            {/* Student Directory Table */}
            <div className="performer-card">
              <div className="card-top-row">
                <h3 className="card-title">Student Directory ({totalCount} Registered)</h3>
                <Link to="/students" style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>View All</Link>
              </div>

              <div className="performer-tabs">
                <span className="performer-tab active">All Students</span>
                <span className="performer-tab" onClick={() => navigate('/add-student')}>+ Add Student</span>
              </div>

              <table className="performer-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Department</th>
                    <th>Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.slice(0, 4).map((st) => (
                      <tr key={st._id}>
                        <td>
                          <div className="performer-user">
                            <div className="performer-avatar">
                              {st.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600 }}>{st.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{st.studentId}</td>
                        <td>{st.department}</td>
                        <td>
                          <span className="badge badge-primary">Sem {st.semester}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td>
                          <div className="performer-user">
                            <div className="performer-avatar">PS</div>
                            <span style={{ fontWeight: 600 }}>Priya Sharma</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>CS2024001</td>
                        <td>Computer Science</td>
                        <td><span className="badge badge-primary">Sem 3</span></td>
                      </tr>
                      <tr>
                        <td>
                          <div className="performer-user">
                            <div className="performer-avatar">RK</div>
                            <span style={{ fontWeight: 600 }}>Raj Kumar</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>IT2024042</td>
                        <td>Information Tech</td>
                        <td><span className="badge badge-primary">Sem 2</span></td>
                      </tr>
                      <tr>
                        <td>
                          <div className="performer-user">
                            <div className="performer-avatar">AD</div>
                            <span style={{ fontWeight: 600 }}>Ananya Deshmukh</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>EE2024018</td>
                        <td>Electronics</td>
                        <td><span className="badge badge-primary">Sem 5</span></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Student Retention & Department Distribution */}
            <div className="attendance-card">
              <div className="card-top-row" style={{ width: '100%' }}>
                <h3 className="card-title">Student Retention</h3>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>···</span>
              </div>

              {/* Concentric Ring Graphic */}
              <div className="circular-chart-box">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {/* Outer circle: Retention Rate */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
                  <circle
                    cx="60" cy="60" r="50" fill="none" stroke="#3d4a5d" strokeWidth="8"
                    strokeDasharray="314" strokeDashoffset="34" strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                  {/* Inner circle: Semester Progress */}
                  <circle cx="60" cy="60" r="36" fill="none" stroke="#fef3c7" strokeWidth="6"/>
                  <circle
                    cx="60" cy="60" r="36" fill="none" stroke="#f59e0b" strokeWidth="6"
                    strokeDasharray="226" strokeDashoffset="26" strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
              </div>

              <div className="attendance-stats-footer">
                <div className="att-stat-item">
                  <span className="att-label">Retention Rate</span>
                  <span className="att-val" style={{ color: '#3d4a5d' }}>89%</span>
                </div>
                <div className="att-stat-item">
                  <span className="att-label">Graduation Rate</span>
                  <span className="att-val" style={{ color: '#f59e0b' }}>92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Academic Calendar & Quick Add Student CTA) */}
        <div className="main-right-column">
          {/* Academic Calendar Card */}
          <div className="events-calendar-card">
            <div className="card-top-row">
              <h3 className="card-title">Academic Calendar</h3>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>···</span>
            </div>

            {/* Event Capsules */}
            <div className="event-capsule-row">
              <div className="event-capsule">
                <span className="event-date-badge">● Semester Start</span>
                <span className="event-title">Enrollment &rarr;</span>
              </div>
              <div className="event-capsule">
                <span className="event-date-badge" style={{ color: '#ef4444' }}>● Examinations</span>
                <span className="event-title">Final Exam &rarr;</span>
              </div>
            </div>

            {/* Mini Calendar View */}
            <div className="mini-calendar-header">
              <span>&lsaquo;</span>
              <span>November 2026</span>
              <span>&rsaquo;</span>
            </div>

            <div className="calendar-weekdays">
              <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>

            <div className="calendar-days-grid">
              <span>1</span><span>2</span><span>3</span><span>4</span>
              <span className="cal-day active-blue">5</span><span>6</span><span>7</span>
              <span>8</span><span>9</span><span className="cal-day active-rose">10</span><span>11</span><span>12</span><span>13</span><span>14</span>
              <span>15</span><span>16</span><span>17</span><span>18</span>
              <span className="cal-day active-dark">19</span><span>20</span><span>21</span>
              <span>22</span><span>23</span><span className="cal-day active-blue">24</span><span>25</span><span>26</span>
              <span>27</span><span>28</span><span>29</span><span>30</span>
            </div>
          </div>

          {/* Quick Action Student Card */}
          <div className="community-cta-card">
            <div className="cta-title">
              Manage student records, departments, and academic progress.
            </div>
            <button
              className="cta-btn"
              onClick={() => navigate('/add-student')}
            >
              + Add New Student
            </button>
            <div className="cta-graphic" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

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
      setError(err.message || 'Failed to load college faculty dashboard.');
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
        <h3 style={{ color: 'var(--color-accent-rose)' }}>Unable to Load College Dashboard</h3>
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

  // Monthly Academic Credit Hours / Lecture delivery
  const months = [
    { name: 'Jan', blue: 115, gold: 50 },
    { name: 'Feb', blue: 95,  gold: 68 },
    { name: 'Mar', blue: 70,  gold: 48 },
    { name: 'Apr', blue: 105, gold: 80 },
    { name: 'May', blue: 25,  gold: 55 },
    { name: 'Jun', blue: 80,  gold: 45 },
    { name: 'Jul', blue: 140, gold: 80 },
    { name: 'Aug', blue: 75,  gold: 98 },
    { name: 'Sep', blue: 120, gold: 58 },
    { name: 'Oct', blue: 105, gold: 72 },
    { name: 'Nov', blue: 85,  gold: 48 },
    { name: 'Dec', blue: 90,  gold: 95 },
  ];

  return (
    <div className="dashboard">
      {/* ── 1. Top 4 Metric Cards: College Faculty Metrics ── */}
      <section className="top-metrics-grid">
        {/* Card 1: Total Enrolled Undergrads / Students */}
        <div className="metric-card" onClick={() => navigate('/students')} title="View Enrolled Students">
          <div className="metric-icon-box" style={{ background: '#eff6ff' }}>
            🎓
          </div>
          <div className="metric-content">
            <span className="metric-label">Enrolled Students</span>
            <span className="metric-value">{totalCount > 0 ? totalCount.toLocaleString() : '3,450'}</span>
          </div>
        </div>

        {/* Card 2: Faculty Members / Professors */}
        <div className="metric-card" onClick={() => navigate('/departments')} title="Faculty Roster">
          <div className="metric-icon-box" style={{ background: '#fdf2f8' }}>
            👨‍🏫
          </div>
          <div className="metric-content">
            <span className="metric-label">College Faculty</span>
            <span className="metric-value">{deptCount > 0 ? deptCount * 14 : '182'}</span>
          </div>
        </div>

        {/* Card 3: Academic Departments */}
        <div className="metric-card" onClick={() => navigate('/departments')} title="Academic Departments">
          <div className="metric-icon-box" style={{ background: '#f5f3ff' }}>
            🏛️
          </div>
          <div className="metric-content">
            <span className="metric-label">Departments</span>
            <span className="metric-value">{deptCount > 0 ? deptCount : '12'}</span>
          </div>
        </div>

        {/* Card 4: Research & Academic Grants */}
        <div className="metric-card" onClick={() => navigate('/reports')} title="Research & Lab Grants">
          <div className="metric-icon-box" style={{ background: '#fffbeb' }}>
            🔬
          </div>
          <div className="metric-content">
            <span className="metric-label">Research Grants</span>
            <span className="metric-value">$184.5k</span>
          </div>
        </div>
      </section>

      {/* ── 2. Two-Column Main Layout ── */}
      <div className="dashboard-main-layout">
        {/* Left Column (Academic Delivery Chart + Top Merits & Attendance) */}
        <div className="main-left-column">
          {/* Lecture Hours & Lab Work Activity */}
          <div className="chart-card">
            <div className="card-top-row">
              <h3 className="card-title">Academic & Lab Hours Delivered</h3>
              <div className="chart-legend">
                <span>
                  <span className="legend-dot" style={{ background: '#3d4a5d' }} />
                  Lecture Hours
                </span>
                <span>
                  <span className="legend-dot" style={{ background: '#f59e0b' }} />
                  Practical Labs
                </span>
                <select className="year-dropdown" defaultValue="2026">
                  <option value="2026">2026 - 2027</option>
                  <option value="2025">2025 - 2026</option>
                </select>
              </div>
            </div>

            <div className="bar-chart-container">
              {months.map((m) => (
                <div key={m.name} className="bar-month-group">
                  <div className="bars-pair">
                    <div className="bar-col bar-blue" style={{ height: `${m.blue}px` }} title={`Lectures: ${m.blue} hrs`} />
                    <div className="bar-col bar-gold" style={{ height: `${m.gold}px` }} title={`Labs: ${m.gold} hrs`} />
                  </div>
                  <span className="month-label">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Split: Dean's Honor Roll / Top Students & College Attendance */}
          <div className="bottom-split-row">
            {/* Top Academic Performers Card */}
            <div className="performer-card">
              <div className="card-top-row">
                <h3 className="card-title">Dean's Honor Roll / Top Students</h3>
                <Link to="/students" style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>View All</Link>
              </div>

              <div className="performer-tabs">
                <span className="performer-tab active">Semester</span>
                <span className="performer-tab">Academic Year</span>
                <span className="performer-tab">Cumulative</span>
              </div>

              <table className="performer-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll / ID</th>
                    <th>Major & Sem</th>
                    <th>CGPA / Score</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.slice(0, 3).map((st, i) => (
                      <tr key={st._id}>
                        <td>
                          <div className="performer-user">
                            <div className="performer-avatar">
                              {st.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600 }}>{st.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{st.studentId}</td>
                        <td>{st.department} · S{st.semester}</td>
                        <td>
                          <div className="performer-score-bar">
                            <span className="score-text">{(9.8 - (i * 0.15)).toFixed(2)} CGPA</span>
                            <div className="score-line">
                              <div className="score-fill" style={{ width: `${98 - (i * 3)}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td>
                          <div className="performer-user">
                            <div className="performer-avatar">AK</div>
                            <span style={{ fontWeight: 600 }}>Aarav Kulkarni</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>CS202401</td>
                        <td>Computer Science · Sem 6</td>
                        <td>
                          <div className="performer-score-bar">
                            <span className="score-text">9.85 CGPA</span>
                            <div className="score-line"><div className="score-fill" style={{ width: '98%' }} /></div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="performer-user">
                            <div className="performer-avatar">PS</div>
                            <span style={{ fontWeight: 600 }}>Priya Sharma</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>IT202419</td>
                        <td>Information Tech · Sem 4</td>
                        <td>
                          <div className="performer-score-bar">
                            <span className="score-text">9.62 CGPA</span>
                            <div className="score-line"><div className="score-fill" style={{ width: '95%' }} /></div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="performer-user">
                            <div className="performer-avatar">RV</div>
                            <span style={{ fontWeight: 600 }}>Rohan Verma</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>EE202442</td>
                        <td>Electronics · Sem 8</td>
                        <td>
                          <div className="performer-score-bar">
                            <span className="score-text">9.45 CGPA</span>
                            <div className="score-line"><div className="score-fill" style={{ width: '92%' }} /></div>
                          </div>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Attendance & Faculty Engagement Card */}
            <div className="attendance-card">
              <div className="card-top-row" style={{ width: '100%' }}>
                <h3 className="card-title">College Attendance</h3>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>···</span>
              </div>

              {/* Concentric Circle Graphic */}
              <div className="circular-chart-box">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {/* Outer circle: Undergrad Attendance (Navy/Slate) */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
                  <circle
                    cx="60" cy="60" r="50" fill="none" stroke="#3d4a5d" strokeWidth="8"
                    strokeDasharray="314" strokeDashoffset="44" strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                  {/* Inner circle: Faculty Lecture Delivery (Gold) */}
                  <circle cx="60" cy="60" r="36" fill="none" stroke="#fef3c7" strokeWidth="6"/>
                  <circle
                    cx="60" cy="60" r="36" fill="none" stroke="#f59e0b" strokeWidth="6"
                    strokeDasharray="226" strokeDashoffset="18" strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
              </div>

              <div className="attendance-stats-footer">
                <div className="att-stat-item">
                  <span className="att-label">Student Attendance</span>
                  <span className="att-val" style={{ color: '#3d4a5d' }}>86%</span>
                </div>
                <div className="att-stat-item">
                  <span className="att-label">Faculty Lectures</span>
                  <span className="att-val" style={{ color: '#f59e0b' }}>93%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (College Academic Calendar & Faculty Notice Board) */}
        <div className="main-right-column">
          {/* Academic Calendar Card */}
          <div className="events-calendar-card">
            <div className="card-top-row">
              <h3 className="card-title">Academic Schedule</h3>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>···</span>
            </div>

            {/* Event Capsules */}
            <div className="event-capsule-row">
              <div className="event-capsule">
                <span className="event-date-badge">● 10 Nov, 2026</span>
                <span className="event-title">Mid-Sem Exams &rarr;</span>
              </div>
              <div className="event-capsule">
                <span className="event-date-badge" style={{ color: '#ef4444' }}>● 24 Nov, 2026</span>
                <span className="event-title">Faculty Senate &rarr;</span>
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

          {/* College Faculty Notice Board CTA */}
          <div className="community-cta-card">
            <div className="cta-title">
              College Faculty Senate & Syllabus Board
            </div>
            <button
              className="cta-btn"
              onClick={() => navigate('/add-student')}
            >
              + Register Student
            </button>
            <div className="cta-graphic" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

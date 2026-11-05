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
      setError(err.message || 'Failed to load dashboard data.');
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

  const totalCount = stats?.total ?? 0;
  const deptCount  = stats?.byDepartment?.length ?? 0;

  // Monthly bar heights matching reference visual
  const months = [
    { name: 'Jan', blue: 110, gold: 50 },
    { name: 'Feb', blue: 90,  gold: 68 },
    { name: 'Mar', blue: 60,  gold: 48 },
    { name: 'Apr', blue: 95,  gold: 80 },
    { name: 'May', blue: 12,  gold: 55 },
    { name: 'Jun', blue: 75,  gold: 45 },
    { name: 'Jul', blue: 140, gold: 80 },
    { name: 'Aug', blue: 65,  gold: 98 },
    { name: 'Sep', blue: 115, gold: 58 },
    { name: 'Oct', blue: 98,  gold: 72 },
    { name: 'Nov', blue: 62,  gold: 48 },
    { name: 'Dec', blue: 85,  gold: 95 },
  ];

  return (
    <div className="dashboard">
      {/* ── 1. Top 4 Metric Cards matching Screenshot ── */}
      <section className="top-metrics-grid">
        {/* Card 1: Students */}
        <div className="metric-card" onClick={() => navigate('/students')} title="View all students">
          <div className="metric-icon-box" style={{ background: '#eff6ff' }}>
            🎓
          </div>
          <div className="metric-content">
            <span className="metric-label">Students</span>
            <span className="metric-value">{totalCount > 0 ? totalCount.toLocaleString() : '12,478'}</span>
          </div>
        </div>

        {/* Card 2: Teachers / Faculty */}
        <div className="metric-card" onClick={() => navigate('/departments')} title="Faculty & Departments">
          <div className="metric-icon-box" style={{ background: '#fdf2f8' }}>
            👩‍🏫
          </div>
          <div className="metric-content">
            <span className="metric-label">Teachers</span>
            <span className="metric-value">{deptCount > 0 ? deptCount * 12 : '478'}</span>
          </div>
        </div>

        {/* Card 3: Parents */}
        <div className="metric-card" onClick={() => navigate('/reports')}>
          <div className="metric-icon-box" style={{ background: '#f5f3ff' }}>
            👨‍👩‍👦
          </div>
          <div className="metric-content">
            <span className="metric-label">Parents</span>
            <span className="metric-value">{totalCount > 0 ? (totalCount * 2).toLocaleString() : '8,908'}</span>
          </div>
        </div>

        {/* Card 4: Earnings / Budget */}
        <div className="metric-card" onClick={() => navigate('/settings')}>
          <div className="metric-icon-box" style={{ background: '#fffbeb' }}>
            💰
          </div>
          <div className="metric-content">
            <span className="metric-label">Earnings</span>
            <span className="metric-value">$42.8k</span>
          </div>
        </div>
      </section>

      {/* ── 2. Two-Column Main Layout ── */}
      <div className="dashboard-main-layout">
        {/* Left Column (Chart + Bottom Split) */}
        <div className="main-left-column">
          {/* Total Earnings Bar Chart */}
          <div className="chart-card">
            <div className="card-top-row">
              <h3 className="card-title">Total Earnings</h3>
              <div className="chart-legend">
                <span>
                  <span className="legend-dot" style={{ background: '#3d4a5d' }} />
                  Earnings
                </span>
                <span>
                  <span className="legend-dot" style={{ background: '#f59e0b' }} />
                  Expense
                </span>
                <select className="year-dropdown" defaultValue="2026">
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            </div>

            <div className="bar-chart-container">
              {months.map((m) => (
                <div key={m.name} className="bar-month-group">
                  <div className="bars-pair">
                    <div className="bar-col bar-blue" style={{ height: `${m.blue}px` }} title={`Earnings: $${m.blue}k`} />
                    <div className="bar-col bar-gold" style={{ height: `${m.gold}px` }} title={`Expense: $${m.gold}k`} />
                  </div>
                  <span className="month-label">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Split: Top Performer & Attendance */}
          <div className="bottom-split-row">
            {/* Top Performer Card */}
            <div className="performer-card">
              <div className="card-top-row">
                <h3 className="card-title">Top Performer</h3>
                <Link to="/students" style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>See all</Link>
              </div>

              <div className="performer-tabs">
                <span className="performer-tab active">Week</span>
                <span className="performer-tab">Month</span>
                <span className="performer-tab">Year</span>
              </div>

              <table className="performer-table">
                <thead>
                  <tr>
                    <th>Photo & Name</th>
                    <th>ID Number</th>
                    <th>Department / Class</th>
                    <th>Score / Rank</th>
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
                        <td>{st.department}</td>
                        <td>
                          <div className="performer-score-bar">
                            <span className="score-text">{98.6 - (i * 0.4)}%</span>
                            <div className="score-line">
                              <div className="score-fill" style={{ width: `${98 - (i * 2)}%` }} />
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
                            <div className="performer-avatar">ES</div>
                            <span style={{ fontWeight: 600 }}>Enos Schimel</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>ID: 4278</td>
                        <td>6th Class</td>
                        <td>
                          <div className="performer-score-bar">
                            <span className="score-text">98.68%</span>
                            <div className="score-line"><div className="score-fill" style={{ width: '98%' }} /></div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="performer-user">
                            <div className="performer-avatar">CB</div>
                            <span style={{ fontWeight: 600 }}>Cayla Bergnaum</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>ID: 2347</td>
                        <td>8th Class</td>
                        <td>
                          <div className="performer-score-bar">
                            <span className="score-text">98.22%</span>
                            <div className="score-line"><div className="score-fill" style={{ width: '96%' }} /></div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="performer-user">
                            <div className="performer-avatar">KH</div>
                            <span style={{ fontWeight: 600 }}>Kathryn Hahn</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>ID: 5940</td>
                        <td>5th Class</td>
                        <td>
                          <div className="performer-score-bar">
                            <span className="score-text">97.00%</span>
                            <div className="score-line"><div className="score-fill" style={{ width: '93%' }} /></div>
                          </div>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Attendance Donut Chart Card */}
            <div className="attendance-card">
              <div className="card-top-row" style={{ width: '100%' }}>
                <h3 className="card-title">Attendance</h3>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>···</span>
              </div>

              {/* Concentric Circle Graphic */}
              <div className="circular-chart-box">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {/* Outer circle: Students (Blue) */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
                  <circle
                    cx="60" cy="60" r="50" fill="none" stroke="#3d4a5d" strokeWidth="8"
                    strokeDasharray="314" strokeDashoffset="50" strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                  {/* Inner circle: Teachers (Gold) */}
                  <circle cx="60" cy="60" r="36" fill="none" stroke="#fef3c7" strokeWidth="6"/>
                  <circle
                    cx="60" cy="60" r="36" fill="none" stroke="#f59e0b" strokeWidth="6"
                    strokeDasharray="226" strokeDashoffset="22" strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
              </div>

              <div className="attendance-stats-footer">
                <div className="att-stat-item">
                  <span className="att-label">Students</span>
                  <span className="att-val" style={{ color: '#3d4a5d' }}>84%</span>
                </div>
                <div className="att-stat-item">
                  <span className="att-label">Teachers</span>
                  <span className="att-val" style={{ color: '#f59e0b' }}>91%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Events Calendar + Join Community CTA) */}
        <div className="main-right-column">
          {/* Events Calendar Card */}
          <div className="events-calendar-card">
            <div className="card-top-row">
              <h3 className="card-title">Events Calendar</h3>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>···</span>
            </div>

            {/* Two Events Capsule Badges */}
            <div className="event-capsule-row">
              <div className="event-capsule">
                <span className="event-date-badge">● 08 Jan, 2026</span>
                <span className="event-title">School Annual &rarr;</span>
              </div>
              <div className="event-capsule">
                <span className="event-date-badge" style={{ color: '#ef4444' }}>● 27 Jan, 2026</span>
                <span className="event-title">Sport Meet &rarr;</span>
              </div>
            </div>

            {/* Mini Calendar View */}
            <div className="mini-calendar-header">
              <span>&lsaquo;</span>
              <span>November 2026</span>
              <span>&rsaquo;</span>
            </div>

            <div className="calendar-weekdays">
              <span>SAN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>

            <div className="calendar-days-grid">
              <span>1</span><span>2</span><span>3</span><span>4</span>
              <span className="cal-day active-blue">5</span><span>6</span><span>7</span>
              <span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span>
              <span>15</span><span>16</span><span>17</span><span>18</span>
              <span className="cal-day active-dark">19</span><span>20</span><span>21</span>
              <span>22</span><span>23</span><span>24</span><span>25</span><span>26</span>
              <span className="cal-day active-rose">27</span><span>28</span>
              <span>29</span><span>30</span>
            </div>
          </div>

          {/* Join Community Dark Slate CTA */}
          <div className="community-cta-card">
            <div className="cta-title">
              Join the faculty community and find out more...
            </div>
            <button
              className="cta-btn"
              onClick={() => navigate('/students')}
            >
              Explore now
            </button>
            <div className="cta-graphic" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

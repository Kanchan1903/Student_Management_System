import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getStats, getAllStudents } from '../services/api';
import { SkeletonStatCards, SkeletonCard } from '../components/LoadingSpinner';
import './Reports.css';

const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const DEPT_COLORS = [
  '#6366f1','#3b82f6','#10b981','#f59e0b',
  '#ef4444','#8b5cf6','#06b6d4','#84cc16',
  '#f97316','#ec4899','#14b8a6','#a855f7','#64748b',
];

// ─── CSV Export ───────────────────────────────────────────────────────────────
const escapeCSV = (val) => {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const downloadCSV = (students, label = 'students') => {
  const headers = ['Student ID', 'Full Name', 'Email', 'Department', 'Semester', 'Attendance (%)', 'Contact', 'Registered On'];
  const rows = students.map(s => [
    s.studentId, s.name, s.email, s.department, s.semester,
    s.attendance !== undefined ? s.attendance : 85,
    s.contact || '',
    new Date(s.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
  ].map(escapeCSV).join(','));

  const csv  = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `edumanage_${label}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ─── Reports Page ─────────────────────────────────────────────────────────────
const Reports = ({ showNotification }) => {
  const [stats,      setStats]      = useState(null);
  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem,  setFilterSem]  = useState('');
  const [exporting,  setExporting]  = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const [statsRes, studentsRes] = await Promise.all([
        getStats(),
        getAllStudents({ limit: 1000 }),
      ]);
      setStats(statsRes.data.data);
      setStudents(studentsRes.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filtered students ────────────────────────────────────────────
  const filtered = students.filter(s => {
    if (filterDept && s.department !== filterDept) return false;
    if (filterSem  && String(s.semester) !== filterSem) return false;
    return true;
  });

  // ── CSV Export ───────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      setExporting(true);
      const label = filterDept
        ? filterDept.replace(/\s+/g, '_').toLowerCase()
        : filterSem ? `sem${filterSem}` : 'all';
      downloadCSV(filtered, label);
      showNotification('success', `Exported ${filtered.length} record${filtered.length !== 1 ? 's' : ''} to CSV.`);
    } catch (err) {
      showNotification('error', 'Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <div className="skeleton skeleton-text" style={{ width: 220, height: 32, marginBottom: 8 }} />
          <div className="skeleton skeleton-text" style={{ width: 280, height: 14 }} />
        </div>
      </div>
      <SkeletonStatCards />
      <div className="reports-grid"><SkeletonCard lines={6} /><SkeletonCard lines={6} /></div>
    </div>
  );

  if (error) return (
    <div className="error-state page-enter">
      <h3>Failed to Load Reports</h3>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={fetchData}>Retry</button>
    </div>
  );

  const total       = stats?.total || 0;
  const byDept      = stats?.byDepartment || [];
  const bySem       = stats?.bySemester   || [];
  const recentCount = stats?.recentCount  || 0;
  const maxDeptCount= Math.max(...byDept.map(d => d.count), 1);
  const maxSemCount = Math.max(...bySem.map(s => s.count), 1);

  return (
    <div className="page-enter">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Insights from {total} student record{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          id="export-csv-btn"
          className="btn btn-primary"
          onClick={handleExport}
          disabled={exporting || filtered.length === 0}
        >
          {exporting ? (
            <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Exporting…</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV ({filtered.length})
            </>
          )}
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Students',   value: total,                  icon: '👥', color: 'primary' },
          { label: 'Departments',      value: byDept.length,          icon: '🏛️', color: 'info' },
          { label: 'Semesters Active', value: bySem.length,           icon: '📅', color: 'success' },
          { label: 'Added This Week',  value: recentCount,            icon: '✨', color: 'warning' },
        ].map(({ label, value, icon, color }, i) => (
          <div key={label} className={`stat-card stat-card-${color} animate-in-delay-${i+1}`}>
            <div className={`stat-icon stat-icon-${color}`} style={{ fontSize: '1.4rem' }}>{icon}</div>
            <div className="stat-content">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="card filters-card animate-in" style={{ marginBottom: 24 }}>
        <div className="filters-row">
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Filter Report:</span>
          <select id="report-dept-filter" className="form-control filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select id="report-sem-filter" className="form-control filter-select" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          {(filterDept || filterSem) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilterDept(''); setFilterSem(''); }}>✕ Clear</button>
          )}
          <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Charts Grid ── */}
      <div className="reports-grid">
        {/* Department Chart */}
        <div className="card animate-in">
          <div className="card-header">
            <h3>Department Distribution</h3>
          </div>
          {byDept.length === 0 ? (
            <div className="empty-state"><p>No data available.</p></div>
          ) : (
            <div className="report-bar-list">
              {byDept.map((dept, i) => {
                const pct    = Math.round((dept.count / maxDeptCount) * 100);
                const totPct = total > 0 ? Math.round((dept.count / total) * 100) : 0;
                return (
                  <div key={dept._id} className="report-bar-row">
                    <div className="report-bar-label">{dept._id}</div>
                    <div className="report-bar-track">
                      <div
                        className="report-bar-fill"
                        style={{ width: `${pct}%`, background: DEPT_COLORS[i % DEPT_COLORS.length] }}
                      />
                    </div>
                    <div className="report-bar-meta">
                      <span>{dept.count}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{totPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Semester Chart */}
        <div className="card animate-in">
          <div className="card-header">
            <h3>Semester Distribution</h3>
          </div>
          {bySem.length === 0 ? (
            <div className="empty-state"><p>No data available.</p></div>
          ) : (
            <div className="report-bar-list">
              {Array.from({ length: 8 }, (_, i) => {
                const sem   = i + 1;
                const found = bySem.find(s => s._id === sem);
                const count = found?.count || 0;
                const pct   = Math.round((count / maxSemCount) * 100);
                const totPct= total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={sem} className="report-bar-row">
                    <div className="report-bar-label">Semester {sem}</div>
                    <div className="report-bar-track">
                      <div
                        className="report-bar-fill"
                        style={{ width: count > 0 ? `${pct}%` : '0%', background: '#6366f1' }}
                      />
                    </div>
                    <div className="report-bar-meta">
                      <span>{count}</span>
                      {count > 0 && <span style={{ color: 'var(--color-text-muted)' }}>{totPct}%</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Student Table ── */}
      <div className="card animate-in" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3>Student Records {(filterDept || filterSem) && <span className="badge badge-info" style={{ marginLeft: 8, fontSize: '0.75rem' }}>Filtered</span>}</h3>
          <span className="badge badge-primary">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No records match the selected filters.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="table" aria-label="Report Student Records">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((s, idx) => (
                  <tr key={s._id}>
                    <td className="row-num">{idx + 1}</td>
                    <td><span className="student-id-badge">{s.studentId}</span></td>
                    <td>
                      <div className="student-name-cell">
                        <div className="mini-avatar">{s.name.charAt(0).toUpperCase()}</div>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="email-cell">{s.email}</td>
                    <td><span className="badge badge-info">{s.department}</span></td>
                    <td><span className="badge badge-success">Sem {s.semester}</span></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 100 && (
              <div style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '0.82rem', borderTop: '1px solid var(--color-border)' }}>
                Showing first 100 of {filtered.length} records. Export CSV to get all records.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

import React, { useState, useEffect, useCallback } from 'react';
import { getAttendanceSubjects, getAttendanceSheet, submitAttendance } from '../services/api';
import './Attendance.css';

const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const getTodayString = () => new Date().toISOString().split('T')[0];

const Attendance = ({ showNotification }) => {
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState('7');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(getTodayString());

  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({}); // { [studentId]: 'Present' | 'Absent' | 'Late' }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 1. Fetch subjects whenever department or semester changes
  useEffect(() => {
    let isMounted = true;
    const fetchSubs = async () => {
      try {
        const res = await getAttendanceSubjects({ department, semester });
        if (isMounted) {
          const subs = res.data.subjects || [];
          setAvailableSubjects(subs);
          if (subs.length > 0) {
            setSubject(subs[0]);
          } else {
            setSubject('');
          }
        }
      } catch (err) {
        console.error('Failed to load subjects', err);
      }
    };
    fetchSubs();
    return () => { isMounted = false; };
  }, [department, semester]);

  // 2. Fetch student list & existing attendance for (dept, sem, subject, date)
  const loadSheet = useCallback(async () => {
    if (!department || !semester) return;
    try {
      setLoading(true);
      setSubmitted(false);
      const res = await getAttendanceSheet({
        department,
        semester,
        subject,
        date,
      });

      const list = res.data.data || [];
      setStudents(list);

      const initStatus = {};
      list.forEach((st) => {
        initStatus[st._id] = st.status || 'Present';
      });
      setRecords(initStatus);
    } catch (err) {
      showNotification('error', err.message || 'Failed to load class sheet.');
    } finally {
      setLoading(false);
    }
  }, [department, semester, subject, date, showNotification]);

  useEffect(() => {
    loadSheet();
  }, [loadSheet]);

  // Status toggle handler for a student
  const handleStatusChange = (studentMongoId, status) => {
    setRecords((prev) => ({
      ...prev,
      [studentMongoId]: status,
    }));
  };

  // Mark all Present / Absent quick actions
  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setRecords(updated);
  };

  // Submit attendance to backend
  const handleSave = async () => {
    if (!subject) {
      showNotification('error', 'Please select a subject to mark attendance.');
      return;
    }
    if (students.length === 0) {
      showNotification('error', 'No students enrolled in this class to mark.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        department,
        semester: Number(semester),
        subject,
        date,
        records: students.map((s) => ({
          studentIdMongo: s._id,
          studentId: s.studentId,
          name: s.name,
          status: records[s._id] || 'Present',
        })),
      };

      await submitAttendance(payload);
      setSubmitted(true);
      showNotification(
        'success',
        `Attendance recorded successfully for ${subject} (${date})!`
      );
    } catch (err) {
      showNotification('error', err.message || 'Failed to submit attendance.');
    } finally {
      setSaving(false);
    }
  };

  // Summary counts
  const totalStudents = students.length;
  const presentCount = Object.values(records).filter((s) => s === 'Present').length;
  const absentCount = Object.values(records).filter((s) => s === 'Absent').length;
  const lateCount = Object.values(records).filter((s) => s === 'Late').length;
  const presentPct = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  return (
    <div className="attendance-page page-enter">
      {/* ── Top Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Attendance Portal</h1>
          <p className="page-subtitle">
            Mark and track daily classroom attendance by department, semester, and subject
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || loading || students.length === 0}
          >
            {saving ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Save Attendance
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Class Selection Filter Card ── */}
      <div className="card attendance-control-card">
        <div className="attendance-filter-grid">
          {/* Department */}
          <div className="filter-field">
            <label className="filter-label">Department</label>
            <select
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="filter-field">
            <label className="filter-label">Semester</label>
            <select
              className="form-control"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="filter-field">
            <label className="filter-label">Subject / Course</label>
            <select
              className="form-control"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {availableSubjects.length === 0 ? (
                <option value="">No subjects listed</option>
              ) : (
                availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))
              )}
            </select>
          </div>

          {/* Date */}
          <div className="filter-field">
            <label className="filter-label">Lecture Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Attendance Stats & Quick Actions Bar ── */}
      <div className="attendance-stats-bar">
        <div className="stat-pill present-pill">
          <span className="dot dot-present" />
          <span>Present: <strong>{presentCount}</strong></span>
        </div>
        <div className="stat-pill absent-pill">
          <span className="dot dot-absent" />
          <span>Absent: <strong>{absentCount}</strong></span>
        </div>
        <div className="stat-pill late-pill">
          <span className="dot dot-late" />
          <span>Late: <strong>{lateCount}</strong></span>
        </div>
        <div className="stat-pill total-pill">
          <span>Turnout: <strong>{presentPct}%</strong> ({presentCount + lateCount}/{totalStudents})</span>
        </div>

        <div className="quick-mark-group">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Quick Mark:</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => markAll('Present')}
            disabled={students.length === 0}
          >
            All Present
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => markAll('Absent')}
            disabled={students.length === 0}
          >
            All Absent
          </button>
        </div>
      </div>

      {/* ── Student Attendance Table Card ── */}
      <div className="card attendance-table-card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <span className="spinner" style={{ margin: '0 auto 12px', display: 'block' }} />
            Loading class roster...
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div className="empty-state-icon">📋</div>
            <h3>No Students Found</h3>
            <p>
              There are no enrolled students in {department} (Semester {semester}).
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table attendance-table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Department & Sem</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => {
                  const currentStatus = records[st._id] || 'Present';
                  return (
                    <tr key={st._id} className="attendance-row">
                      <td className="row-num">{idx + 1}</td>
                      <td>
                        <span className="student-id-badge">{st.studentId}</span>
                      </td>
                      <td>
                        <div className="student-name-cell">
                          <div className="mini-avatar">{st.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{st.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{st.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{st.department} · S{st.semester}</span>
                      </td>
                      <td>
                        <div className="status-toggle-group">
                          <button
                            type="button"
                            className={`status-btn btn-present ${currentStatus === 'Present' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(st._id, 'Present')}
                          >
                            ✓ Present
                          </button>
                          <button
                            type="button"
                            className={`status-btn btn-absent ${currentStatus === 'Absent' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(st._id, 'Absent')}
                          >
                            ✕ Absent
                          </button>
                          <button
                            type="button"
                            className={`status-btn btn-late ${currentStatus === 'Late' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(st._id, 'Late')}
                          >
                            ⏱ Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Save Bar */}
        {students.length > 0 && !loading && (
          <div className="attendance-footer-bar">
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {submitted ? (
                <span style={{ color: '#059669', fontWeight: 600 }}>
                  ✓ Attendance submitted and updated in student academic records.
                </span>
              ) : (
                'Review marks and click Save Attendance to finalize.'
              )}
            </span>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllStudents, deleteStudent, updateStudent } from '../services/api';
import Modal from '../components/Modal';
import StudentForm from '../components/StudentForm';
import { SkeletonRows } from '../components/LoadingSpinner';
import './Students.css';

const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const PAGE_SIZES = [10, 25, 50, 100];

const SortIcon = ({ field, sortField, sortDir }) => {
  if (sortField !== field) return <span className="sort-indicator">↕</span>;
  return <span className={`sort-indicator active`}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
};

const Students = ({ showNotification }) => {
  const [searchParams] = useSearchParams();

  const [students,      setStudents]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [debouncedSearch, setDebounced]   = useState('');
  const [filterDept,    setFilterDept]    = useState(searchParams.get('department') || '');
  const [filterSem,     setFilterSem]     = useState(searchParams.get('semester')   || '');

  // Pagination
  const [currentPage,   setCurrentPage]   = useState(1);
  const [pageSize,      setPageSize]      = useState(
    () => parseInt(localStorage.getItem('edumanage_page_size') || '10', 10)
  );

  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir,   setSortDir]   = useState('desc');

  // Modals
  const [deleteModal,  setDeleteModal]  = useState({ open: false, student: null });
  const [deleteLoading,setDeleteLoading]= useState(false);
  const [editModal,    setEditModal]    = useState({ open: false, student: null });
  const [editLoading,  setEditLoading]  = useState(false);
  const [viewStudent,  setViewStudent]  = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(searchQuery); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [filterDept, filterSem]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { limit: 500 };
      if (debouncedSearch) params.search     = debouncedSearch;
      if (filterDept)      params.department = filterDept;
      if (filterSem)       params.semester   = filterSem;
      const res = await getAllStudents(params);
      setStudents(res.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterDept, filterSem]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Sorting ──────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const sorted = [...students].sort((a, b) => {
    let av = a[sortField] ?? '';
    let bv = b[sortField] ?? '';
    if (sortField === 'semester' || sortField === 'attendance') { av = Number(av); bv = Number(bv); }
    else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  // ── Pagination ───────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage    = Math.min(currentPage, totalPages);
  const paginated   = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handlePageSize = (e) => {
    const val = parseInt(e.target.value, 10);
    setPageSize(val);
    localStorage.setItem('edumanage_page_size', val);
    setCurrentPage(1);
  };

  const pageNumbers = () => {
    const pages = [];
    const delta = 1;
    for (let i = Math.max(1, safePage - delta); i <= Math.min(totalPages, safePage + delta); i++) pages.push(i);
    return pages;
  };

  // ── Delete ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteStudent(deleteModal.student._id);
      showNotification('success', `"${deleteModal.student.name}" deleted successfully.`);
      setDeleteModal({ open: false, student: null });
      fetchStudents();
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete student.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────
  const handleEdit = async (formData) => {
    try {
      setEditLoading(true);
      await updateStudent(editModal.student._id, formData);
      showNotification('success', 'Student updated successfully.');
      setEditModal({ open: false, student: null });
      fetchStudents();
    } catch (err) {
      showNotification('error', err.message || 'Failed to update student.');
    } finally {
      setEditLoading(false);
    }
  };

  const clearFilters = () => { setSearchQuery(''); setFilterDept(''); setFilterSem(''); };

  const hasFilters = searchQuery || filterDept || filterSem;

  return (
    <div className="page-enter">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Records</h1>
          <p className="page-subtitle">
            {loading ? 'Loading...' : `${sorted.length} student${sorted.length !== 1 ? 's' : ''}${hasFilters ? ' matched' : ' total'}`}
          </p>
        </div>
        <Link id="students-add-btn" to="/add-student" className="btn btn-primary">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Student
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="card filters-card">
        <div className="filters-row">
          <div className="search-wrapper" style={{ flex: 1, minWidth: 220 }}>
            <span className="search-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              id="student-search-input"
              type="text"
              className="form-control search-input"
              placeholder="Search by name, ID or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select id="filter-dept-select" className="form-control filter-select" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select id="filter-sem-select" className="form-control filter-select" value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          {hasFilters && (
            <button id="clear-filters-btn" className="btn btn-ghost btn-sm" onClick={clearFilters}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card table-card">
        {error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Failed to Load Students</h3>
            <p>{error}</p>
            <button id="students-retry-btn" className="btn btn-primary btn-sm" onClick={fetchStudents}>Retry</button>
          </div>
        ) : !loading && sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" style={{ opacity: 0.35 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>{hasFilters ? 'No students match your filters' : 'No Students Yet'}</h3>
            <p>{hasFilters ? 'Try adjusting your search or filters.' : 'Get started by adding your first student record.'}</p>
            {!hasFilters && <Link to="/add-student" className="btn btn-primary btn-sm">Add First Student</Link>}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table" aria-label="Student Records">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th className="sortable-th" onClick={() => handleSort('studentId')}>
                    Student ID <SortIcon field="studentId" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="sortable-th" onClick={() => handleSort('name')}>
                    Name <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th>Email</th>
                  <th className="sortable-th" onClick={() => handleSort('department')}>
                    Department <SortIcon field="department" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="sortable-th" onClick={() => handleSort('semester')}>
                    Semester <SortIcon field="semester" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="sortable-th" onClick={() => handleSort('attendance')}>
                    Attendance <SortIcon field="attendance" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th>Contact</th>
                  <th style={{ width: 110 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={9} rows={pageSize > 10 ? 8 : pageSize} />
                ) : (
                  paginated.map((student, idx) => (
                    <tr key={student._id} className="table-row-animate">
                      <td className="row-num">{(safePage - 1) * pageSize + idx + 1}</td>
                      <td><span className="student-id-badge">{student.studentId}</span></td>
                      <td>
                        <div className="student-name-cell">
                          <div className="mini-avatar">{student.name.charAt(0).toUpperCase()}</div>
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td className="email-cell">{student.email}</td>
                      <td><span className="badge badge-info">{student.department}</span></td>
                      <td><span className="badge badge-success">Sem {student.semester}</span></td>
                      <td>
                        <span className={`badge ${student.attendance >= 75 ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 600 }}>
                          {student.attendance !== undefined ? `${student.attendance}%` : '85%'}
                        </span>
                      </td>
                      <td className="contact-cell">{student.contact || '—'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            id={`view-btn-${student._id}`}
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => setViewStudent(student)}
                            title="View Details"
                            aria-label={`View ${student.name}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button
                            id={`edit-btn-${student._id}`}
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => setEditModal({ open: true, student })}
                            title="Edit Student"
                            aria-label={`Edit ${student.name}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            id={`delete-btn-${student._id}`}
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() => setDeleteModal({ open: true, student })}
                            title="Delete Student"
                            aria-label={`Delete ${student.name}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ── Pagination Bar ── */}
            {!loading && sorted.length > 0 && (
              <div className="pagination-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="pagination-info">
                    Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
                  </span>
                  <select className="page-size-select" value={pageSize} onChange={handlePageSize} title="Rows per page">
                    {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
                  </select>
                </div>
                <div className="pagination-controls">
                  <button className="page-btn" onClick={() => setCurrentPage(1)} disabled={safePage === 1} title="First page">«</button>
                  <button className="page-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={safePage === 1} title="Previous">‹</button>
                  {pageNumbers().map(n => (
                    <button key={n} className={`page-btn${n === safePage ? ' active' : ''}`} onClick={() => setCurrentPage(n)}>{n}</button>
                  ))}
                  <button className="page-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={safePage === totalPages} title="Next">›</button>
                  <button className="page-btn" onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} title="Last page">»</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation ── */}
      <Modal
        isOpen={deleteModal.open}
        title="Delete Student"
        message={`Are you sure you want to permanently delete "${deleteModal.student?.name}" (${deleteModal.student?.studentId})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, student: null })}
        isLoading={deleteLoading}
      />

      {/* ── Edit Modal ── */}
      {editModal.open && (
        <div className="modal-backdrop" onClick={() => setEditModal({ open: false, student: null })}>
          <div className="modal edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" style={{ background: 'var(--color-primary-glow)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <div>
                <h3 className="modal-title">Edit Student</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Updating: {editModal.student?.name}
                </p>
              </div>
            </div>
            <StudentForm
              initialData={editModal.student}
              onSubmit={handleEdit}
              onCancel={() => setEditModal({ open: false, student: null })}
              isLoading={editLoading}
              submitLabel="Update Student"
            />
          </div>
        </div>
      )}

      {/* ── View Details Modal ── */}
      {viewStudent && (
        <div className="modal-backdrop" onClick={() => setViewStudent(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" style={{ background: 'var(--color-info-bg)', width: 56, height: 56 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-info)' }}>
                  {viewStudent.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="modal-title">{viewStudent.name}</h3>
                <span className="student-id-badge" style={{ fontSize: '0.75rem' }}>{viewStudent.studentId}</span>
              </div>
            </div>
            <div className="view-details-grid">
              {[
                ['Email',      viewStudent.email],
                ['Department', viewStudent.department],
                ['Semester',   `Semester ${viewStudent.semester}`],
                ['Attendance', `${viewStudent.attendance !== undefined ? viewStudent.attendance : 85}%`],
                ['Contact',    viewStudent.contact || '—'],
                ['Registered', new Date(viewStudent.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })],
              ].map(([label, val]) => (
                <div key={label} className="view-detail-row">
                  <span className="view-detail-label">{label}</span>
                  <span className="view-detail-value">{val}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setViewStudent(null)}>Close</button>
              <button className="btn btn-secondary" onClick={() => { setEditModal({ open: true, student: viewStudent }); setViewStudent(null); }}>Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;

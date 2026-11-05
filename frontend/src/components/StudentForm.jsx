import React, { useState, useEffect } from 'react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Commerce',
  'Arts',
  'Other',
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const INITIAL_FORM = {
  studentId: '',
  name: '',
  email: '',
  department: '',
  semester: '',
  contact: '',
};

/**
 * Reusable Student Form for both Add and Edit operations.
 * Props:
 *  - initialData: object (for edit mode) or null (for add mode)
 *  - onSubmit: async (formData) => void
 *  - onCancel: () => void
 *  - isLoading: boolean
 *  - submitLabel: string
 */
const StudentForm = ({ initialData = null, onSubmit, onCancel, isLoading = false, submitLabel = 'Save Student' }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Populate form in edit mode
  useEffect(() => {
    if (initialData) {
      setForm({
        studentId: initialData.studentId || '',
        name: initialData.name || '',
        email: initialData.email || '',
        department: initialData.department || '',
        semester: String(initialData.semester) || '',
        contact: initialData.contact || '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
    setTouched({});
  }, [initialData]);

  // ─── Validation ──────────────────────────────────────────────────
  const validate = (data) => {
    const errs = {};

    if (!data.studentId.trim()) {
      errs.studentId = 'Student ID is required.';
    } else if (!/^[A-Za-z0-9\-_]+$/.test(data.studentId)) {
      errs.studentId = 'Student ID may only contain letters, numbers, hyphens, and underscores.';
    }

    if (!data.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (data.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!data.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!data.department) {
      errs.department = 'Department is required.';
    }

    if (!data.semester) {
      errs.semester = 'Semester is required.';
    }

    if (data.contact && !/^[0-9+\-\s()]{7,15}$/.test(data.contact)) {
      errs.contact = 'Please enter a valid contact number (7–15 digits).';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    // Live validation for touched fields
    if (touched[name]) {
      const errs = validate(updated);
      setErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(form);
    setErrors((prev) => ({ ...prev, [name]: errs[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched = Object.keys(INITIAL_FORM).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const errs = validate(form);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    await onSubmit({
      ...form,
      studentId: form.studentId.toUpperCase().trim(),
      semester: parseInt(form.semester, 10),
    });
  };

  const Field = ({ name, label, required, children }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={`field-${name}`}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      {children}
      {touched[name] && errors[name] && (
        <span className="form-error" role="alert">⚠️ {errors[name]}</span>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <Field name="studentId" label="Student ID" required>
          <input
            id="field-studentId"
            name="studentId"
            type="text"
            className={`form-control ${touched.studentId && errors.studentId ? 'error' : ''}`}
            value={form.studentId}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. CS2024001"
            autoComplete="off"
            disabled={isLoading}
          />
        </Field>

        <Field name="name" label="Full Name" required>
          <input
            id="field-name"
            name="name"
            type="text"
            className={`form-control ${touched.name && errors.name ? 'error' : ''}`}
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Priya Sharma"
            autoComplete="name"
            disabled={isLoading}
          />
        </Field>

        <Field name="email" label="Email Address" required>
          <input
            id="field-email"
            name="email"
            type="email"
            className={`form-control ${touched.email && errors.email ? 'error' : ''}`}
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. priya@university.edu"
            autoComplete="email"
            disabled={isLoading}
          />
        </Field>

        <Field name="department" label="Department" required>
          <select
            id="field-department"
            name="department"
            className={`form-control ${touched.department && errors.department ? 'error' : ''}`}
            value={form.department}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
          >
            <option value="">— Select Department —</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>

        <Field name="semester" label="Semester" required>
          <select
            id="field-semester"
            name="semester"
            className={`form-control ${touched.semester && errors.semester ? 'error' : ''}`}
            value={form.semester}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
          >
            <option value="">— Select Semester —</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </Field>

        <Field name="contact" label="Contact Number">
          <input
            id="field-contact"
            name="contact"
            type="tel"
            className={`form-control ${touched.contact && errors.contact ? 'error' : ''}`}
            value={form.contact}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. +91 9876543210"
            autoComplete="tel"
            disabled={isLoading}
          />
        </Field>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button
            id="form-cancel-btn"
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          id="form-submit-btn"
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2.5 }} />
              Saving...
            </>
          ) : (
            <>💾 {submitLabel}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;

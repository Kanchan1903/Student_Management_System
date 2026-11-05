import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudent } from '../services/api';
import StudentForm from '../components/StudentForm';
import './AddStudent.css';

const AddStudent = ({ showNotification }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      const res = await createStudent(formData);
      showNotification('success', `Student "${res.data.data.name}" added successfully with ID ${res.data.data.studentId}!`);
      navigate('/students');
    } catch (err) {
      showNotification('error', err.message || 'Failed to create student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate('/students');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">➕ Add New Student</h1>
          <p className="page-subtitle">Fill in the details below to register a new student</p>
        </div>
      </div>

      <div className="add-student-layout">
        {/* Form Card */}
        <div className="card form-card">
          <div className="form-card-header">
            <div className="form-card-icon">🎓</div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Student Information</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Fields marked with <span style={{ color: 'var(--color-error)' }}>*</span> are required
              </p>
            </div>
          </div>
          <StudentForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel="Register Student"
          />
        </div>

        {/* Info Panel */}
        <div className="add-info-panel">
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', marginBottom: 'var(--space-4)' }}>📋 Guidelines</h3>
            <ul className="guidelines-list">
              <li>
                <span className="guide-icon">🆔</span>
                <div>
                  <strong>Student ID</strong>
                  <p>Must be unique across the system. Format: alphanumeric (e.g., CS2024001)</p>
                </div>
              </li>
              <li>
                <span className="guide-icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>Must be unique. Use university email format where applicable.</p>
                </div>
              </li>
              <li>
                <span className="guide-icon">🏛️</span>
                <div>
                  <strong>Department</strong>
                  <p>Select the student's enrolled department from the list.</p>
                </div>
              </li>
              <li>
                <span className="guide-icon">📅</span>
                <div>
                  <strong>Semester</strong>
                  <p>Select the current semester (1–8).</p>
                </div>
              </li>
              <li>
                <span className="guide-icon">📱</span>
                <div>
                  <strong>Contact</strong>
                  <p>Optional. Include country code for international numbers.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="card validation-card">
            <h3 style={{ fontSize: '0.95rem', marginBottom: 'var(--space-3)' }}>✅ Validation Rules</h3>
            <div className="validation-list">
              <div className="validation-item">
                <span className="val-dot val-required" />
                <span>Student ID must be unique</span>
              </div>
              <div className="validation-item">
                <span className="val-dot val-required" />
                <span>Email must be unique & valid format</span>
              </div>
              <div className="validation-item">
                <span className="val-dot val-optional" />
                <span>Contact number is optional</span>
              </div>
              <div className="validation-item">
                <span className="val-dot val-info" />
                <span>Both client & server validation applied</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;

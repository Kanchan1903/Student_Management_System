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
      </div>
    </div>
  );
};

export default AddStudent;

import React, { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';
import './Settings.css';

const PAGE_SIZES = [10, 25, 50, 100];

const Settings = ({ showNotification }) => {
  const [pageSize,    setPageSize]    = useState(
    () => parseInt(localStorage.getItem('edumanage_page_size') || '10', 10)
  );
  const [appName,     setAppName]     = useState(
    () => localStorage.getItem('edumanage_app_name') || 'EduManage'
  );
  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState(appName);
  const [health,      setHealth]      = useState({ status: 'checking', data: null });

  // Health check
  useEffect(() => {
    checkHealth()
      .then(res => setHealth({ status: 'online', data: res.data }))
      .catch(()  => setHealth({ status: 'offline', data: null }));
  }, []);

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    localStorage.setItem('edumanage_page_size', size);
    showNotification('success', `Default page size set to ${size} rows.`);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim() || 'EduManage';
    setAppName(trimmed);
    localStorage.setItem('edumanage_app_name', trimmed);
    setEditingName(false);
    showNotification('success', 'Application name updated.');
  };

  const handleClearStorage = () => {
    localStorage.removeItem('edumanage_page_size');
    localStorage.removeItem('edumanage_app_name');
    localStorage.removeItem('edumanage_sidebar_collapsed');
    setPageSize(10);
    setAppName('EduManage');
    setNameInput('EduManage');
    showNotification('info', 'Preferences reset to defaults.');
  };

  const recheckHealth = () => {
    setHealth({ status: 'checking', data: null });
    checkHealth()
      .then(res => setHealth({ status: 'online', data: res.data }))
      .catch(()  => setHealth({ status: 'offline', data: null }));
  };

  const healthColor = {
    online:   'var(--color-success)',
    offline:  'var(--color-error)',
    checking: 'var(--color-warning)',
  }[health.status];

  const healthLabel = {
    online: 'Online',
    offline: 'Offline',
    checking: 'Checking…',
  }[health.status];

  return (
    <div className="page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Application preferences and configuration</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* ── Left column ── */}
        <div className="settings-col">

          {/* Branding */}
          <div className="card settings-card animate-in">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <h3>Branding</h3>
            </div>

            <div className="settings-field">
              <label className="settings-label">Application Name</label>
              {editingName ? (
                <div className="settings-input-row">
                  <input
                    id="app-name-input"
                    className="form-control"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                    autoFocus
                    maxLength={32}
                    placeholder="EduManage"
                  />
                  <button id="save-name-btn" className="btn btn-primary btn-sm" onClick={handleSaveName}>Save</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingName(false)}>Cancel</button>
                </div>
              ) : (
                <div className="settings-value-row">
                  <span className="settings-value">{appName}</span>
                  <button id="edit-name-btn" className="btn btn-ghost btn-sm" onClick={() => { setNameInput(appName); setEditingName(true); }}>Edit</button>
                </div>
              )}
              <p className="settings-hint">Displayed in the browser title and sidebar branding.</p>
            </div>
          </div>

          {/* Table Preferences */}
          <div className="card settings-card animate-in">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
              </div>
              <h3>Table Preferences</h3>
            </div>
            <div className="settings-field">
              <label className="settings-label">Default Page Size</label>
              <div className="page-size-options">
                {PAGE_SIZES.map(size => (
                  <button
                    key={size}
                    id={`page-size-${size}`}
                    className={`page-size-option${pageSize === size ? ' active' : ''}`}
                    onClick={() => handlePageSizeChange(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="settings-hint">Number of student rows shown per page in the Students table.</p>
            </div>
          </div>

          {/* Reset */}
          <div className="card settings-card animate-in">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
              </div>
              <h3>Reset Preferences</h3>
            </div>
            <p className="settings-hint" style={{ marginBottom: 16 }}>
              Clear all locally stored preferences and reset to application defaults. This does not affect your MongoDB data.
            </p>
            <button id="reset-prefs-btn" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={handleClearStorage}>
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="settings-col">
          {/* API Health */}
          <div className="card settings-card animate-in">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: `${healthColor}18`, color: healthColor }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <h3>API Status</h3>
            </div>
            <div className="health-row">
              <div className="health-indicator">
                <span className="health-dot" style={{ background: healthColor }} />
                <span className="health-label" style={{ color: healthColor, fontWeight: 700 }}>{healthLabel}</span>
              </div>
              <button id="health-check-btn" className="btn btn-ghost btn-sm" onClick={recheckHealth}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
                Recheck
              </button>
            </div>
            {health.data && (
              <div className="health-meta">
                <div className="health-meta-row"><span>Environment</span><span>{health.data.environment}</span></div>
                <div className="health-meta-row"><span>Checked at</span><span>{new Date(health.data.timestamp).toLocaleTimeString()}</span></div>
              </div>
            )}
            {health.status === 'offline' && (
              <p className="settings-hint" style={{ color: 'var(--color-error)', marginTop: 12 }}>
                Cannot reach the backend. Ensure the server is running on port 5000.
              </p>
            )}
          </div>

          {/* About */}
          <div className="card settings-card animate-in">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3>About</h3>
            </div>
            <div className="about-list">
              {[
                ['Application',  'EduManage — Student Information Management System'],
                ['Version',      'v1.0.0'],
                ['Frontend',     'React 18 + Vite 5'],
                ['Backend',      'Node.js + Express.js'],
                ['Database',     'MongoDB Atlas'],
                ['Hosting',      'Netlify (Frontend) · Render (Backend)'],
              ].map(([label, value]) => (
                <div key={label} className="about-row">
                  <span className="about-label">{label}</span>
                  <span className="about-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import Departments from './pages/Departments';
import Semesters from './pages/Semesters';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

let notifCounter = 0;
const SIDEBAR_COLLAPSED_KEY = 'edumanage_sidebar_collapsed';

const App = () => {
  const [notifications, setNotifications] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed);
  }, [sidebarCollapsed]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  const showNotification = useCallback((type, message) => {
    const id = ++notifCounter;
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      <main className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        {/* ── Mobile Header ── */}
        <div className="mobile-header">
          <button
            className="btn btn-ghost"
            style={{ padding: '6px 10px' }}
            onClick={openMobileSidebar}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)' }}>
            EduManage
          </span>
        </div>

        {/* ── Top Header Matching UI Screenshot ── */}
        <header className="topbar">
          <div className="topbar-search">
            <svg
              className="topbar-search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="topbar-search-input"
              placeholder="Search students, departments, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="topbar-bell" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="topbar-bell-badge" />
            </div>

            <div className="topbar-user" onClick={() => navigate('/settings')}>
              <div className="topbar-user-avatar" style={{ background: '#ede5fc', color: '#7c3aed' }}>
                FC
              </div>
              <div className="topbar-user-info">
                <span className="topbar-user-name">Faculty Member</span>
                <span className="topbar-user-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Router View ── */}
        <div className="page-container">
          <Routes>
            <Route path="/"            element={<Dashboard    showNotification={showNotification} />} />
            <Route path="/students"    element={<Students     showNotification={showNotification} />} />
            <Route path="/add-student" element={<AddStudent   showNotification={showNotification} />} />
            <Route path="/departments" element={<Departments  showNotification={showNotification} />} />
            <Route path="/semesters"   element={<Semesters    showNotification={showNotification} />} />
            <Route path="/reports"     element={<Reports      showNotification={showNotification} />} />
            <Route path="/settings"    element={<Settings     showNotification={showNotification} />} />
            <Route
              path="*"
              element={
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                  <h2>Page Not Found</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>The requested page doesn't exist.</p>
                </div>
              }
            />
          </Routes>
        </div>
      </main>

      <Notification notifications={notifications} onRemove={removeNotification} />
    </div>
  );
};

export default App;

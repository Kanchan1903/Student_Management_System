import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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

  // Persist sidebar state
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

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      <main
        className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}
        style={{ transition: 'margin-left var(--transition-base)' }}
      >
        {/* ── Mobile Header ── */}
        <div className="mobile-header">
          <button
            id="mobile-menu-btn"
            className="btn btn-ghost btn-icon"
            onClick={openMobileSidebar}
            aria-label="Open navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EduManage
          </span>
        </div>

        {/* ── Page Content ── */}
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
                <div className="empty-state" style={{ paddingTop: '20vh' }}>
                  <div className="empty-state-icon">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </div>
                  <h3>Page Not Found</h3>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn btn-primary">Go to Dashboard</a>
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

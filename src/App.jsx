import React, { useState, useEffect } from 'react';
import { Layers, Sun, Moon, User, LogOut, ArrowLeftRight } from 'lucide-react';
import WorkRequestsPage from './pages/WorkRequestsPage';
import LoginPage from './pages/LoginPage';
import AuthModal from './components/AuthModal';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('auth-user', JSON.stringify(user));
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
  };

  if (!currentUser) {
    return (
      <LoginPage
        onAuthSuccess={handleAuthSuccess}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const isAdmin = currentUser.roles?.includes('Admin');

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-brand">
          <Layers size={22} className="brand-icon" />
          <span className="brand-text">Work Request Tracker</span>
        </div>
        <div className="navbar-user">
          <div className="user-badge-pill">
            <User size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span className="user-name-text">{currentUser.fullName || currentUser.email}</span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                fontWeight: 600,
                backgroundColor: isAdmin ? 'var(--purple-bg)' : 'var(--success-bg)',
                color: isAdmin ? 'var(--purple)' : 'var(--success)',
                border: `1px solid ${isAdmin ? 'var(--purple-border)' : 'var(--success-border)'}`,
                flexShrink: 0
              }}
            >
              {isAdmin ? 'Admin' : 'Staff'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm nav-action-btn"
            onClick={() => setIsAuthModalOpen(true)}
            title="Switch user account"
          >
            <ArrowLeftRight size={13} />
            <span className="nav-btn-text">Switch</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm nav-action-btn"
            onClick={handleSignOut}
            title="Sign out to login screen"
          >
            <LogOut size={13} />
            <span className="nav-btn-text">Sign Out</span>
          </button>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      <main>
        <WorkRequestsPage currentUser={currentUser} />
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

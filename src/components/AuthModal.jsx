import React, { useState } from 'react';
import { X, Shield, UserCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import { login, register } from '../api/workRequestsApi';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFillCredentials = (fillEmail, fillPassword) => {
    setEmail(fillEmail);
    setPassword(fillPassword);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }

    setSubmitting(true);
    try {
      let data;
      if (mode === 'login') {
        data = await login(email.trim(), password);
      } else {
        data = await register(email.trim(), password, fullName.trim());
      }

      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }

      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
              color: mode === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => { setMode('login'); setError(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid var(--primary)' : '2px solid transparent',
              color: mode === 'register' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => { setMode('register'); setError(null); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {mode === 'login' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Fill Demo Credentials
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleFillCredentials('admin@workrequest.local', 'Admin@123456!')}
                    disabled={submitting}
                    style={{ fontSize: '0.78rem', justifyContent: 'flex-start', padding: '0.5rem 0.65rem' }}
                    title="Fill Admin user credentials"
                  >
                    <Shield size={14} style={{ color: '#8b5cf6' }} />
                    Admin
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleFillCredentials('user@workrequest.local', 'User@123456!')}
                    disabled={submitting}
                    style={{ fontSize: '0.78rem', justifyContent: 'flex-start', padding: '0.5rem 0.65rem' }}
                    title="Fill Staff user credentials"
                  >
                    <UserCheck size={14} style={{ color: '#10b981' }} />
                    Staff User
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="error-banner" style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem' }}>
                <span>{error}</span>
              </div>
            )}

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <KeyRound size={15} />
              {submitting ? 'Authenticating...' : mode === 'login' ? 'Sign In with JWT' : 'Register & Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

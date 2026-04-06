import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, KeyRound, Lock, CalendarDays } from 'lucide-react';
import api from '../services/api';
import './Register.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    return strength === 0 ? 1 : strength;
  };

  const strengthLevel = getPasswordStrength(formData.password);
  const strengthLabels = ['NONE', 'WEAK', 'MEDIUM', 'STRONG'];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.otp || !formData.password || !formData.confirmPassword) {
      setError('Please fill all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (strengthLevel < 2) {
      setError('Please choose a stronger password.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.password,
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page dark-theme">
      <header className="auth-header">
        <div className="auth-brand">
          <CalendarDays className="logo-icon" size={24} />
          <span>Evenza</span>
        </div>
      </header>

      <div className="auth-card" style={{ maxWidth: '560px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div
            style={{
              background: 'linear-gradient(90deg, #d946ef, #fb7185)',
              width: '64px',
              height: '64px',
              borderRadius: '999px',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <KeyRound size={26} color="white" />
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-desc">Use your OTP and choose a new secure password.</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle color="#22c55e" size={46} />
            <p style={{ marginTop: '12px', color: '#cbd5e1' }}>Password reset successful. Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label>EMAIL</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="university@email.edu"
                required
              />
            </div>

            <div className="form-group">
              <label>OTP CODE</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label>NEW PASSWORD</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  required
                />
              </div>

              {formData.password && (
                <div className="password-strength-container">
                  <div className="strength-label">
                    STRENGTH: <span style={{ color: 'inherit', fontWeight: 'bold' }}>{strengthLabels[strengthLevel]}</span>
                  </div>
                  <div className="strength-bars">
                    <div className={`strength-bar ${strengthLevel >= 1 ? 'bar-red' : ''}`}></div>
                    <div className={`strength-bar ${strengthLevel >= 2 ? 'bar-yellow' : ''}`}></div>
                    <div className={`strength-bar ${strengthLevel >= 3 ? 'bar-green' : ''}`}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <button
          type="button"
          className="btn-nostyle"
          onClick={() => navigate('/login')}
          style={{ marginTop: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Back to Login
        </button>
      </div>
    </div>
  );
}

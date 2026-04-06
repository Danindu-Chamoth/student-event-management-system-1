import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CalendarDays } from 'lucide-react';
import api from '../services/api';
import './Login.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
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

      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <h1 className="auth-title text-center">Forgot Password</h1>
        <p className="auth-desc text-center">Enter your email to receive a 6-digit OTP.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form mt-8">
          <div className="form-group mb-6">
            <label>EMAIL ADDRESS</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="university@email.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'} <ArrowRight size={18} />
          </button>
        </form>

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

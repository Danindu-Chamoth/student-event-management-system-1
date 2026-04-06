import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;
      
      // Save auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Proceed to Landing Page
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page dark-theme">
      {/* Dynamic Header imitating the screenshot */}
      <header className="auth-header">
        <div className="auth-brand">
          <CalendarDays className="logo-icon" size={24} />
          <span>Evenza</span>
        </div>
      </header>

      <div className="auth-card">
        <h1 className="auth-title text-center">Welcome Back</h1>
        <p className="auth-desc text-center">Enter your credentials to access your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form mt-8">
          <div className="form-group mb-4">
            <label>EMAIL ADDRESS</label>
            <input 
              type="email" 
              name="email"
              placeholder="university@email.edu" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-6">
            <div className="flex-between">
              <label>PASSWORD</label>
              <button
                type="button"
                className="forgot-link btn-nostyle"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </button>
            </div>
            <div className="input-with-icon-right">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={handleTogglePassword}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Evenza'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR CONTINUE WITH</span>
        </div>

        <div className="sso-buttons">
          <button type="button" className="btn-sso">
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="sso-icon" />
             Google
          </button>
          <button type="button" className="btn-sso">
             <span className="sso-icon">🏛️</span>
             University SSO
          </button>
        </div>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>

      <footer className="auth-minimal-footer">
         <div className="brand">
            <CalendarDays size={18} className="logo-icon-small" /> Evenza
            <span className="copy">© 2024 Evenza University Events. All rights reserved.</span>
         </div>
         <div className="links">
           <a href="#privacy">Privacy Policy</a>
           <a href="#terms">Terms of Service</a>
           <a href="#help">Contact Support</a>
         </div>
      </footer>
    </div>
  );
}

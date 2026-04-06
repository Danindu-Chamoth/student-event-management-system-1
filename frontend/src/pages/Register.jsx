import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, User, Mail, Lock, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import api from '../services/api';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError(null);
    try {
      const { name, email, password, role } = formData;
      const response = await api.post('/auth/register', { name, email, password, role });
      
      alert(response.data.message || 'Registration successful! Please proceed to login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page dark-theme">
      <div className="auth-brand">
        <CalendarDays className="logo-icon" size={28} />
        <span>Evenza</span>
      </div>

      {/* Decorative center element seen in mockup background */}
      <div className="ambient-decorative">
         <div className="star-icon">✨</div>
      </div>

      <div className="auth-card">
        <h4 className="auth-subtitle">JOIN THE NEBULA</h4>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-desc">Sign up to explore and manage elite university events.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>FULL NAME</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                name="name"
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>EMAIL ADDRESS</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                name="email"
                placeholder="name@university.edu" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>PASSWORD</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group half">
              <label>CONFIRM PASSWORD</label>
              <div className="input-with-icon">
                <ShieldCheck className="input-icon" size={18} />
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>IDENTIFY AS</label>
            <div className="input-with-icon select-wrapper">
              <Users className="input-icon" size={18} />
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="select-input"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      <footer className="auth-footer-bar">
         <div className="brand">Evenza</div>
         <div className="links">
           <a href="#privacy">Privacy Policy</a>
           <a href="#terms">Terms of Service</a>
           <a href="#map">Campus Map</a>
           <a href="#help">Help Desk</a>
         </div>
         <div className="copy">© 2026 Evenza University Events. Step into the Nebula.</div>
      </footer>
    </div>
  );
}

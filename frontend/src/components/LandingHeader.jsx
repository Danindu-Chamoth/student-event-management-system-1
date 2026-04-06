import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, LogOut } from 'lucide-react';
import './LandingHeader.css';

export default function LandingHeader() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="landing-header">
      <div className="lh-logo">
        <CalendarDays className="logo-icon" size={24} />
        <span>Evenza</span>
      </div>
      <div className="lh-links">
        <a href="#home" className="active">HOME</a>
        <a href="#features">FEATURES</a>
        <a href="#about">ABOUT</a>
        <a href="#contact">CONTACT</a>
      </div>
      <div className="lh-actions">
        {user ? (
          <div className="user-profile">
            <span className="user-name">Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn-logout-icon" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn-login-outline">LOGIN</Link>
            <Link to="/register" className="btn-register-fill">REGISTER</Link>
          </>
        )}
      </div>
    </nav>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, LogOut, ChevronDown, User, Settings, Users } from 'lucide-react';
import './LandingHeader.css';

export default function LandingHeader() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
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

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          <div className="user-profile" ref={dropdownRef}>
            <button 
              className="user-link btn-nostyle" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img 
                src={user.profileImage && user.profileImage !== 'default-avatar.png'
                  ? (user.profileImage.startsWith('http') 
                      ? user.profileImage 
                      : `${import.meta.env.VITE_BACKEND_URL}/uploads/${user.profileImage}`)
                  : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=80'} 
                alt={user.name} 
                className="user-avatar-sm"
              />
              <span className="user-name">Hi, {user.name}</span>
              <ChevronDown size={14} className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`} color="#cbd5e1" />
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown animate-fade-in">
                <div className="dropdown-header">
                  <span className="dropdown-name">{user.name}</span>
                  <span className="dropdown-role">{user.role || 'Student'}</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-menu">
                  {user.role === 'admin' && (
                    <Link to="/admin/users" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <Users size={16} /> User Management
                    </Link>
                  )}
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> Dashboard
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Settings size={16} /> Profile Settings
                  </Link>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-menu">
                  <button onClick={handleLogout} className="dropdown-item text-danger">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
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

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, PlusCircle, Sun, Moon, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Theme logic
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Auth logic
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

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <CalendarDays className="logo-icon" />
          <span>Evenza</span>
        </Link>
        <div className="navbar-links">
          <button onClick={toggleTheme} className="btn-icon theme-toggle" aria-label="Toggle Theme">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user && (
            <div className="user-profile-nav">
              <Link to="/profile" className="user-link-nav">
                <img 
                  src={user.profileImage ? `${import.meta.env.VITE_BACKEND_URL}/uploads/${user.profileImage}` : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=80'} 
                  alt={user.name} 
                  className="user-avatar-nav"
                />
                <span className="user-name-nav">{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="btn-logout-nav" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          )}

          <Link to="/create" className="btn btn-primary btn-sm">
            <PlusCircle size={18} />
            Create Event
          </Link>
        </div>
      </div>
    </nav>
  );
}

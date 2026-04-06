import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, PlusCircle, Sun, Moon } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

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
          <Link to="/create" className="btn btn-primary btn-sm">
            <PlusCircle size={18} />
            Create Event
          </Link>
        </div>
      </div>
    </nav>
  );
}

import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import './LandingHeader.css';

export default function LandingHeader() {
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
         <Link to="/login" className="btn-login-outline">LOGIN</Link>
         <Link to="/register" className="btn-register-fill">REGISTER</Link>
      </div>
    </nav>
  );
}

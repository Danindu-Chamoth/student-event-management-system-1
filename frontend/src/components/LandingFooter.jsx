import { Link } from 'react-router-dom';
import { CalendarDays, Facebook, Instagram, Twitter, Linkedin, ChevronRight, Mail, Phone, MapPin } from 'lucide-react';
import './LandingFooter.css';

export default function LandingFooter() {
  return (
    <footer className="landing-footer-comp">
      <div className="lf-top">
        <div className="lf-col brand-col">
          <div className="lf-logo">
            <CalendarDays className="logo-icon" size={24} />
            <span className="text-gradient">Evenza</span>
          </div>
          <p className="brand-desc">Your all-in-one university event management platform. Streamlining campus life experiences.</p>
          <div className="lf-socials">
            <a href="#" className="social-icon"><Facebook size={18}/></a>
            <a href="#" className="social-icon"><Instagram size={18}/></a>
            <a href="#" className="social-icon"><Twitter size={18}/></a>
            <a href="#" className="social-icon"><Linkedin size={18}/></a>
          </div>
        </div>
        
        <div className="lf-col links-col">
          <h4 className="lf-heading">QUICK LINKS</h4>
          <div className="links-grid">
            <a href="#home"><ChevronRight size={16}/> Home</a>
            <a href="#features"><ChevronRight size={16}/> Features</a>
            <a href="#about"><ChevronRight size={16}/> About Us</a>
            <a href="#contact"><ChevronRight size={16}/> Contact</a>
            <Link to="/login"><ChevronRight size={16}/> Login</Link>
            <Link to="/register"><ChevronRight size={16}/> Register</Link>
          </div>
        </div>

        <div className="lf-col contact-col">
          <h4 className="lf-heading">CONTACT US</h4>
          <div className="contact-item">
            <div className="c-icon-wrap"><Mail size={18} /></div>
            <span>evenza@sliit.lk</span>
          </div>
          <div className="contact-item">
            <div className="c-icon-wrap"><Phone size={18} /></div>
            <span>+94 11 000 0000</span>
          </div>
          <div className="contact-item">
            <div className="c-icon-wrap"><MapPin size={18} /></div>
            <span>SLIIT, Malabe, Sri Lanka</span>
          </div>
        </div>
      </div>
      
      <div className="lf-bottom">
        <p>© 2026 EVENZA. ALL RIGHTS RESERVED.</p>
        <div className="lf-legal">
          <a href="#">PRIVACY POLICY</a>
          <a href="#">TERMS OF SERVICE</a>
        </div>
      </div>
    </footer>
  );
}

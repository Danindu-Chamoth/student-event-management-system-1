import { Link } from 'react-router-dom';
import { CalendarDays, ShieldCheck, Calendar, Ticket, LineChart, GraduationCap, Users } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing-page dark-theme">
      {/* Custom Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <CalendarDays className="logo-icon" size={24} />
          <span>Evenza</span>
        </div>
        <div className="landing-links">
          <a href="#home">HOME</a>
          <a href="#features">FEATURES</a>
          <a href="#about">ABOUT</a>
          <a href="#contact">CONTACT</a>
        </div>
        <div className="landing-actions">
           <Link to="/login" className="btn-login">LOGIN</Link>
           <Link to="/register" className="btn-register">REGISTER</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <p className="subtitle">UNIVERSITY EVENTS 2024</p>
          <h1 className="hero-title">
            Discover & Manage<br/>
            <span className="text-gradient">University</span><br/>
            Events
          </h1>
          <p className="hero-desc">
            Elevate student life with Evenza. The premium portal for discovering campus galas, technical symposiums, and cultural festivals through an immersive digital experience.
          </p>
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn-primary-lg">Get Started</Link>
            <a href="#features" className="btn-outline-lg">Learn More</a>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="floating-card c1">
            <div className="fc-image">
               <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=80&fit=crop" alt="Tech Summit" className="fc-img-content" />
            </div>
            <div className="fc-info">
              <h4>Annual Tech Summit</h4>
              <p>March 15, 2024 • 10:00 AM</p>
            </div>
          </div>
          <div className="floating-card c2">
             <div className="fc-image">
               <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&q=80&fit=crop" alt="Gala Night" className="fc-img-content" />
            </div>
            <div className="fc-info">
              <h4>Mega Gala Night</h4>
              <p>April 20, 2024 • 7:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-box">
          <h2>500+</h2>
          <p>STUDENTS</p>
        </div>
        <div className="stat-box">
          <h2>50+</h2>
          <p>EVENTS</p>
        </div>
        <div className="stat-box">
          <h2>20+</h2>
          <p>CATEGORIES</p>
        </div>
        <div className="stat-box">
          <h2>100%</h2>
          <p>SATISFACTION</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h4 className="section-subtitle">CORE ECOSYSTEM</h4>
          <h2 className="section-title">Why Choose <span className="text-gradient">Evenza</span>?</h2>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><ShieldCheck size={28} /></div>
            <h3>Secure Authentication</h3>
            <p>Enterprise-grade security using primary single sign-on integration. Keep students data private and secure.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Calendar size={28} /></div>
            <h3>Event Management</h3>
            <p>Create, manage, and schedule events with ease. Robust tools for organizers to handle everything from venues to vendors.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Ticket size={28} /></div>
            <h3>Instant Registration</h3>
            <p>Frictionless sign-ups with digital QR tickets sent directly to the student's mobile wallet for easy check-in.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><LineChart size={28} /></div>
            <h3>Advanced Analytics</h3>
            <p>Deep insights into student engagement and attendance patterns. Data-driven decisions for future campus events.</p>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="journey-section">
        <div className="section-header">
          <h4 className="section-subtitle">THE JOURNEY</h4>
        </div>
        <div className="journey-timeline">
           <div className="journey-step">
             <div className="step-number gradient-circle">01</div>
             <h3>Create Account</h3>
             <p>Sign up in minutes. Verify email to unlock exclusive access to all campus happenings.</p>
           </div>
           <div className="journey-line"></div>
           <div className="journey-step">
             <div className="step-number gradient-circle">02</div>
             <h3>Explore Events</h3>
             <p>Browse through our curated list of events by online, and environmental general filters.</p>
           </div>
           <div className="journey-line"></div>
           <div className="journey-step">
             <div className="step-number gradient-circle">03</div>
             <h3>Attend & Enjoy</h3>
             <p>Have your digital pass scanned and immerse yourself in an incredible experience.</p>
           </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="role-card">
          <div className="role-header">
            <GraduationCap size={40} className="role-icon" />
            <h2>For Students</h2>
          </div>
          <ul className="role-features">
             <li><ShieldCheck size={16}/> Personalized event dashboard</li>
             <li><ShieldCheck size={16}/> Mobile-ready QR ticket entry</li>
             <li><ShieldCheck size={16}/> Direct RSVP and notification alerts</li>
          </ul>
          <Link to="/dashboard" className="role-btn pink-btn">Student Portal</Link>
        </div>
        <div className="role-card">
          <div className="role-header">
            <Users size={40} className="role-icon-alt" />
            <h2>For Admins</h2>
          </div>
           <ul className="role-features">
             <li><ShieldCheck size={16}/> Real-time attendance tracking</li>
             <li><ShieldCheck size={16}/> Automated approval workflows</li>
             <li><ShieldCheck size={16}/> Comprehensive reporting suite</li>
          </ul>
          <Link to="/dashboard" className="role-btn dark-btn">Admin Console</Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of students and faculty members in shaping the future of university event management.</p>
          <Link to="/register" className="btn-register-dark">Register Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="about">
        <div className="footer-col brand-col">
          <div className="landing-logo">
            <CalendarDays className="logo-icon" size={24} />
            <span>Evenza</span>
          </div>
          <p>Revolutionizing university engagement through cutting-edge technology and immersive user experiences.</p>
        </div>
        <div className="footer-col" id="contact">
          <h4>Quick Links</h4>
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Privacy Policy</a>
        </div>
         <div className="footer-col">
          <h4>Support</h4>
          <a href="#">Documentation</a>
          <a href="#">Help Center</a>
          <a href="#">API Status</a>
          <a href="#">Terms of Service</a>
        </div>
        <div className="footer-col">
          <h4>Contact Us</h4>
          <p className="contact-item">✉ info@evenza.edu</p>
          <p className="contact-item">📞 +1 (555) EVENT-2024</p>
          <p className="contact-item">📍 University Innovation Lab</p>
        </div>
      </footer>
      
      <div className="footer-bottom">
         <p>© 2024 Evenza University. All rights reserved.</p>
         <div className="social-links">
           <a href="#">Twitter</a>
           <a href="#">Insta</a>
         </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, ShieldCheck, Mail, ArrowLeft, 
  MapPin, Globe, Twitter, Github, Linkedin, CalendarDays 
} from 'lucide-react';
import api from '../services/api';
import './PublicProfile.css';

export default function PublicProfile() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/public/${id}`);
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching public profile:', err);
      setError(err.response?.data?.message || 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading Profile...</div>;
  
  if (error) {
    return (
      <div className="error-page">
        <div className="error-container glass-panel">
          <h1>Oops!</h1>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const profileImageUrl = user?.profileImage && user.profileImage !== 'default-avatar.png'
    ? (user.profileImage.startsWith('http') 
        ? user.profileImage 
        : `${import.meta.env.VITE_BACKEND_URL}/uploads/${user.profileImage}`)
    : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80';

  return (
    <div className="public-profile-page animate-fade-in">
      <div className="container">
        {/* Navigation / Actions */}
        <div className="profile-nav-top">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} />
            <span>Back to Discovery</span>
          </Link>
        </div>

        <div className="public-profile-container">
          {/* Main User Card */}
          <div className="user-hero-card glass-panel">
            <div className="user-hero-content">
              <div className="public-avatar-wrapper">
                <img src={profileImageUrl} alt={user.name} className="public-avatar" />
                <div className="avatar-ring"></div>
              </div>

              <div className="user-header-info">
                <div className="name-badge-row">
                  <h1 className="public-name">{user.name}</h1>
                  <div className="badge-group">
                    <span className="badge badge-student">{user.role || 'STUDENT'}</span>
                    <span className="badge badge-active">{user.status || 'ACTIVE'}</span>
                  </div>
                </div>
                
                <p className="public-bio">{user.bio || 'This user has not shared a bio yet.'}</p>
                
                <div className="user-meta-tags">
                   <div className="meta-tag">
                      <CalendarDays size={16} />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="meta-tag">
                      <ShieldCheck size={16} className="text-accent-primary" />
                      <span>University Verified</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="user-actions-row">
               <button className="btn btn-primary">Follow User</button>
               <button className="btn btn-outline">Message</button>
            </div>
          </div>

          <div className="profile-grid-sub">
            {/* Stats Sidebar */}
            <div className="sidebar-stats glass-panel">
               <h3>Impact Metrics</h3>
               <div className="stats-list">
                  <div className="public-stat-item">
                     <span className="stat-num">12</span>
                     <span className="stat-label">Events Joined</span>
                  </div>
                  <div className="public-stat-item">
                     <span className="stat-num">4</span>
                     <span className="stat-label">Events Organized</span>
                  </div>
                  <div className="public-stat-item">
                     <span className="stat-num">152</span>
                     <span className="stat-label">Community Points</span>
                  </div>
               </div>

               <div className="social-links-grid">
                  <a href="#" className="social-icon-btn"><Twitter size={20} /></a>
                  <a href="#" className="social-icon-btn"><Github size={20} /></a>
                  <a href="#" className="social-icon-btn"><Linkedin size={20} /></a>
                  <a href="#" className="social-icon-btn"><Globe size={20} /></a>
               </div>
            </div>

            {/* User Activity / About */}
            <div className="main-info-column glass-panel">
               <section className="about-section">
                  <h3>About {user.name.split(' ')[0]}</h3>
                  <p>
                     A dedicated member of the Evenza University community since {new Date(user.createdAt).getFullYear()}. 
                     Passionately involved in shaping campus culture through active participation in technical and cultural events.
                  </p>
               </section>

               <section className="event-history-preview">
                  <h3>Recent Activity</h3>
                  <div className="activity-placeholder">
                     <div className="placeholder-item">
                        <div className="p-dot"></div>
                        <div className="p-line">Joined <b>Annual Tech Summit</b></div>
                     </div>
                     <div className="placeholder-item">
                        <div className="p-dot"></div>
                        <div className="p-line">RSVP'd for <b>Gala Night 2024</b></div>
                     </div>
                     <div className="placeholder-item">
                        <div className="p-dot"></div>
                        <div className="p-line">Commented on <b>Career Fair Discussion</b></div>
                     </div>
                  </div>
               </section>

               <div className="join-cta">
                  <h4>Planning an event?</h4>
                  <p>Invite {user.name} to collaborate or attend your upcoming symposia.</p>
                  <Link to="/register" className="btn btn-primary btn-sm mt-4">Join Evenza Today</Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

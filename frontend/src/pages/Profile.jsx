import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Camera, ShieldCheck, Lock, 
  Trash2, AlertTriangle, CheckCircle2, ChevronRight, Send 
} from 'lucide-react';
import api from '../services/api';
import './Profile.css';

export default function Profile({ defaultTab = 'overview' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      const user = response.data;
      setUserData(user);
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch('/users/profile', profileForm);
      setUserData(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      window.location.reload(); // Refresh to update all headers
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed.' });
    }
  };

  // Send OTP to user's email for password change
  const handleSendOtp = async () => {
    try {
      setOtpLoading(true);
      await api.post('/users/send-password-otp');
      setOtpSent(true);
      setMessage({ type: 'success', text: 'OTP sent to your email address!' });
      // Start 60s cooldown
      setOtpCountdown(60);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send OTP.' });
    } finally {
      setOtpLoading(false);
    }
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match.' });
    }
    if (passwordForm.newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
    }
    try {
      await api.patch('/users/update-password', {
        otp: passwordForm.otp,
        newPassword: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ otp: '', newPassword: '', confirmPassword: '' });
      setOtpSent(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Password update failed.' });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await api.patch('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUserData(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage({ type: 'success', text: 'Profile picture updated!' });
      window.location.reload();
    } catch (error) {
      setMessage({ type: 'error', text: 'Image upload failed.' });
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? This action cannot be undone easily.')) return;
    try {
      await api.patch('/users/deactivate-profile');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      setMessage({ type: 'error', text: 'Deactivation failed.' });
    }
  };

  if (loading) return (
    <div className="loading-screen glass-panel">
      <div className="loader"></div>
      <p>Loading Profile...</p>
    </div>
  );

  if (!userData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const profileImageUrl = userData?.profileImage && userData.profileImage !== 'default-avatar.png'
    ? (userData.profileImage.startsWith('http') 
        ? userData.profileImage 
        : `${import.meta.env.VITE_BACKEND_URL}/uploads/${userData.profileImage}`)
    : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80';

  return (
    <div className="profile-page">
      <div className="container profile-container">
        
        {/* Navigation Return */}
        <div style={{ padding: '2rem 0 1rem', width: '100%', gridColumn: '1 / -1' }}>
          <Link to="/" className="back-link btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', border: 'none', background: 'transparent' }}>
            <ChevronRight style={{ transform: 'rotate(180deg)' }} size={18} />
            Back to Home Page
          </Link>
        </div>

        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-card glass-panel animate-fade-in">
            <div className="avatar-wrapper">
              <img src={profileImageUrl} alt={userData?.name} className="profile-avatar" />
              <label htmlFor="avatar-upload" className="upload-btn" title="Change Photo">
                <Camera size={18} />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  hidden 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            
            <h1 className="profile-name">{userData?.name}</h1>
            <div className="badge-group">
              <span className="badge badge-student">{userData?.role || 'STUDENT'}</span>
              <span className="badge badge-active">{userData?.status || 'ACTIVE'}</span>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">Last login</span>
                <span className="stat-value">{formatDate(userData?.lastLogin)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Member since</span>
                <span className="stat-value">{formatDate(userData?.createdAt)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Events Joined</span>
                <span className="stat-value">12</span>
              </div>
            </div>

            <div className="profile-nav-tabs">
              <button 
                className={`nav-tab-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <User size={18} /> Profile Overview
              </button>
              <button 
                className={`nav-tab-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Lock size={18} /> Account Settings
              </button>
            </div>

            <Link to={`/profile/${userData?._id}`} className="btn btn-outline w-full decoration-none" style={{ marginTop: '1rem' }}>
              View Public Profile
            </Link>
          </div>

          <div className="verification-card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3><ShieldCheck size={20} className="text-accent-primary" /> University Verified</h3>
            <p>Your account is linked with Evenza University academic records.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-main">
          {message.text && (
            <div className={`message-banner ${message.type}`}>
               {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
               {message.text}
            </div>
          )}

          {activeTab === 'overview' ? (
            <div className="animate-fade-in">
              <section className="profile-section glass-panel">
                <div className="section-header">
                  <User className="section-icon" size={24} />
                  <h2>Profile Overview</h2>
                </div>
                
                <div className="overview-grid">
                  <div className="overview-item">
                    <label>Full Name</label>
                    <p>{userData.name}</p>
                  </div>
                  <div className="overview-item">
                    <label>Email Address</label>
                    <p>{userData.email}</p>
                  </div>
                  <div className="overview-item">
                    <label>Account Role</label>
                    <p style={{ textTransform: 'capitalize' }}>{userData.role}</p>
                  </div>
                  <div className="overview-item">
                    <label>Bio</label>
                    <p className="bio-text">{userData.bio || "No bio provided yet."}</p>
                  </div>
                </div>
              </section>

              <div className="overview-cards">
                <div className="stats-mini-card glass-panel">
                  <span className="mini-label">Events Joined</span>
                  <span className="mini-value">12</span>
                </div>
                <div className="stats-mini-card glass-panel">
                  <span className="mini-label">Trust Score</span>
                  <span className="mini-value">98%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Edit Profile Section */}
              <section className="profile-section glass-panel">
                <div className="section-header">
                  <User className="section-icon" size={24} />
                  <h2>Edit Profile</h2>
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">FULL NAME</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">EMAIL ADDRESS</label>
                      <input 
                        type="email" 
                        className="input-field" 
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">BIO</label>
                    <textarea 
                      className="input-field" 
                      rows="4"
                      placeholder="Tell us about yourself..."
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="section-footer">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </section>

              {/* Change Password Section */}
              <section className="profile-section glass-panel">
                <div className="section-header">
                  <Lock className="section-icon" size={24} />
                  <h2>Change Password</h2>
                </div>

                {!otpSent ? (
                  <div className="otp-request-box">
                    <div className="otp-info">
                      <Mail size={20} className="text-accent-primary" />
                      <div>
                        <p style={{ color: 'var(--text-main)', fontWeight: 500, marginBottom: '0.25rem' }}>Email Verification Required</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>We'll send a 6-digit OTP to <strong style={{ color: 'var(--accent-primary)' }}>{userData?.email}</strong> to verify your identity before changing your password.</p>
                      </div>
                    </div>
                    <div className="section-footer">
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <Send size={16} />
                        {otpLoading ? 'Sending...' : 'Send OTP to Email'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordUpdate}>
                    <div className="otp-sent-banner">
                      <CheckCircle2 size={18} />
                      <span>OTP sent to <strong>{userData?.email}</strong>. Check your inbox.</span>
                    </div>

                    <div className="input-group">
                      <label className="input-label">ENTER OTP</label>
                      <input 
                        type="text" 
                        className="input-field otp-input-field" 
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={passwordForm.otp}
                        onChange={(e) => setPasswordForm({...passwordForm, otp: e.target.value.replace(/\D/g, '')})}
                        required
                        autoFocus
                        style={{ letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center', maxWidth: '280px' }}
                      />
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {otpCountdown > 0 ? (
                          <span>Resend OTP in <strong style={{ color: 'var(--accent-primary)' }}>{otpCountdown}s</strong></span>
                        ) : (
                          <button type="button" onClick={handleSendOtp} disabled={otpLoading} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: 0, fontWeight: 600, fontSize: '0.8rem' }}>
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-group">
                        <label className="input-label">NEW PASSWORD</label>
                        <input 
                          type="password" 
                          className="input-field" 
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">CONFIRM NEW PASSWORD</label>
                        <input 
                          type="password" 
                          className="input-field" 
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="section-footer" style={{ gap: '1rem' }}>
                      <button 
                        type="button" 
                        className="btn btn-outline"
                        onClick={() => { setOtpSent(false); setPasswordForm({ otp: '', newPassword: '', confirmPassword: '' }); }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Update Password</button>
                    </div>
                  </form>
                )}
              </section>

              {/* Deactivate Section */}
              <section className="profile-section glass-panel">
                <div className="deactivate-box">
                  <div className="deactivate-info">
                    <h3>Deactivate Account</h3>
                    <p>Temporarily disable your profile and event history.</p>
                  </div>
                  <button 
                    onClick={handleDeactivate} 
                    className="btn btn-danger"
                  >
                    Deactivate
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

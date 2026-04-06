import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, XCircle } from 'lucide-react';
import api from '../services/api';
import './VerifyEmail.css';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`);
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed. The link may have expired.');
        setSuccess(false);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <div className="verify-page dark-theme">
      <div className="verify-brand">
        <span className="brand-logo">Evenza</span>
      </div>

      <div className="verify-card verified-card">
        {verifying ? (
          <div className="verifying-state">
            <div className="loader"></div>
            <h2>Verifying your email...</h2>
          </div>
        ) : success ? (
          <>
            <div className="icon-circle success-icon">
              <Check size={40} color="#fff" strokeWidth={3} />
            </div>
            <h1 className="verify-title">Email Verified<br/>Successfully</h1>
            <p className="verify-desc">
              Your email has been confirmed. You can<br/>
              now access all features of the Evenza<br/>
              platform.
            </p>

            <button 
              className="btn-dashboard" 
              onClick={() => navigate('/login')}
            >
              Go to Dashboard <span className="arrow">→</span>
            </button>

            <a href="#support" className="back-link help-link">
              Need help? Contact support
            </a>
          </>
        ) : (
          <>
            <div className="icon-circle error-icon">
              <XCircle size={40} color="#fff" strokeWidth={2} />
            </div>
            <h1 className="verify-title">Verification Failed</h1>
            <p className="verify-desc">
              {error}
            </p>
            <button 
              className="btn-dashboard" 
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </>
        )}
      </div>

      <footer className="verify-footer">
        <div className="copy">© 2026 EVENZA. THE DIGITAL GALA FOR UNIVERSITY LIFE.</div>
      </footer>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import api from '../services/api';
import './VerifyEmailInfo.css';

export default function VerifyEmailInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus the first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Allow only one character per box
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if there is a value
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      // Move focus to previous input on backspace if current is empty
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(isNaN)) return;

    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(val => val === '');
    const targetIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    if (inputRefs.current[targetIndex]) {
      inputRefs.current[targetIndex].focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of your OTP.');
      return;
    }

    if (!email) {
      setError('Email address not found. Please try registering again.');
      return;
    }

    setVerifying(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/verify-otp', { email, otp: otpString });
      setMessage('Email verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check your code and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email address not found. Please try registering again.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');
    setOtp(['', '', '', '', '', '']); // Clear current OTP
    if(inputRefs.current[0]) inputRefs.current[0].focus(); // Focus first input
    
    try {
      await api.post('/auth/resend-verification', { email });
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page dark-theme">
      <div className="verify-brand">
        <span className="brand-logo">Evenza</span>
      </div>

      <div className="verify-card otp-card">
        <div className="icon-circle">
          <Mail size={32} color="white" />
        </div>
        <h1 className="verify-title">Verify Your Email</h1>
        <p className="verify-desc">
          We sent a 6-digit code to your email address.<br/>
          Please enter it below to activate your account.
        </p>

        {message && <div className="verify-message success">{message}</div>}
        {error && <div className="verify-message error">{error}</div>}

        <form onSubmit={handleVerify} className="otp-form">
          <div className="otp-input-container">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                name={`otp-${index}`}
                maxLength="1"
                className="otp-input"
                value={data}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el)}
                disabled={verifying}
              />
            ))}
          </div>

          <button 
            type="submit"
            className="btn-verify" 
            disabled={verifying || otp.join('').length !== 6}
          >
            {verifying ? 'VERIFYING...' : 'VERIFY OTP'}
          </button>
        </form>

        <div className="resend-container">
          <p className="resend-text">Didn't receive the code?</p>
          <button 
            className="btn-text-resend" 
            onClick={handleResend}
            disabled={loading || !email || verifying}
          >
            {loading ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        <Link to="/login" className="back-link">
          Back to Login
        </Link>
      </div>

      <footer className="verify-footer">
        <div className="copy">© 2026 Evenza. The Digital Gala for University Life.</div>
        <div className="links">
          <a href="#support">Support</a>
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
        </div>
      </footer>
    </div>
  );
}

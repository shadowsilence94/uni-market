import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE } from '../config';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/verify-email/${token}`);
      setStatus('success');
      setMessage(response.data.message);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    if (!resendEmail) {
      alert('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/resend-verification`, { email: resendEmail });
      alert(response.data.message);
      setResendEmail('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <div className="admin-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <div className="spinner" style={{ margin: '2rem auto' }}></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              Verifying your email...
            </h2>
            <p style={{ color: '#6b7280' }}>
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a5f3f', marginBottom: '1rem' }}>
              Email Verified!
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {message}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Redirecting you to the homepage...
            </p>
            <Link 
              to="/" 
              className="btn btn-primary" 
              style={{ marginTop: '1rem', display: 'inline-block' }}
            >
              Go to Homepage
            </Link>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
              Verification Failed
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {message}
            </p>

            {/* Resend Verification */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Resend Verification Email
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="btn btn-primary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {resending ? 'Sending...' : 'Resend'}
                </button>
              </div>
            </div>

            <Link 
              to="/" 
              className="btn" 
              style={{ 
                marginTop: '1rem', 
                display: 'inline-block',
                background: '#e5e7eb',
                color: '#1f2937'
              }}
            >
              Back to Homepage
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EmailVerification;

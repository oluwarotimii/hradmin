import { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { forgotPassword } from '../services/userManagementService';

interface ForgotPasswordViewProps {
  onBack: () => void;
}

export function ForgotPasswordView({ onBack }: ForgotPasswordViewProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setMessage('If the email exists, a password reset link has been sent.');
      } else {
        setError(res.message || 'Failed to send reset link');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '420px',
        borderTop: '4px solid #1e40af'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '0.75rem',
            background: '#1e40af',
            marginBottom: '1rem'
          }}>
            <Mail style={{ color: '#ffffff', width: '1.5rem', height: '1.5rem' }} />
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '0.375rem',
            letterSpacing: '-0.025em'
          }}>
            Reset Password
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Enter your email to receive a reset link
          </p>
        </div>

        {message && (
          <div style={{
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            padding: '0.75rem 0.875rem',
            borderRadius: '0.5rem',
            fontSize: '0.813rem',
            marginBottom: '1rem',
            border: '1px solid #bbf7d0'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '0.625rem 0.875rem',
            borderRadius: '0.5rem',
            fontSize: '0.813rem',
            marginBottom: '1rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.813rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.375rem',
                letterSpacing: '0.01em'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '0.688rem 0.875rem',
                  border: error ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = error ? '#ef4444' : '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: loading ? '#60a5fa' : '#1e40af',
                color: '#ffffff',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
                letterSpacing: '0.01em',
                marginBottom: '1rem'
              }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: 0
            }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
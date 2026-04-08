import { useState } from "react";
import { login } from "../services/authService";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError("");

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email address is invalid");
      isValid = false;
    }

    // Validate password
    if (!password) {
      setError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        // Enforce dashboard permissions
        const userInfoStr = localStorage.getItem('userInfo');
        const userPermsStr = localStorage.getItem('userPermissions');
        let hasAccess = false;
        
        if (userInfoStr) {
           try {
             const user = JSON.parse(userInfoStr);
             const roleId = user.roleId || user.role_id;
             if (roleId === 1 || user.has_dashboard_access) {
                hasAccess = true;
             }
           } catch(e) {}
        }
        
        if (userPermsStr) {
           try {
             const perms = JSON.parse(userPermsStr);
             if (Array.isArray(perms)) {
                if (perms.includes('*') || perms.includes('dashboard:access')) hasAccess = true;
             } else {
                if (perms['*'] || perms['dashboard:access']) hasAccess = true;
             }
           } catch(e) {}
        }
        
        if (!hasAccess) {
           import('../services/authService').then(m => m.logout());
           setError("Unable to login: You lack the necessary permissions to access the HR Admin Dashboard.");
           setLoading(false);
           return;
        }

        onLogin();
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during login.");
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
            <span style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 700 }}>F</span>
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '0.375rem',
            letterSpacing: '-0.025em'
          }}>
            Femtech HR
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Admin Dashboard
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(e);
          }}
          style={{ width: '100%' }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.813rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.375rem',
              letterSpacing: '0.01em'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="you@company.com"
              style={{
                width: '100%',
                padding: '0.688rem 0.875rem',
                border: emailError ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = emailError ? '#ef4444' : '#3b82f6';
                target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = emailError ? '#ef4444' : '#e2e8f0';
                target.style.boxShadow = 'none';
              }}
              required
              disabled={loading}
              autoComplete="username"
            />
            {emailError && (
              <p style={{
                color: '#dc2626',
                fontSize: '0.75rem',
                marginTop: '0.375rem',
                marginBottom: 0
              }}>
                {emailError}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.813rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.375rem',
              letterSpacing: '0.01em'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '0.688rem 0.875rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#3b82f6';
                target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#e2e8f0';
                target.style.boxShadow = 'none';
              }}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

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
              transition: 'background-color 0.15s, transform 0.1s',
              opacity: loading ? 0.8 : 1,
              letterSpacing: '0.01em'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1e3a8a';
              }
            }}
            onMouseOut={(e) => {
                if (!loading) {
                (e.target as HTMLButtonElement).style.backgroundColor = loading ? '#60a5fa' : '#1e40af';
              }
            }}
            onMouseDown={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.transform = 'scale(0.98)';
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.transform = 'scale(1)';
              }
            }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

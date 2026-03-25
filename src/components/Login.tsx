import { useState } from "react";
import { login } from "../services/authService";
import { Shield, Mail, Lock, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
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
        await onLogin();
      } else {
        setError(result.message || "Invalid email or password. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Color palette
  const colors = {
    primary: '#4f46e5',
    primaryDark: '#4338ca',
    primaryLight: '#6366f1',
    secondary: '#0ea5e9',
    background: {
      start: '#f8fafc',
      middle: '#eff6ff',
      end: '#e0e7ff'
    },
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      muted: '#94a3b8'
    },
    error: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#dc2626'
    },
    success: {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      text: '#16a34a'
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      background: `linear-gradient(135deg, ${colors.background.start} 0%, ${colors.background.middle} 50%, ${colors.background.end} 100%)`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    leftPanel: {
      display: 'none',
      width: '50%',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      position: 'relative',
      overflow: 'hidden',
      padding: '4rem'
    },
    leftPanelContent: {
      position: 'relative',
      zIndex: 10,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      color: '#ffffff'
    },
    logoBox: {
      width: '80px',
      height: '80px',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '3rem',
      fontWeight: '700',
      marginBottom: '0.75rem',
      lineHeight: '1.2'
    },
    subtitle: {
      fontSize: '1.25rem',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '2.5rem',
      lineHeight: '1.6'
    },
    featureList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.95)'
    },
    featureIcon: {
      width: '28px',
      height: '28px',
      background: 'rgba(255, 255, 255, 0.25)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    },
    loginContainer: {
      width: '100%',
      maxWidth: '460px'
    },
    mobileLogo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '2rem',
      justifyContent: 'center'
    },
    mobileLogoBox: {
      width: '56px',
      height: '56px',
      background: colors.primary,
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    mobileTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: colors.text.primary
    },
    card: {
      background: '#ffffff',
      borderRadius: '24px',
      padding: '3rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
    },
    cardHeader: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    cardTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: '0.5rem'
    },
    cardSubtitle: {
      fontSize: '1rem',
      color: colors.text.secondary
    },
    errorAlert: {
      marginBottom: '1.5rem',
      padding: '1rem',
      background: colors.error.bg,
      border: `1px solid ${colors.error.border}`,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem'
    },
    errorText: {
      flex: 1
    },
    errorTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: colors.error.text,
      marginBottom: '0.25rem'
    },
    errorMessage: {
      fontSize: '0.875rem',
      color: colors.error.text,
      opacity: 0.9
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: '0.5rem'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem 0.875rem 3rem',
      background: '#f8fafc',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '1rem',
      color: colors.text.primary,
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: colors.text.muted,
      pointerEvents: 'none' as const
    },
    fieldError: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
      fontSize: '0.875rem',
      color: colors.error.text,
      marginTop: '0.5rem'
    },
    submitButton: {
      width: '100%',
      padding: '1rem',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
      transition: 'all 0.2s ease',
      opacity: loading ? 0.8 : 1,
      transform: loading ? 'none' : 'scale(1)',
    },
    cardFooter: {
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #f1f5f9',
      textAlign: 'center' as const
    },
    footerText: {
      fontSize: '0.875rem',
      color: colors.text.muted
    },
    copyright: {
      textAlign: 'center' as const,
      fontSize: '0.875rem',
      color: colors.text.muted,
      marginTop: '2rem'
    },
    decorativeCircle1: {
      position: 'absolute' as const,
      top: '80px',
      left: '80px',
      width: '288px',
      height: '288px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      filter: 'blur(40px)'
    },
    decorativeCircle2: {
      position: 'absolute' as const,
      bottom: '80px',
      right: '80px',
      width: '384px',
      height: '384px',
      background: 'rgba(14, 165, 233, 0.15)',
      borderRadius: '50%',
      filter: 'blur(40px)'
    }
  };

  const features = [
    "Real-time attendance tracking",
    "Automated shift scheduling",
    "Leave management & approvals",
    "Performance analytics & reports"
  ];

  return (
    <div style={styles.container}>
      {/* Left Panel - Desktop Only */}
      <div style={{
        ...styles.leftPanel,
        display: 'none',
        '@media (min-width: 1024px)': { display: 'block' }
      }}>
        <style>
          {`
            @media (min-width: 1024px) {
              .left-panel { display: block !important; }
            }
          `}
        </style>
        <div style={styles.decorativeCircle1} />
        <div style={styles.decorativeCircle2} />
        <div style={styles.leftPanelContent}>
          <div style={styles.logoBox}>
            <Shield size={48} color="#ffffff" />
          </div>
          <h1 style={styles.title}>
            Welcome to<br />
            <span style={{ opacity: 0.9 }}>Femtech Human Resource</span>
          </h1>
          <p style={styles.subtitle}>
            Streamline your workforce management with our comprehensive HR solution.
            Manage attendance, shifts, leave, and more - all in one place.
          </p>
          <div style={styles.featureList}>
            {features.map((feature, index) => (
              <div key={index} style={styles.featureItem}>
                <div style={styles.featureIcon}>
                  <CheckCircle size={16} color="#ffffff" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={styles.rightPanel}>
        <div style={styles.loginContainer}>
          {/* Mobile Logo */}
          <div style={styles.mobileLogo}>
            <h1 style={styles.mobileTitle}>Femtech Human Resource</h1>
          </div>

          {/* Login Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Sign In</h2>
              <p style={styles.cardSubtitle}>Enter your credentials to access your account</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div style={styles.errorAlert}>
                <AlertCircle size={20} color={colors.error.text} style={{ flexShrink: 0 }} />
                <div style={styles.errorText}>
                  <p style={styles.errorTitle}>Authentication Error</p>
                  <p style={styles.errorMessage}>{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form style={styles.form} onSubmit={handleSubmit}>
              {/* Email Field */}
              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>
                  <Mail size={16} color={colors.text.muted} />
                  Email Address
                </label>
                <div style={styles.inputWrapper}>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    style={{
                      ...styles.input,
                      borderColor: emailError ? colors.error.border : '#e2e8f0',
                      background: emailError ? colors.error.bg : '#f8fafc'
                    }}
                    placeholder="you@company.com"
                    autoComplete="username"
                    disabled={loading}
                    onFocus={(e) => {
                      if (!emailError) {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = `0 0 0 4px rgba(79, 70, 229, 0.1)`;
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = emailError ? colors.error.border : '#e2e8f0';
                      e.target.style.background = emailError ? colors.error.bg : '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={styles.inputIcon}>
                    <Mail size={20} />
                  </div>
                </div>
                {emailError && (
                  <p style={styles.fieldError}>
                    <AlertCircle size={16} />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div style={styles.formGroup}>
                <label htmlFor="password" style={styles.label}>
                  <Lock size={16} color={colors.text.muted} />
                  Password
                </label>
                <div style={styles.inputWrapper}>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    style={{
                      ...styles.input,
                      borderColor: passwordError ? colors.error.border : '#e2e8f0',
                      background: passwordError ? colors.error.bg : '#f8fafc'
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    onFocus={(e) => {
                      if (!passwordError) {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.background = '#ffffff';
                        e.target.style.boxShadow = `0 0 0 4px rgba(79, 70, 229, 0.1)`;
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = passwordError ? colors.error.border : '#e2e8f0';
                      e.target.style.background = passwordError ? colors.error.bg : '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={styles.inputIcon}>
                    <Lock size={20} />
                  </div>
                </div>
                {passwordError && (
                  <p style={styles.fieldError}>
                    <AlertCircle size={16} />
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 15px 20px -3px rgba(79, 70, 229, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(79, 70, 229, 0.3)';
                  }
                }}
                style={styles.submitButton}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div style={styles.cardFooter}>
              <p style={styles.footerText}>
                Protected by enterprise-grade security
              </p>
            </div>
          </div>

          {/* Copyright */}
          <p style={styles.copyright}>
            © {new Date().getFullYear()} HR Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

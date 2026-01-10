import { useState } from "react";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "password") {
      onLogin(username, password);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            HR Dashboard Login
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            Enter your credentials to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
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
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
          >
            Sign In
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.75rem',
          color: '#9ca3af'
        }}>
          Demo credentials: admin / password
        </div>
      </div>
    </div>
  );
}

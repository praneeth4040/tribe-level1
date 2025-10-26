import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const API_BASE_URL = 'http://localhost:4000';

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            navigate('/dashboard');
            return;
          }
        }
      } catch (err) {
        console.log('Not logged in');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleOAuthLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">🔐 Login</h1>
          <p className="login-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">🔐 Login</h1>
        <p className="login-subtitle">Sign in with your preferred provider</p>

        <div className="oauth-buttons">
          {/* Google */}
          <button
            className="oauth-btn google"
            onClick={() => handleOAuthLogin('google')}
          >
            <span className="oauth-icon">🔍</span>
            Login with Google
          </button>

          {/* Facebook */}
          <button
            className="oauth-btn facebook"
            onClick={() => handleOAuthLogin('facebook')}
          >
            <span className="oauth-icon">👥</span>
            Login with Facebook
          </button>

          {/* GitHub */}
          <button
            className="oauth-btn github"
            onClick={() => handleOAuthLogin('github')}
          >
            <span className="oauth-icon">🐙</span>
            Login with GitHub
          </button>

          {/* LinkedIn */}
          <button
            className="oauth-btn linkedin"
            onClick={() => handleOAuthLogin('linkedin')}
          >
            <span className="oauth-icon">💼</span>
            Login with LinkedIn
          </button>

          {/* Twitter */}
          <button
            className="oauth-btn twitter"
            onClick={() => handleOAuthLogin('twitter')}
          >
            <span className="oauth-icon">🐦</span>
            Login with Twitter
          </button>

          {/* Instagram */}
          <button
            className="oauth-btn instagram"
            onClick={() => handleOAuthLogin('instagram')}
          >
            <span className="oauth-icon">📷</span>
            Login with Instagram
          </button>

          {/* Reddit */}
          <button
            className="oauth-btn reddit"
            onClick={() => handleOAuthLogin('reddit')}
          >
            <span className="oauth-icon">🔴</span>
            Login with Reddit
          </button>
        </div>

        <div className="divider">
          <span>Click any button to continue</span>
        </div>

        <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
          ✨ Connect with any of your social accounts
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

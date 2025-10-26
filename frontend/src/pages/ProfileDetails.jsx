import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileDetails.css';

function ProfileDetails() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const API_BASE_URL = 'http://localhost:4000';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-container">
        <div className="error-box">
          <h1>⚠️ Error</h1>
          <p>{error || 'User not found'}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const getProviderIcon = (provider) => {
    const icons = {
      google: '🔍',
      facebook: '👥',
      github: '🐙',
      linkedin: '💼',
      twitter: '🐦',
      instagram: '📷',
      reddit: '🔴'
    };
    return icons[provider] || '🔗';
  };

  const getProviderColor = (provider) => {
    const colors = {
      google: '#DB4437',
      facebook: '#1877F2',
      github: '#333',
      linkedin: '#0A66C2',
      twitter: '#1DA1F2',
      instagram: '#c13584',
      reddit: '#FF4500'
    };
    return colors[provider] || '#999';
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          {user.profilePic && (
            <img src={user.profilePic} alt="Profile" className="profile-picture" />
          )}
          <div className="profile-header-info">
            <h1>{user.name || 'User'}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="linked-badges">
              {user.linkedProviders && user.linkedProviders.map(provider => (
                <span
                  key={provider}
                  className="badge"
                  style={{ backgroundColor: getProviderColor(provider) }}
                >
                  {getProviderIcon(provider)} {provider.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📋 Overview
          </button>
          <button
            className={`tab ${activeTab === 'providers' ? 'active' : ''}`}
            onClick={() => setActiveTab('providers')}
          >
            🔗 Linked Accounts
          </button>
          <button
            className={`tab ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            📊 Raw Data
          </button>
        </div>

        {/* Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="info-grid">
                <div className="info-card">
                  <label>👤 User ID</label>
                  <p className="mono">{user._id}</p>
                </div>
                <div className="info-card">
                  <label>📧 Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-card">
                  <label>👤 Full Name</label>
                  <p>{user.name || 'Not available'}</p>
                </div>
                <div className="info-card">
                  <label>📅 Joined</label>
                  <p>{new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div className="info-card">
                  <label>⏰ Last Updated</label>
                  <p>{new Date(user.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="info-card">
                  <label>🔗 Linked Providers</label>
                  <p>{user.linkedProviders?.length || 0} account(s)</p>
                </div>
              </div>
              {user.profilePic && (
                <div className="profile-pic-section">
                  <label>🖼️ Profile Picture</label>
                  <img src={user.profilePic} alt="Full Profile" className="full-profile-pic" />
                  <p className="pic-url">{user.profilePic}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="providers-section">
              {user.linkedProviders && user.linkedProviders.length > 0 ? (
                <div className="providers-grid">
                  {user.linkedProviders.map(provider => (
                    <div
                      key={provider}
                      className="provider-card"
                      style={{ borderLeftColor: getProviderColor(provider) }}
                    >
                      <div className="provider-header">
                        <span className="provider-icon">{getProviderIcon(provider)}</span>
                        <h3>{provider.toUpperCase()}</h3>
                      </div>
                      
                      {user.oauthProviders?.[provider] && (
                        <div className="provider-details">
                          <div className="detail">
                            <label>Provider ID:</label>
                            <code>{user.oauthProviders[provider].id}</code>
                          </div>
                          <div className="detail">
                            <label>Access Token:</label>
                            <code className="token">
                              {user.oauthProviders[provider].accessToken.substring(0, 50)}...
                            </code>
                          </div>
                          {user.oauthProviders[provider].refreshToken && (
                            <div className="detail">
                              <label>Refresh Token:</label>
                              <code className="token">
                                {user.oauthProviders[provider].refreshToken.substring(0, 50)}...
                              </code>
                            </div>
                          )}
                          <p className="note">✓ Linked and authenticated</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No linked accounts</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="raw-section">
              <label>Raw User Data (JSON)</label>
              <pre className="json-display">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetails;

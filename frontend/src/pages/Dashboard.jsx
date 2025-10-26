import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
          // Not logged in
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        navigate('/');
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
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="dashboard-container">
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <div className="user-header">
          {user.profilePic && (
            <img src={user.profilePic} alt="Profile" className="profile-pic" />
          )}
          <div className="user-info-header">
            <h1>Welcome, {user.name}! 👋</h1>
            <p className="email-text">{user.email}</p>
          </div>
        </div>

        <div className="user-details">
          <div className="detail-row">
            <label>User ID:</label>
            <span>{user._id}</span>
          </div>
          <div className="detail-row">
            <label>Joined:</label>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          {user.linkedProviders && user.linkedProviders.length > 0 && (
            <div className="detail-row">
              <label>Linked Accounts:</label>
              <span className="providers-list">
                {user.linkedProviders.map((provider) => (
                  <span key={provider} className={`provider-badge ${provider}`}>
                    {provider.toUpperCase()}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>

        <div className="actions">
          <button className="btn-primary" onClick={() => navigate('/profile')}>
            👁️ View Profile Details
          </button>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            ↻ Refresh
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

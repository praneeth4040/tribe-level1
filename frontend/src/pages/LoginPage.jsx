import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists in localStorage
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // Redirect to dashboard if already logged in
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <div>
      <h1>Login with Google</h1>
      <button onClick={handleGoogleLogin}>
        Login with Google
      </button>
    </div>
  );
}

export default LoginPage;

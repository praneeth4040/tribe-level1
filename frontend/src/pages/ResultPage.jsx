import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function ResultPage() {
  const location = useLocation();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    // Get tokens from URL query params
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userId = params.get('userId');
    const error = params.get('error');

    if (error) {
      setStatus('failure');
      setMessage(`Error: ${error}`);
    } else if (accessToken && refreshToken) {
      setStatus('success');
      setMessage('Login successful!');
      setData({
        accessToken: accessToken.substring(0, 20) + '...',
        refreshToken: refreshToken.substring(0, 20) + '...',
        userId: userId,
      });
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', userId);
    } else {
      setStatus('failure');
      setMessage('No tokens received');
    }
  }, [location]);

  return (
    <div>
      {status === 'loading' && <p>Loading...</p>}
      
      {status === 'success' && (
        <div>
          <h1>Success!</h1>
          <p>Login successful</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <a href="/">Back to Login</a>
        </div>
      )}
      
      {status === 'failure' && (
        <div>
          <h1>Failure!</h1>
          <p>{message}</p>
          <a href="/">Back to Login</a>
        </div>
      )}
    </div>
  );
}

export default ResultPage;

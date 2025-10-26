import React from 'react';

function LoginPage() {
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

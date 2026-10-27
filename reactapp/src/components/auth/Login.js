import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, isAuthenticated, user } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, loginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        setLoginSuccess(true);
      } else {
        setError(result.message);
        setLoading(false);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const locationState = location.state;
  const infoMessage = locationState?.message;

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Back to Home Button */}
        <Link to="/" className="back-to-home">
          ← Back to Home
        </Link>

        <div className="login-header">
          <h1>🔐 Admin Login</h1>
          <p>Enter your credentials to access the admin panel</p>
        </div>
        
        {infoMessage && (
          <div className="alert alert-success">
            {infoMessage}
          </div>
        )}
        
        {(error || authError) && (
          <div className="alert alert-error">
            {error || authError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-login">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Default Admin: <strong>admin</strong> / <strong>Admin@123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
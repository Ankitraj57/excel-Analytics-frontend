import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  loginUser,
  forgotPassword,
  clearError,
  clearSuccess,
} from '../features/auth/authSlice';
import '../styles/Form.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success, isAuthenticated, role } = useSelector(
    (state) => state.auth
  );

  const redirected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !redirected.current) {
      redirected.current = true;
      const destination = role === 'admin' ? '/admin' : '/dashboard';
      navigate(destination);
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }

    if (success) {
      toast.success('Login successful!');
      dispatch(clearSuccess());
    }
  }, [error, success, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn('Please enter both email and password.');
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.warn('Please enter your registered email.');
      return;
    }
    setForgotLoading(true);
    try {
      await dispatch(forgotPassword(forgotEmail)).unwrap();
      toast.success('Password reset email sent!');
      setShowForgot(false);
      setForgotEmail('');
    } catch (err) {
      toast.error('Failed to send reset email. Try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="form-container fade-in" style={{ marginBlock: '5rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-toggle-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword);
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p
        className="forgot-password"
        onClick={() => setShowForgot(true)}
        style={{ cursor: 'pointer', color: '#007bff' }}
      >
        Forgot Password?
      </p>

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>

      {showForgot && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: 'green' }}>Reset Password</h3>
            <form onSubmit={handleForgotSubmit}>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setShowForgot(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

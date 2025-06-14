import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  registerUser,
  clearError,
  clearSuccess,
} from '../features/auth/authSlice';
import '../styles/Form.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Redirect to dashboard or admin panel if already logged in
    if (isAuthenticated && user) {
      const destination = user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(destination);
    }
  }, [isAuthenticated, user, navigate]);

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
      toast.success('Registration successful! Please login.');
      dispatch(clearSuccess());
      navigate('/login');
    }
  }, [error, success, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toast.warn('Please fill out all fields.');
      return;
    }
    dispatch(registerUser({ name, email, password, role }));
  };

  return (
    <div className="form-container fade-in" style={{ marginBlock: '5rem' }}>
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            placeholder="Your full name"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-toggle-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              placeholder="Choose a strong password"
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
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

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

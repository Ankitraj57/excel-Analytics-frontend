import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ isDark, setIsDark }) => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem('jwt'));
  const userRole = localStorage.getItem('role');

 useEffect(() => {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark') {
    document.body.classList.add('dark');
    setIsDark(true);
  } else {
    document.body.classList.remove('dark');
    setIsDark(false);
  }
}, [setIsDark]);


  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.body.classList.toggle('dark', newTheme);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Excel Analytics</Link>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            {userRole === 'admin' && <Link to="/admin">Admin Panel</Link>}
            <Link to="/dashboard">Dashboard</Link>
            <button type="button" onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title="Toggle Light/Dark Mode"
          style={{ marginLeft: '1rem' }}
        >
          {isDark ? '🌞' : '🌙'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

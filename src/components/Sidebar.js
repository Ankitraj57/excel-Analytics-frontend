import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import {
  FiHome, FiUpload, FiClock, FiUser,
  FiLogOut, FiShield, FiMenu, FiX
} from 'react-icons/fi';
import '../styles/Sidebar.css';
import { LucideFileBox } from 'lucide-react';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSidebarOpen(false);
    navigate('/login');
  };

  return (
    <>
      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle Sidebar"
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <aside className={`sidebar ${theme} ${sidebarOpen ? 'open' : ''}`}>
        <h2 className="sidebar-title">Excel Analytics</h2>

        <nav className="nav-links">
          <NavLink
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FiHome /> Dashboard
          </NavLink>
          <NavLink
            to="/upload"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FiUpload /> Upload
          </NavLink>
          <NavLink
            to="/history"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FiClock />UploadHistory
          </NavLink>
          <NavLink
            to="/ai-summary"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <LucideFileBox/> AI Summary
          </NavLink>
          <NavLink
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => (isActive ? 'active-link' : '')}
          >
            <FiUser /> Profile
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => (isActive ? 'active-link' : '')}
            >
              <FiShield /> Admin
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout}><FiLogOut /> Logout</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

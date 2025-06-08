import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import UnauthorizedPage from './pages/Unauthorized';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FileUpload from './pages/FileUpload';

import './styles/App.css'; // Main layout styling

function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="app-container">
      <Navbar isDark={isDark} setIsDark={setIsDark} />

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/upload" element={<FileUpload />} />

          {/* Protected Routes - accessible by any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<h2>404 Not Found</h2>} />
        </Routes>
      </main>

      <Footer />

      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme={isDark ? 'dark' : 'light'} // react-toastify built-in themes
      />
    </div>
  );
}

export default App;

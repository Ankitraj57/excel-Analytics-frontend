import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAdminUsers, deleteUser } from '../services/api'; // Removed unused updateUserRole

import '../styles/AdminPage.css';

const AdminPage = () => {
  const [data, setData] = useState({ users: [], summary: {} });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await getAdminUsers();
      const { users, summary } = res.data;

      setData({
        users,
        summary: summary || {
          totalUsers: users.length,
          adminUsers: users.filter(u => u.role === 'admin').length,
          regularUsers: users.filter(u => u.role === 'user').length,
        },
      });
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setDeleteLoading(prev => ({ ...prev, [userId]: true }));
    setError('');
    setSuccess('');
    try {
      await deleteUser(userId);
      setSuccess('User deleted successfully');
      setData(prev => ({
        ...prev,
        users: prev.users.filter(user => user._id !== userId),
      }));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const [apiWorking] = useState(true); // Removed unused setApiWorking

  // Function to test server connection
  const testServerConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000', { method: 'HEAD' });
      return {
        isOnline: true,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        isOnline: false,
        error: error.message
      };
    }
  };

  // Function to make API call with timeout
  const fetchWithTimeout = async (url, options, timeout = 10000) => { // Increased timeout to 10s
    const controller = new AbortController();
    const id = setTimeout(() => {
      console.error('Request timed out after', timeout, 'ms');
      controller.abort();
    }, timeout);

    try {
      console.log('Attempting to connect to:', url);
      console.log('Request options:', {
        method: options.method,
        headers: options.headers,
        body: options.body
      });

      const startTime = Date.now();
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      clearTimeout(id);

      const endTime = Date.now();
      console.log(`Request completed in ${endTime - startTime}ms`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('API Error Response:', errorData);
        } catch (e) {
          const text = await response.text();
          console.error('Failed to parse error response as JSON. Raw response:', text);
          errorData = { message: text || 'Unknown error occurred' };
        }

        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.name = 'APIError';
        error.status = response.status;
        error.response = response;
        error.data = errorData;
        throw error;
      }

      return response;
    } catch (error) {
      clearTimeout(id);

      console.error('Fetch error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });

      // Test server connection if we get a network error
      if (error.name === 'TypeError' || error.name === 'AbortError') {
        console.log('Testing server connection...');
        try {
          const serverStatus = await testServerConnection();
          console.log('Server status:', serverStatus);
          error.serverStatus = serverStatus;
        } catch (e) {
          console.error('Error testing server connection:', e);
        }
      }

      throw error;
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    if (!apiWorking) {
      setError('Role change functionality is currently unavailable');
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const requestUrl = `http://localhost:5000/api/admin/users/${userId}/role`; // Using full URL for testing

    console.log('Role Change Request:', {
      userId,
      currentRole,
      newRole,
      requestUrl,
      timestamp: new Date().toISOString()
    });

    setDeleteLoading(prev => ({ ...prev, [userId]: true }));
    setError('');
    setSuccess('');

    try {
      console.log('Sending request to:', requestUrl);
      console.log('Request payload:', { role: newRole });

      const token = localStorage.getItem('token') || ''; // Get token from localStorage
      const startTime = performance.now();

      // Make direct fetch call with timeout
      const response = await fetchWithTimeout(
        requestUrl,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: newRole })
        },
        5000 // 5 second timeout
      );

      const endTime = performance.now();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || 'Failed to update role');
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        };
        throw error;
      }

      const data = await response.json();

      console.log('Role update successful!', {
        data,
        status: response.status,
        duration: `${(endTime - startTime).toFixed(2)}ms`
      });

      // Update the UI optimistically
      setData(prev => ({
        ...prev,
        users: prev.users.map(user =>
          user._id === userId ? { ...user, role: newRole } : user
        ),
      }));

      setSuccess(`Successfully changed role to ${newRole}`);

      // Refresh user list after a short delay
      setTimeout(() => {
        fetchUsers().catch(err => {
          console.error('Error refreshing user list:', err);
        });
      }, 300);

    } catch (err) {
      console.error('❌ Role update failed:', {
        name: err.name,
        message: err.message,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data
      });

      console.error('Full error details:', err);

      if (err.name === 'AbortError') {
        setError('Request timed out. Possible issues:');
        setError(prev => prev + '\n1. Backend server is not responding');
        setError(prev => prev + '\n2. Network connectivity issues');
        setError(prev => prev + '\n3. Server is overloaded');
      }
      else if (err.serverStatus) {
        if (!err.serverStatus.isOnline) {
          setError('Backend server is not reachable. Please check:');
          setError(prev => prev + '\n1. Is the backend server running at http://localhost:5000?');
          setError(prev => prev + '\n2. Check backend server logs for errors');
        } else {
          setError('Server is online but request failed. Check:');
          setError(prev => prev + '\n1. Is the API endpoint correct?');
          setError(prev => prev + '\n2. Check backend CORS configuration');
        }
      }
      else if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ERR_CORS') {
        setError('Network/CORS issue detected. Please check:');
        setError(prev => prev + '\n1. Is the backend server running?');
        setError(prev => prev + '\n2. Is CORS properly configured on the backend?');
        setError(prev => prev + '\n3. Check browser console for details (F12 > Console)');
      } else {
        const errorMessage = err.response?.data?.message ||
          err.message ||
          'Failed to update user role. Please check the console for details.';
        setError(`Error: ${errorMessage}`);
      }
    } finally {
      setDeleteLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() =>
    data.users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [data.users, searchTerm]
  );

  const filteredAndSortedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => Math.ceil(filteredUsers.length / itemsPerPage), [filteredUsers, itemsPerPage]);

  const exportToCSV = () => {
    if (data.users.length === 0) return;
    const header = ['Name', 'Email', 'Role', 'Total Uploads'];
    const rows = data.users.map(u => [
      u.name,
      u.email,
      u.role,
      u.uploadStats?.totalUploads || 0
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header, ...rows].map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'admin_users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="admin-container">
      {loading && <div className="loading-container"><div className="spinner">Loading...</div></div>}

      {error && <div className="error-message" role="alert">{error}</div>}
      {success && <div className="success-message" role="alert">{success}</div>}

      {!loading && !error && (
        <>
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <button onClick={fetchUsers} className="refresh-btn">🔄 Refresh Data</button>
            <button onClick={exportToCSV} className="export-btn">Export CSV</button>
            <div className="dashboard-summary">
              <div className="summary-card">
                <h3>Total Users</h3>
                <p>{data.summary.totalUsers}</p>
              </div>
              <div className="summary-card">
                <h3>Admin Users</h3>
                <p>{data.summary.adminUsers}</p>
              </div>
              <div className="summary-card">
                <h3>Regular Users</h3>
                <p>{data.summary.regularUsers}</p>
              </div>
            </div>
          </div>

          <div className="search-section">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
              aria-label="Search users"
            />
          </div>

          {filteredAndSortedUsers.length === 0 ? (
            <div className="no-data-message">No users found</div>
          ) : (
            <div className="user-table-container">
              <table className="user-table" aria-label="Users table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Statistics</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUsers.map(user => {
                    const stats = {
                      totalUploads: user.totalUploads || 0,
                      successCount: user.successCount || 0,
                      failCount: user.failCount || 0,
                      successRate: user.successRate || 0,
                    };

                    return (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div className="user-stats">
                            <div>Total Uploads: {stats.totalUploads}</div>
                          </div>
                        </td>
                        <td>
                          {apiWorking ? (
                            <button
                              onClick={() => handleToggleRole(user._id, user.role)}
                              className="toggle-btn"
                              disabled={deleteLoading[user._id]}
                            >
                              {deleteLoading[user._id] ? 'Updating...' : `Make ${user.role === 'admin' ? 'User' : 'Admin'}`}
                            </button>
                          ) : (
                            <span className="text-muted" style={{ color: '#999' }}>
                              Role change unavailable
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={deleteLoading[user._id]}
                            className="delete-btn"
                          >
                            {deleteLoading[user._id] ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="pagination" role="navigation" aria-label="Pagination navigation">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? 'active' : ''}
                    disabled={page === currentPage || loading}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;

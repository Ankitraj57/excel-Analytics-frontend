import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAdminUsers, deleteUser, updateUserRole } from '../services/api';
import { Bar } from 'react-chartjs-2';
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

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(userId, newRole);
      setSuccess(`Role changed to ${newRole} successfully`);
      setData(prev => ({
        ...prev,
        users: prev.users.map(user =>
          user._id === userId ? { ...user, role: newRole } : user
        ),
      }));
    } catch (err) {
      setError('Failed to update user role');
      console.error(err);
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
    const header = ['Name', 'Email', 'Role', 'Total Uploads', 'Successful', 'Failed', 'Success Rate'];
    const rows = data.users.map(u => [
      u.name,
      u.email,
      u.role,
      u.uploadStats?.totalUploads || 0,
      u.uploadStats?.successfulUploads || 0,
      u.uploadStats?.failedUploads || 0,
      `${u.uploadStats?.successRate || 0}%`
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

  const chartData = {
    labels: data.users.map(u => u.name),
    datasets: [
      {
        label: 'Total Uploads',
        data: data.users.map(u => u.uploadStats?.totalUploads || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Successful Uploads',
        data: data.users.map(u => u.uploadStats?.successfulUploads || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Failed Uploads',
        data: data.users.map(u => u.uploadStats?.failedUploads || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
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

          <div className="chart-container">
            <Bar data={chartData} />
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
                    const stats = user.uploadStats || { totalUploads: 0, successfulUploads: 0, failedUploads: 0, successRate: 0 };
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
                            <div>Total: {stats.totalUploads}</div>
                            <div>✅: {stats.successfulUploads}</div>
                            <div>❌: {stats.failedUploads}</div>
                            <div>Rate: {stats.successRate}%</div>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleRole(user._id, user.role)}
                            className="toggle-btn"
                          >
                            Make {user.role === 'admin' ? 'User' : 'Admin'}
                          </button>
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

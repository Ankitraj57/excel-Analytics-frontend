import React, { useState, useEffect, useMemo } from 'react';
import { getAdminUsers, deleteUser, deleteUpload } from '../services/api';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const [data, setData] = useState({ users: [], summary: {} });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await getAdminUsers();
      console.log('Admin users data:', res.data);
      console.log('Users:', res.data.users);
      console.log('First user data:', res.data.users[0]);
      setData(res.data);
      console.log('First user:', res.data.users[0]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setDeleteLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await deleteUser(userId);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) return;

    setDeleteLoading((prev) => ({ ...prev, [uploadId]: true }));
    try {
      await deleteUpload(uploadId);
      setSuccess('Upload deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete upload');
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [uploadId]: false }));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter and paginate users
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = data.users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [data.users, searchTerm, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(
      data.users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ).length / itemsPerPage
    );
  }, [data.users, searchTerm, itemsPerPage]);

  return (
    <div className="admin-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-summary">
          <div className="summary-card">
            <h3>Total Users</h3>
            <p>{data.summary?.totalUsers || 0}</p>
          </div>
          <div className="summary-card">
            <h3>Admin Users</h3>
            <p>{data.summary?.adminUsers || 0}</p>
          </div>
          <div className="summary-card">
            <h3>Regular Users</h3>
            <p>{data.summary?.regularUsers || 0}</p>
          </div>
        </div>
      </div>

      {loading && <div className="spinner">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="search-section">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="user-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Uploads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className="uploads-list">
                    <p>Total Uploads: {user.uploads?.length || 0}</p>
                    {console.log('User uploads:', user.uploads)}
                    {(user.uploads || []).slice(0, 3).map((upload) => (
                      <div key={upload._id} className="upload-item">
                        <span className="file-name">{upload.fileName}</span>
                        <span className="upload-status">{upload.status}</span>
                        {upload.error && <span className="error">Error: {upload.error}</span>}
                        <button
                          onClick={() => handleDeleteUpload(upload._id)}
                          disabled={deleteLoading[upload._id]}
                          className="delete-upload-btn"
                        >
                          {deleteLoading[upload._id] ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    ))}
                    {user.uploads?.length > 3 && (
                      <p className="more-uploads">+{user.uploads.length - 3} more uploads</p>
                    )}
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={deleteLoading[user._id]}
                    className="delete-btn"
                  >
                    {deleteLoading[user._id] ? 'Deleting...' : 'Delete User'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={page === currentPage ? 'active' : ''}
            disabled={page === currentPage}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;

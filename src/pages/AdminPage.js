import React, { useEffect, useState } from 'react';
import { getAdminUsers, deleteUser, deleteUpload } from '../services/api';
import '../styles/AdminPage.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await getAdminUsers();
      setUsers(response.data);
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
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their uploads.')) return;
    try {
      await deleteUser(userId);
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) return;
    try {
      await deleteUpload(uploadId);
      setSuccess('Upload deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete upload');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard - Users Management</h2>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="users-table">
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
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
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.uploads && user.uploads.length > 0 ? (
                        <ul className="uploads-list">
                          {user.uploads.map((upload) => (
                            <li key={upload._id}>
                              {upload.fileName}{' '}
                              <button
                                onClick={() => handleDeleteUpload(upload._id)}
                                className="delete-button"
                                title="Delete upload"
                              >
                                ❌
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="no-uploads">No uploads</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="delete-user-button"
                        title="Delete user"
                      >
                        Delete User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;

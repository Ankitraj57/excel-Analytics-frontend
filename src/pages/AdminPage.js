import React, { useEffect, useState, useMemo } from 'react';
import { getAdminUsers, deleteUser, deleteUpload } from '../services/api';
import '../styles/AdminPage.css';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState({});

  // Filter users based on search term
  const filteredAndSortedUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Paginate the filtered users
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

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

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their uploads.')) return;
    
    try {
      setDeleteLoading(prev => ({ ...prev, [userId]: true }));
      await deleteUser(userId);
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) return;
    
    try {
      setDeleteLoading(prev => ({ ...prev, [uploadId]: true }));
      await deleteUpload(uploadId);
      setSuccess('Upload deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete upload');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [uploadId]: false }));
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard - Users Management</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
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
          {filteredAndSortedUsers.length === 0 ? (
            <p>No users found matching your search.</p>
          ) : (
            <>
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
                  {currentUsers.map((user) => (
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
                                  disabled={deleteLoading[upload._id]}
                                >
                                  {deleteLoading[upload._id] ? 'Deleting...' : 'Delete'}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span>No uploads</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="delete-button"
                          disabled={deleteLoading[user._id]}
                        >
                          {deleteLoading[user._id] ? 'Deleting...' : 'Delete User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAdminUsers, deleteUser, getUploads, updateUserRole } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const [data, setData] = useState({ users: [], summary: {} });
  const [userUploads, setUserUploads] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState({});
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const [usersRes, uploadsRes] = await Promise.all([
        getAdminUsers(),
        getUploads()
      ]);
      console.log('Uploads from backend:', uploadsRes.data); 
      const { users, summary } = usersRes.data;
      const uploads = uploadsRes.data || [];

      const uploadsByUser = {};
      
      uploads.forEach((upload) => {
         console.log('Processing upload by user:', upload.user);
        let userId  = null;
        
        if (upload.user && typeof upload.user === 'object') {
          userId = upload.user._id?.toString();
        } else if(typeof upload.user == 'string') {
          userId = upload.user;
        }

        
        if (!userId) return; {
          const userIdStr = userId.toString();
          
          if (!uploadsByUser[userIdStr]) {
            uploadsByUser[userIdStr] = [];
          }
          
          uploadsByUser[userIdStr].push({
            ...upload,
            originalname: upload.originalname || upload.filename,
            uploadedAt: upload.uploadedAt || upload.createdAt || new Date()
          });
          console.log('All users:', users);
console.log('All uploads:', uploads);
console.log('Uploads grouped by user:', uploadsByUser);
 console.log('Processing upload by user:', userIdStr);

        }
      });
Object.entries(uploadsByUser).forEach(([userId, files]) => {
  console.log(`User ID: ${userId}, Uploaded Files:`, files.map(f => f.originalname));
});

      setUserUploads(uploadsByUser);
      console.log('Uploads grouped by user:', uploadsByUser);

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
    } finally {
      setDeleteLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const [apiWorking] = useState(true);

  const handleToggleRole = async (userId, currentRole) => {
    if (!apiWorking) {
      setError('Role change functionality is currently unavailable');
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'make admin' : 'make regular user';
    
    // Show confirmation dialog
    const isConfirmed = window.confirm(`Are you sure you want to ${action} this user?`);
    if (!isConfirmed) {
      return;
    }
    
    setDeleteLoading(prev => ({ ...prev, [userId]: true }));
    setError('');
    setSuccess('');

    try {
      const response = await updateUserRole(userId, newRole);
      
      if (response && response.data) {
        // Update local state to reflect the change immediately
        setData(prev => ({
          ...prev,
          users: prev.users.map(user =>
            user._id === userId ? { ...user, role: newRole } : user
          ),
        }));

        // Show success toast
        toast.success(`Successfully changed role to ${newRole}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Refresh the user list after a short delay
        setTimeout(() => {
          fetchUsers().catch(console.error);
        }, 500);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      
      let errorMessage = 'Failed to update user role';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request
        errorMessage = err.message || errorMessage;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
const [darkMode] = useState(false);

useEffect(() => {
  if (darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}, [darkMode]);

  return (
    <div className="admin-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
                     console.log('User:', user.name, 'ID:', user._id.toString());
  console.log('Uploads:', userUploads[user._id.toString()]);
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
                          <div className="action-buttons">
                            <button 
                              className="action-btn view-uploads-btn"
                              onClick={() => navigate(`/history/${user._id}`)}
                            >
                              View Uploads
                            </button>
                            {apiWorking ? (
                              <button
                                onClick={() => handleToggleRole(user._id, user.role)}
                                className="action-btn toggle-btn"
                                disabled={deleteLoading[user._id]}
                              >
                                {deleteLoading[user._id] ? 'Updating...' : `Make ${user.role === 'admin' ? 'User' : 'Admin'}`}
                              </button>
                            ) : (
                              <span className="text-muted">
                                Role change unavailable
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={deleteLoading[user._id]}
                              className="action-btn delete-btn"
                            >
                              {deleteLoading[user._id] ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
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

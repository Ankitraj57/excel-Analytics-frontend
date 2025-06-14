import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData } from '../features/redux/dashboardSlice';
import Sidebar from '../components/Sidebar';
import '../styles/DashboardPage.css';

function DashboardPage() {
  const dispatch = useDispatch();

  // Get dashboard state from Redux
  const { totalUploads, lastUpload, uploads, loading, error } = useSelector(
    (state) => state.dashboard
  );

  // Get user info from auth state
  const { user } = useSelector((state) => state.auth);
  const username = user?.name || 'User';
  const email = user?.email || 'N/A';
  const role = user?.role || 'user';

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  };

  const lastUploadDate = formatDate(lastUpload);

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="main-content">
        <div className="welcome-message">
          <h2>Welcome {username}!</h2>
          <p>Your analytics and uploads will appear here.</p>
        </div>

        <div className="user-profile">
          <h3>User Info</h3>
          <ul>
            <li><strong>Name:</strong> {username}</li>
            <li><strong>Email:</strong> {email}</li>
            <li><strong>Role:</strong> {role}</li>
          </ul>
        </div>

        <div className="upload-summary">
          <h3>Upload Summary</h3>
          <p><strong>Total Files Uploaded:</strong> {totalUploads}</p>
          <p><strong>Last Upload:</strong> {lastUploadDate}</p>
        </div>

        {error && <p className="error-message">{error}</p>}
        {loading && <p>Loading your data...</p>}

        {!loading && !error && (
          <div className="dashboard-content">


            <div className="recent-uploads">
              <h3>Recent Uploads</h3>
              {uploads && uploads.length > 0 ? (
                <div className="uploads-list">
                  {uploads.slice(-5).reverse().map((upload) => (
                    <div key={upload._id || upload.timestamp} className="upload-item">
                      <div className="upload-details">
                        <h4>{upload.fileName}</h4>
                        <p className="upload-date">{formatDate(upload.timestamp)}</p>
                        <p className="upload-size">Size: {upload.size ? `${(upload.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-uploads">
                  <p>No uploads found.</p>
                  <p>Upload your first Excel file to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;

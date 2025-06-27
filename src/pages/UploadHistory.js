import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getUploadHistory } from '../features/redux/uploadHistorySlice';
import { deleteFileById } from '../features/files/fileSlice';
import { FiBarChart2, FiTrash2, FiUpload, FiAlertCircle } from 'react-icons/fi';

import '../styles/UploadHistory.css';

const UploadHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams(); // Get userId from URL params
  const { history, loading, error } = useSelector(state => state.uploadHistory);
  const { deleting, error: deleteError } = useSelector(state => state.files);
  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem('jwt');

  const handleViewInsights = (fileId) => {
    navigate(`/ai-insight/${fileId}`);
  };

  // Fetch upload history when component mounts or userId changes
  useEffect(() => {
    if (isAuthenticated) {
      // If viewing another user's uploads (admin view), pass the userId
      const params = userId ? { userId } : {};
      console.log('Fetching upload history with params:', params);
      
      dispatch(getUploadHistory(params))
        .unwrap()
        .then(data => {
          console.log('Received upload history data:', data);
          console.log('Number of uploads received:', data?.length || 0);
        })
        .catch(err => {
          console.error('Failed to fetch upload history:', err);
        });
    }
  }, [dispatch, isAuthenticated, userId]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      dispatch(deleteFileById(id))
        .then(() => {
          // Refresh history after successful deletion
          dispatch(getUploadHistory());
        })
        .catch((err) => {
          console.error('Delete failed:', err);
        });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="upload-history">
        <div className="not-authenticated">
          <FiAlertCircle size={48} className="error-icon" />
          <h2>Please log in to view your upload history</h2>
          <p>You need to be logged in to see your uploaded files.</p>
          <button 
            className="login-button"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="upload-history">
        <div className="error-state">
          <FiAlertCircle size={48} className="error-icon" />
          <h2>Error Loading History</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => {
              const params = userId ? { userId } : {};
              dispatch(getUploadHistory(params));
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-history">
      <div className="history-header">
        <h2><FiUpload className="header-icon" /> Your Upload History</h2>
        
        {deleting && <div className="loading-message">
          <div className="spinner"></div>
          <span>Deleting file...</span>
        </div>}
        
        {deleteError && (
          <div className="error-message">
            <FiAlertCircle className="error-icon" />
            <span>{deleteError}</span>
          </div>
        )}
        
        {loading ? (
          <div className="loading-message">
            <div className="spinner"></div>
            <span>Loading your files...</span>
          </div>
        ) : error ? (
          <div className="error-message">
            <FiAlertCircle className="error-icon" />
            <span>Error loading files: {error}</span>
          </div>
        ) : history.length === 0 ? (
          <div className="no-uploads">
            <div className="empty-state">
              <FiUpload size={48} className="empty-icon" />
              <h3>No files uploaded yet</h3>
              <p>Upload your first Excel file to get started with analysis!</p>
              <button 
                className="upload-button"
                onClick={() => navigate('/')}
              >
                Go to Upload
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="upload-list">
        {history.map((file) => (
          <div key={file._id} className="upload-card">
            <div className="upload-header">
              <h3>{file.originalname}</h3>
              <span className="upload-date">
                {file.formattedCreatedAt || new Date(file.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="upload-content">
              {file.parsedData?.length > 0 && (
                <details className="data-preview">
                  <summary>Preview Data</summary>
                  <pre>{JSON.stringify(file.parsedData.slice(0, 3), null, 2)}</pre>
                </details>
              )}
            </div>

            <div className="upload-actions">
              <button 
                className="action-btn view-insights"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewInsights(file._id);
                }}
                title="View AI Insights"
              >
                <FiBarChart2 /> Insights
              </button>
              <button 
                className="action-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(file._id);
                }}
                disabled={deleting}
                title="Delete File"
              >
                <FiTrash2 /> {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadHistory;
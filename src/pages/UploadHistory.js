import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUploadHistory } from '../features/redux/uploadHistorySlice';
import { deleteFileById } from '../features/files/fileSlice'; // if deleteFileById is in fileSlice

import '../styles/UploadHistory.css';

const UploadHistory = () => {
  const dispatch = useDispatch();
  const { history, loading, error } = useSelector(state => state.uploadHistory);
  const { deleting, error: deleteError } = useSelector(state => state.files);

  useEffect(() => {
    dispatch(getUploadHistory());
  }, [dispatch]);

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

  return (
    <div className="upload-history">
      <div className="history-header">
        <h2>📁 Your Upload History</h2>
        {deleting && <p className="loading">Deleting file...</p>}
        {deleteError && <p className="error">{deleteError}</p>}
        
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && history.length === 0 && (
          <div className="no-uploads">
            <h3>No uploads yet.</h3>
            <p>Upload your first Excel file to get started!</p>
          </div>
        )}
      </div>

      <div className="upload-list">
        {history.map((file) => (
          <div key={file._id} className="upload-card">
            <div className="upload-header">
              <h3>{file.originalname}</h3>
              <span className="upload-date">
                {new Date(file.createdAt).toLocaleString()}
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
                className="delete-btn" 
                onClick={() => handleDelete(file._id)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadHistory;

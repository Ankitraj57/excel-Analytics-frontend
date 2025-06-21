import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { analyzeData, getUpload } from '../services/api';
import '../styles/AIInsight.css';

const AIInsight = () => {
  const { fileId } = useParams();
  const [fileData, setFileData] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(fileId ? true : false);
  const [error, setError] = useState('');
  const [fetchingInsight, setFetchingInsight] = useState(false);

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        if (!fileId) {
          setLoading(false);
          return;
        }
        
        const file = await getUpload(fileId);
        if (!file?.data) throw new Error('No file data received');
        setFileData(file.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching file:', err);
        setError('Failed to load file data. Please try again.');
        setLoading(false);
      }
    };

    fetchFileData();
  }, [fileId]);

  const generateInsight = async () => {
    if (!fileData) {
      setError('No file data available');
      return;
    }
    setFetchingInsight(true);
    setError('');
    setInsight('');
    try {
      const res = await analyzeData(fileData);
      if (!res?.data?.insight) throw new Error('No insight received from server');
      setInsight(res.data.insight);
    } catch (err) {
      console.error('Error generating insight:', err);
      setError('Failed to generate insight. Please try again.');
    } finally {
      setFetchingInsight(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading file data...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p className="error">{error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="ai-insight-container">
      <h2>AI Insight Generator</h2>
      <div className="file-info">
        <h3>File: {fileData?.originalname}</h3>
        <p>Uploaded on: {new Date(fileData?.createdAt).toLocaleString()}</p>
      </div>
      <button onClick={generateInsight} disabled={fetchingInsight}>
        {fetchingInsight ? 'Generating...' : 'Generate Insight'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {insight && (
        <div
          style={{
            backgroundColor: '#f0f8ff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
          }}
        >
          <h3>AI Insight</h3>
          <p>{insight}</p>
        </div>
      )}
    </div>
  );
};

export default AIInsight;

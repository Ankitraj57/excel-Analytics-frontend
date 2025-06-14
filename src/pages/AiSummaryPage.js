import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { analyzeExcelWithAI } from '../features/ai/aiSlice';
import '../styles/AiSummaryPage.css';

const AiSummaryPage = () => {
  const dispatch = useDispatch();
  const { loading, error, insights } = useSelector(state => state.ai);
  const { history } = useSelector(state => state.uploadHistory);

  useEffect(() => {
    // Only analyze when a new file is uploaded
    if (history.length > 0) {
      const latestFile = history[0];
      dispatch(analyzeExcelWithAI(latestFile._id));
    }
  }, [dispatch, history]);

  const handleAnalyze = (fileId) => {
    dispatch(analyzeExcelWithAI(fileId));
  };

  return (
    <div className="ai-summary-container">
      <h2>AI Insights Summary</h2>

      {loading && <p className="loading">Analyzing data with AI...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && history.length === 0 && (
        <div className="no-data">
          <p>No Excel files uploaded yet.</p>
          <p>Please upload an Excel file to get AI insights.</p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="analysis-section">
          <h3>Select Excel File to Analyze</h3>
          <select onChange={(e) => handleAnalyze(e.target.value)}>
            <option value="">Select a file</option>
            {history.map(file => (
              <option key={file._id} value={file._id}>
                {file.originalname} ({new Date(file.createdAt).toLocaleString()})
              </option>
            ))}
          </select>

          {insights.length > 0 && (
            <div className="insights-container">
              <h3>AI Insights</h3>
              <div className="insights-list">
                {insights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <h4>{insight.title}</h4>
                    <p>{insight.description}</p>
                    {insight.data && (
                      <pre className="insight-data">
                        {JSON.stringify(insight.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiSummaryPage;

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import ChartDisplay from './ChartDisplay'; 
import ThreeDChart from '../components/ThreeDChart';
// import UploadHistory from './UploadHistory';
import "../styles/FileUpload.css";

function FileUpload() {
  const [preview, setPreview] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [labelCol, setLabelCol] = useState('');
  const [valueCol, setValueCol] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  // Helper to detect numeric columns from first 5 rows (or less)
  const getNumericColumns = (data) => {
    if (!data.length) return [];
    const keys = Object.keys(data[0]);
    return keys.filter((key) =>
      data.slice(0, 5).every(row => !isNaN(Number(row[key])))
    );
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage('');
    setShowChart(false);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length > 0) {
        setPreview(jsonData.slice(0, 5));
        setFullData(jsonData);

        const allCols = Object.keys(jsonData[0]);
        setLabelCol(allCols[0] || '');

        const numericCols = getNumericColumns(jsonData);
        setValueCol(numericCols[0] || '');

        setUploadMessage('File loaded successfully!');
      } else {
        setPreview([]);
        setFullData([]);
        setUploadMessage('No data found in file.');
        setLabelCol('');
        setValueCol('');
      }
      setIsUploading(false);

setUploadMessage('File loaded successfully!');
setIsUploading(false);

// 🔽 Add this to actually store the file to backend
const formData = new FormData();
formData.append('file', file);

try {
  const token = localStorage.getItem('jwt');
  const res = await fetch('http://localhost:5000/api/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await res.json();
  console.log('Upload response:', result);

  if (res.ok) {
    setUploadMessage('Uploaded and parsed successfully!');
  } else {
    setUploadMessage(`Upload failed: ${result.message || 'Unknown error'}`);
  }
} catch (err) {
  console.error('Upload error:', err);
  setUploadMessage('Upload failed: ' + err.message);
}

    };
    reader.onerror = () => {
      setUploadMessage('Failed to read file.');
      setIsUploading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const generateChart = () => {
    if (!labelCol || !valueCol) return;
    setShowChart(true);
  };

  // Numeric columns for Y-axis dropdown
  const numericCols = preview.length ? getNumericColumns(preview) : [];

  return (
    <div className="upload-container">
      <h3>Upload Excel File</h3>

      <div className="upload-box">
        <input
          type="file"
          id="file-upload"
          accept=".xlsx, .xls"
          onChange={handleFile}
          disabled={isUploading}
        />
        <label htmlFor="file-upload">
          {isUploading ? 'Uploading...' : 'Click or drag to upload'}
        </label>
      </div>

      {uploadMessage && (
        <div
          className={`upload-message ${
            uploadMessage.toLowerCase().includes('success') ? 'success' : 'error'
          }`}
        >
          {uploadMessage}
        </div>
      )}

      {preview.length > 0 && (
        <>
          <div className="preview-table">
            <h4>Preview (Top 5 rows)</h4>
            <table>
              <thead>
                <tr>
                  {Object.keys(preview[0]).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(row).map((col) => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <label>
              Select X-axis:
              <select
                value={labelCol}
                onChange={(e) => setLabelCol(e.target.value)}
                disabled={isUploading}
                style={{ marginLeft: '0.5rem' }}
              >
                {Object.keys(preview[0]).map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ marginLeft: '1rem' }}>
              Select Y-axis:
              <select
                value={valueCol}
                onChange={(e) => setValueCol(e.target.value)}
                disabled={isUploading}
                style={{ marginLeft: '0.5rem' }}
              >
                {numericCols.length > 0 ? (
                  numericCols.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))
                ) : (
                  <option disabled>No numeric columns found</option>
                )}
              </select>
            </label>

            <label style={{ marginLeft: '1rem' }}>
              Chart Type:
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                disabled={isUploading}
                style={{ marginLeft: '0.5rem' }}
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
                <option value="doughnut">Doughnut</option>
              </select>
            </label>

            <button
              onClick={generateChart}
              disabled={
                isUploading || !labelCol || !valueCol || numericCols.length === 0
              }
              style={{ marginLeft: '1rem' }}
            >
              Generate Chart
            </button>
          </div>
        </>
      )}

      {showChart && (
        <div style={{ marginTop: '2rem' }}>
          <ChartDisplay
            data={fullData}
            xKey={labelCol}
            yKey={valueCol}
            chartType={chartType}
          />
        <ThreeDChart
         data={fullData}
            xKey={labelCol}
            yKey={valueCol}
            chartType={"bar3d"}/>
        {/* <UploadHistory/> */}
        </div>
      )}
    </div>
  );
}

export default FileUpload;

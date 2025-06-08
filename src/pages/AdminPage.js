import React, { useEffect, useState } from 'react';
import { getAdminData } from '../services/api';

function AdminPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminData(); // Call your protected admin API
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin data.');
      }
    };
    fetchData();
  }, []); // Run once on component mount

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <p className="error-message">{error}</p>}
      {data ? (
        <div>
          <h3>Admin-only Content:</h3>
          {/* Render admin specific tools/data here */}
          <pre>{JSON.stringify(data, null, 2)}</pre> {/* For demonstration */}
        </div>
      ) : (
        <p>Loading admin data...</p>
      )}
    </div>
  );
}

export default AdminPage;
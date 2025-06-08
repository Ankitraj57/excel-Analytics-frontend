import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../services/api';

function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardData();
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>User Dashboard</h2>
      {error && <p className="error-message">{error}</p>}
      {data ? (
        <div>
          <h3>Your Analytics Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading dashboard data...</p>
      )}
    </div>
  );
}

export default DashboardPage;

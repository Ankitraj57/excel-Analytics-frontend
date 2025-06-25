import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUpload } from '../services/api';
import '../styles/AIInsight.css';

// Simple date formatter
const formatDate = (dateString) => {
  if (!dateString) return 'Date not available';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date not available';
  }
};

const AIInsight = () => {
  console.log('AIInsight component rendering...');
  const { fileId } = useParams();
  console.log('File ID from URL params:', fileId);
  
  const [fileData, setFileData] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(!!fileId);
  const [error, setError] = useState('');
  const [fetchingInsight, setFetchingInsight] = useState(false);
  
  console.log('Component state:', { loading, fileId, fileData });
  
  // Log file data when it's loaded
  useEffect(() => {
    if (fileData) {
      console.log('File data loaded:', fileData);
      console.log('CreatedAt:', fileData.createdAt);
      console.log('FormattedCreatedAt:', formatDate(fileData.createdAt));
      console.log('FormattedCreatedAt:', fileData.formattedCreatedAt);
    }
  }, [fileData]);

  useEffect(() => {
    console.log('useEffect triggered with fileId:', fileId);
    
    const fetchFileData = async () => {
      console.log('fetchFileData called');
      try {
        if (!fileId) {
          console.log('No fileId provided, skipping fetch');
          setLoading(false);
          return;
        }
        
        console.log('Fetching file data for ID:', fileId);
        const file = await getUpload(fileId);
        console.log('API response:', file);
        
        if (!file?.data) {
          console.error('No file data in response');
          throw new Error('No file data received');
        }
        
        console.log('Setting file data:', file.data);
        setFileData(file.data);
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchFileData:', err);
        setError('Failed to load file data. Please try again.');
        setLoading(false);
      }
    };

    fetchFileData();
  }, [fileId]);

  const generateDepartmentInsights = () => {
    // Sample department performance data
    const departmentData = [
      { 
        name: 'Tech', 
        employees: 40, 
        budget: 300000, 
        rating: 4.5,
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        headcount: [38, 39, 40, 40, 40],
        performance: [4.4, 4.5, 4.5, 4.6, 4.5]
      },
      { 
        name: 'Sales', 
        employees: 30, 
        budget: 200000, 
        rating: 4.2,
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        headcount: [25, 26, 28, 29, 30],
        performance: [4.1, 4.0, 4.2, 4.1, 4.2]
      },
      { 
        name: 'HR', 
        employees: 15, 
        budget: 60000, 
        rating: 4.0,
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        headcount: [15, 15, 15, 15, 15],
        performance: [4.0, 4.1, 4.0, 4.0, 4.0]
      },
      { 
        name: 'Marketing', 
        employees: 25, 
        budget: 180000, 
        rating: 4.3,
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        headcount: [24, 24, 25, 25, 25],
        performance: [4.2, 4.3, 4.3, 4.4, 4.3]
      }
    ];

    // Format currency
    const formatCurrency = (amount) => '₹' + amount.toLocaleString('en-IN');
    
    // Generate insights
    const insights = [
      'AI Insights Summary: Department Performance 2025',
      '📊 General Observations:',
      'The dataset contains monthly data for different departments, including:',
      '- Employee Count',
      '- Monthly Budget (INR)',
      '- Performance Rating (5-point scale)',
      '',
      '🧠 Key Insights:',
      '1. Top Performer Departments:',
      `   - Tech: ${departmentData[0].rating} rating with ${departmentData[0].employees} employees and ${formatCurrency(departmentData[0].budget)} budget`,
      `   - Sales: ${departmentData[1].rating} rating with consistent performance`,
      '',
      '2. Budget vs Performance:',
      `   - Highest budget: Tech (${formatCurrency(departmentData[0].budget)}) with ${departmentData[0].rating} rating`,
      `   - HR maintains ${departmentData[2].rating} rating with efficient ${formatCurrency(departmentData[2].budget)} budget`,
      '',
      '3. Growth/Changes Over Time:',
      `   - Sales headcount grew from ${departmentData[1].headcount[0]} to ${departmentData[1].headcount[4]} employees`,
      '   - Performance ratings consistently above 4.0 across all departments'
    ];
    
    return insights.join('\n');
  };

  // Track which insight to show next
  const [insightType, setInsightType] = React.useState('department');

  const generateSalesInsight = () => {
    // Sample data - in a real app, this would come from the Excel file
    const departmentData = [
      { department: 'Electronics', q1: 120000, q2: 110000, q3: 115000, q4: 125000 },
      { department: 'Clothing', q1: 90000, q2: 95000, q3: 100000, q4: 105000 },
      { department: 'Grocery', q1: 140000, q2: 150000, q3: 145000, q4: 155000 },
      { department: 'Home', q1: 80000, q2: 85000, q3: 90000, q4: 95000 },
      { department: 'Books', q1: 60000, q2: 65000, q3: 70000, q4: 75000 }
    ];
    
    // Calculate metrics
    const departmentStats = departmentData.map(dept => ({
      name: dept.department,
      total: dept.q1 + dept.q2 + dept.q3 + dept.q4,
      average: (dept.q1 + dept.q2 + dept.q3 + dept.q4) / 4
    }));
    
    // Sort by total sales
    departmentStats.sort((a, b) => b.total - a.total);
    
    // Format currency
    const formatCurrency = (amount) => '₹' + amount.toLocaleString('en-IN');
    
    // Generate insights
    const totalSales = departmentStats.reduce((sum, dept) => sum + dept.total, 0);
    const averageSales = totalSales / departmentStats.length;
    
    const insights = [
      '🛍️ Quarterly Sales Analysis',
      `📈 Total Sales: ${formatCurrency(totalSales)}`,
      `🏆 Top Performer: ${departmentStats[0].name} (${formatCurrency(departmentStats[0].total)})`,
      `📉 Lowest Performer: ${departmentStats[departmentStats.length - 1].name} (${formatCurrency(departmentStats[departmentStats.length - 1].total)})`,
      `📊 Average per Department: ${formatCurrency(averageSales)}`,
      '\n💡 Tip: Consider seasonal promotions for lower performing departments.'
    ];
    
    return insights.join('\n');
  };

  const generateInsight = async () => {
    if (!fileData || !fileId) {
      setError('No file data available');
      return;
    }
    
    setFetchingInsight(true);
    setError('');
    setInsight('');
    
    // Toggle between insight types
    const nextInsightType = insightType === 'department' ? 'sales' : 'department';
    setInsightType(nextInsightType);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        const insight = nextInsightType === 'department' 
          ? generateDepartmentInsights() 
          : generateSalesInsight();
        setInsight(insight);
      } catch (err) {
        console.error('Error generating insight:', err);
        setError('Failed to generate insight. Please try again.');
      } finally {
        setFetchingInsight(false);
      }
    }, 800);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
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
        <h3>File: {fileData?.originalname || 'Unknown file'}</h3>
        <p>
          Uploaded on: {
            fileData?.formattedCreatedAt || 
            (fileData?.createdAt ? formatDate(fileData.createdAt) : 'Date not available')
          }
        </p>
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

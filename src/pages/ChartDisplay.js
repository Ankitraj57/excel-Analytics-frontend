import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const generateColors = (count) =>
  Array.from({ length: count }, (_, i) => `hsl(${(i * 360) / count}, 70%, 60%)`);

function ChartDisplay({ data, xKey, yKey, chartType = 'bar', title = '' }) {
  const chartRef = useRef(null);

  if (!data || data.length === 0 || !xKey || !yKey) {
    return <p style={{ textAlign: 'center', color: 'gray' }}>No data to display.</p>;
  }

  const labels = data.map((item) => item[xKey]);
  const values = data.map((item) => Number(item[yKey]));

  const backgroundColor =
    chartType === 'pie' || chartType === 'doughnut'
      ? generateColors(values.length)
      : 'rgba(54, 162, 235, 0.6)';

  const borderColor =
    chartType === 'pie' || chartType === 'doughnut'
      ? generateColors(values.length)
      : 'rgba(54, 162, 235, 1)';

  const chartData = {
    labels,
    datasets: [
      {
        label: yKey,
        data: values,
        backgroundColor,
        borderColor,
        borderWidth: chartType === 'pie' || chartType === 'doughnut' ? 0 : 1,
      },
    ],
  };

  const options = {
    responsive: true,
     animation: {
    duration: 1000, // 1 second
    easing: 'easeInOutQuart',
  },
    plugins: {
    legend: {
      display: true,
      onClick: (e, legendItem, legend) => {
        const index = legendItem.datasetIndex;
        const ci = legend.chart;
        const meta = ci.getDatasetMeta(index);
        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
        ci.update();
      }
    },
  },
};

  const downloadPNG = () => {
    if (!chartRef.current) return;
    const base64Image = chartRef.current.toBase64Image();
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = `${chartType}_chart.png`;
    link.click();
  };

  const downloadPDF = () => {
    if (!chartRef.current) return;
    const base64Image = chartRef.current.toBase64Image();
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [chartRef.current.width, chartRef.current.height],
    });
    pdf.addImage(base64Image, 'PNG', 0, 0, chartRef.current.width, chartRef.current.height);
    pdf.save(`${chartType}_chart.pdf`);
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar ref={chartRef} data={chartData} options={options} />;
      case 'line':
        return <Line ref={chartRef} data={chartData} options={options} />;
      case 'pie':
        return <Pie ref={chartRef} data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut ref={chartRef} data={chartData} options={options} />;
      default:
        return <p style={{ textAlign: 'center' }}>Invalid chart type selected.</p>;
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto' }}>
      {renderChart()}

      <div
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <button
          onClick={downloadPNG}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 6px rgba(25, 118, 210, 0.4)',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#115293')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1976d2')}
          aria-label="Download chart as PNG"
        >
          Download PNG
        </button>

        <button
          onClick={downloadPDF}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#388e3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 6px rgba(56, 142, 60, 0.4)',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2e7d32')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#388e3c')}
          aria-label="Download chart as PDF"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default ChartDisplay;

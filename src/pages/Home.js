import React from 'react';
import {useNavigate } from 'react-router-dom';
import '../styles/Home.css';
const Home = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate("/login");
    }
  return (
    <div className="home-container">
      <main className="hero-section">
        <div className="hero-left">
          <h2>Excel Analytics Platform</h2>
          <p>
            A powerful platform for uploading any Excel file (.xls or .xlsx), analyzing the data, and generating interactive 2D and 3D charts.
          </p>
          <ul>
            <li>✅ Dynamic data visualization</li>
            <li>✅ User & admin authentication</li>
            <li>✅ Multiple chart types (2D/3D)</li>
            <li>✅ Downloadable visualizations</li>
          </ul>
          <button className="get-started-btn" onClick={handleGetStarted}>Get Started</button>
        </div>

        <div className="hero-right">
          <h3>Powerful Data Analysis</h3>
          <p>
            Transform your Excel data into meaningful insights with our interactive visualization tools. Perfect for data analysts, business professionals, and students.
          </p>
          <div className="feature-grid">
            <div className="feature-card">📊 Multiple Chart Types</div>
            <div className="feature-card">📄 Excel Integration</div>
            <div className="feature-card">⬇️ Export Options</div>
            <div className="feature-card">🧠 AI Insights</div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Home;

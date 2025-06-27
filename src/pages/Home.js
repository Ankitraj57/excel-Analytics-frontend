import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const features = [
  {
    emoji: "📁",
    title: "Excel File Upload",
    description: "Upload .xls/.xlsx files and parse them using SheetJS for further analysis.",
  },
  {
    emoji: "🔐",
    title: "User/Admin Authentication",
    description: "Secure JWT-based authentication to manage user access and roles effectively.",
  },
  {
    emoji: "📊",
    title: "2D/3D Chart Support",
    description: "Render interactive charts using Chart.js and Three.js to visualize data beautifully.",
  },
  {
    emoji: "📈",
    title: "Dynamic Data Mapping",
    description: "Allow users to choose X and Y axes from uploaded data dynamically.",
  },
  {
    emoji: "📥",
    title: "Downloadable Charts",
    description: "Users can download visualizations in PNG or PDF format for reports or sharing.",
  },
  {
    emoji: "💼",
    title: "Dashboard with History",
    description: "Track user uploads and previous analyses through a personalized dashboard.",
  },
  {
    emoji: "🤖",
    title: "AI Tools Integration",
    description: "Integrate AI APIs (like OpenAI) to summarize data or generate smart insights.",
  },
  {
    emoji: "🧩",
    title: "Responsive UI",
    description: "Modern, clean and fully responsive design for seamless experience on all devices.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate("/login");

  return (
    <div className="home-container">
      <header className="hero-header">
        <h1 className="hero-main-title">Excel Analytics Platform</h1>
        <p className="hero-main-description">
          A full-featured platform to upload Excel files, analyze them, and generate interactive 2D/3D charts with optional AI insights.
        </p>
        <button className="get-started-btn" onClick={handleGetStarted}>
          Get Started
        </button>
      </header>

      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid" aria-label="Sliding feature cards" tabIndex={0}>
          {[...features, ...features].map((feature, idx) => (
            <div
              key={idx}
              className="feature-card"
              data-emoji={feature.emoji}
              tabIndex={0}
            >
              <strong>{feature.title}</strong>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

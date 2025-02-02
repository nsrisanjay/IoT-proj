// src/components/Home.jsx
import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <h1>Welcome to the IoT Dashboard</h1>
      <p className="intro">Your central hub for monitoring, managing, and analyzing IoT data. Connect, control, and get insights from all your IoT devices in one place!</p>
      
      <div className="features">
        <div className="feature-card">
          <h2>Real-Time Monitoring</h2>
          <p>Get live updates from your sensors and devices. Stay informed of any changes in temperature, humidity, and gas levels instantly.</p>
        </div>
        
        <div className="feature-card">
          <h2>RFID Tag Tracking</h2>
          <p>Track and manage your RFID-tagged items effortlessly. Monitor statuses, recent activity, and tag-specific alerts.</p>
        </div>
        
        <div className="feature-card">
          <h2>Data Analytics</h2>
          <p>Gain insights from the data collected by your IoT devices with in-depth analytics and visualizations.</p>
        </div>
      </div>

      <p className="cta">Ready to get started? Use the navigation above to explore your data and manage your IoT setup.</p>
    </div>
  );
}

export default Home;

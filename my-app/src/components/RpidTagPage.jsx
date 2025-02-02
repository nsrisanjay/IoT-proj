// src/components/RpidTagPage.jsx
import React, { useEffect, useState } from 'react';
import './RpidTagPage.css';

function RpidTagPage() {
  const [tagData, setTagData] = useState(null);

  useEffect(() => {
    // Connect to the WebSocket server
    const ws = new WebSocket('ws://localhost:8080');

    // Listen for messages from the WebSocket server
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTagData(data);
    };

    // Clean up WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="rpid-tag-page">
      <h1>RFID Tag Details</h1>
      {tagData ? (
        <div className="tag-details">
          <div className="tag-info">
            <p><strong>RPID:</strong> {tagData.rpid}</p>
            <p><strong>Status:</strong> {tagData.status}</p>
            <p><strong>Last Updated:</strong> {tagData.timestamp}</p>
          </div>
          <div className="tag-metrics">
            <div className="metric-card">
              <h3>Location</h3>
              <p>{tagData.location}</p>
            </div>
            <div className="metric-card">
              <h3>Temperature</h3>
              <p>{tagData.temperature}</p>
            </div>
            <div className="metric-card">
              <h3>Humidity</h3>
              <p>{tagData.humidity}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading tag data...</p>
      )}
    </div>
  );
}

export default RpidTagPage;

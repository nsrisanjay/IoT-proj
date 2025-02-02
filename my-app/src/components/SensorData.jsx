// components/SensorData.js
import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import mqtt from 'mqtt';
import SigV4Utils from '../SigV4Utils';
import './SensorData.css';

function SensorData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Configure AWS Credentials using Cognito Identity Pool
    AWS.config.region = 'us-east-1'; // Your AWS region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Your Identity Pool ID
    });

    AWS.config.credentials.get(function(err) {
      if (err) {
        console.error('Error retrieving credentials:', err);
        return;
      }

      const requestUrl = SigV4Utils.getSignedUrl(
        'wss', // Protocol
        'al7os2hrhzii1-ats.iot.us-east-1.amazonaws.com', // Your AWS IoT endpoint
        '443', // Port
        AWS.config.credentials.accessKeyId,
        AWS.config.credentials.secretAccessKey,
        AWS.config.credentials.sessionToken
      );

      const client = mqtt.connect(requestUrl);

      client.on('connect', function() {
        console.log('Connected to AWS IoT');

        client.subscribe('sensor/data', function(err) {
          if (err) {
            console.error('Subscription error:', err);
          } else {
            console.log('Subscribed to sensor/data');
          }
        });
      });

      client.on('message', function(topic, payload) {
        console.log('Message received:', payload.toString());
        const message = JSON.parse(payload.toString());
        setData(message);
      });

      client.on('error', function(err) {
        console.error('Connection error:', err);
      });

      // Clean up on component unmount
      return () => {
        client.end();
      };
    });
  }, []);

  return (
    <div className="sensor-data">
      <h1>Sensor Data</h1>
      {data ? (
        <div className="data-display">
          <p>Temperature: {data.temperature}°C</p>
          <p>Humidity: {data.humidity}%</p>
          <p>Gas Alert: {data.gas_alert ? 'Yes' : 'No'}</p>
          <p>Timestamp: {new Date(data.timestamp * 1000).toLocaleString()}</p>
        </div>
      ) : (
        <p>Waiting for data...</p>
      )}
    </div>
  );
}

export default SensorData;

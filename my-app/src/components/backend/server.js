// server/server.js
const awsIot = require('aws-iot-device-sdk');
const WebSocket = require('ws');

// Configure AWS IoT client
const device = awsIot.device({
  keyPath: "C:\\Users\\nsris\\Downloads\\da551083848343e65e79db2c891b366f7f6401150e7f838be1c3033fc3978000-private.pem.key",
  certPath: "C:\\Users\\nsris\\Downloads\\da551083848343e65e79db2c891b366f7f6401150e7f838be1c3033fc3978000-certificate.pem.crt",
  caPath: "C:\\Users\\nsris\\Downloads\\AmazonRootCA1.pem",
  clientId: "nodejsClient",
  host: "al7os2hrhzii1-ats.iot.us-east-1.amazonaws.com"
});

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Handle WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Connect to AWS IoT
device.on('connect', function() {
  console.log('Connected to AWS IoT');
  device.subscribe('sensor/data');
});

// Handle incoming AWS IoT messages
device.on('message', function(topic, payload) {
  console.log(`Message received on ${topic}:`, payload.toString());

  // Parse JSON data
  const data = JSON.parse(payload.toString());

  // Broadcast data to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
});

// Handle errors
device.on('error', (error) => {
  console.error('AWS IoT Client Error:', error);
});

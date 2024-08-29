import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000'; // FastAPI backend URL

function App() {
  const [jointAngles, setJointAngles] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch welcome message
    fetch(`${API_BASE_URL}/`)
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching message:', error));

    // Fetch joint angles
    fetch(`${API_BASE_URL}/api/joint_angles`)
      .then(response => response.json())
      .then(data => setJointAngles(data))
      .catch(error => console.error('Error fetching joint angles:', error));
  }, []);

  return (
    <div className="App">
      <h1>Robot Arm Simulation</h1>
      <p>{message}</p>
      {jointAngles ? (
        <div>
          <h2>Joint Angles:</h2>
          <ul>
            {Object.entries(jointAngles).map(([joint, angle]) => (
              <li key={joint}>{joint}: {angle} degrees</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading joint angles...</p>
      )}
    </div>
  );
}

export default App;
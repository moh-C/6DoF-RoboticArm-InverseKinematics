import React, { useState, useEffect } from 'react';
import DHParameters from './components/DHParameters';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [jointAngles, setJointAngles] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/`)
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching message:', error));

    fetch(`${API_BASE_URL}/api/joint_angles`)
      .then(response => response.json())
      .then(data => setJointAngles(data))
      .catch(error => console.error('Error fetching joint angles:', error));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">{message}</h1>
      {jointAngles ? (
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Joint Angles</h2>
          <ul className="grid grid-cols-2 gap-4">
            {Object.entries(jointAngles).map(([joint, angle]) => (
              <li key={joint} className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
                <span className="font-semibold text-gray-700">{joint}:</span>
                <span className="text-blue-600">{angle} degrees</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-gray-600">Loading joint angles...</p>
      )}
      <DHParameters />
    </div>
  );
}

export default App;
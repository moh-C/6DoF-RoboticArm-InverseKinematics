import { useState, useEffect } from 'react';

const useRobotData = () => {
  const [jointAngles, setJointAngles] = useState([0, 0, 0, 0, 0, 0]);
  const [dhParams, setDhParams] = useState([
    [0, -90, 10, 0],
    [50, 0, 0, -90],
    [0, -90, 5, 0],
    [0, 90, 50, 0],
    [0, -90, 0, 0],
    [0, 0, 40, 180],
  ]);

  const fetchJointAngles = async () => {
    try {
      const response = await fetch('/api/joint_angles');
      if (!response.ok) throw new Error('Failed to fetch joint angles');
      const data = await response.json();
      setJointAngles(Object.values(data));
    } catch (error) {
      console.error('Error fetching joint angles:', error);
    }
  };

  // const fetchDhParams = async () => {
  //   try {
  //     const response = await fetch('/api/dh_params');
  //     if (!response.ok) throw new Error('Failed to fetch DH parameters');
  //     const data = await response.json();
  //     setDhParams(data.dh_params);
  //   } catch (error) {
  //     console.error('Error fetching DH parameters:', error);
  //   }
  // };

  const fetchDhParams = async () => {
    try {
      // const response = await fetch(`${API_BASE_URL}/api/dh_parameters`);
      const response = await fetch('http://localhost:8000/api/dh_parameters', {
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const text = await response.text();
      console.log('Response text:', text);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      try {
        const data = JSON.parse(text);
        setDhParams(data.dh_params);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      console.error('Error fetching DH parameters:', error);
      // Optionally set some default DH parameters or show an error message to the user
    }
  };

  const sendToBackend = async (newJointAngles) => {
    try {
      const response = await fetch('/api/joint_angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joint_angles: newJointAngles }),
      });
      if (!response.ok) throw new Error('Failed to update joint angles');
      const data = await response.json();
      setJointAngles(newJointAngles);
    } catch (error) {
      console.error('Error sending joint angles to backend:', error);
    }
  };

  useEffect(() => {
    fetchJointAngles();
    fetchDhParams();
  }, []);

  return {
    jointAngles,
    setJointAngles,
    dhParams,
    setDhParams,
    sendToBackend
  };
};

export default useRobotData;
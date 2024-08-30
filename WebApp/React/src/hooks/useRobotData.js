import { useState, useEffect } from 'react';

const useRobotData = () => {
  const [jointAngles, setJointAngles] = useState([0, 0, 0, 0, 0, 0]);
  const [dhParams, setDhParams] = useState([
    [0, 90, 10, 0],
    [50, 0, 0, 90],
    [50, 0, 0, -90],
    [0, 90, 10, -90],
    [0, -90, 10, 0],
    [0, 0, 10, 0],
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

  const fetchDhParams = async () => {
    try {
      const response = await fetch('/api/dh_params');
      if (!response.ok) throw new Error('Failed to fetch DH parameters');
      const data = await response.json();
      setDhParams(data.dh_params);
    } catch (error) {
      console.error('Error fetching DH parameters:', error);
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
      console.log('Backend response:', data);
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
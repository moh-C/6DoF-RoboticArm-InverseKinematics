import React, { useState, useEffect } from 'react';
import { FiRotateCcw, FiSend, FiDownload } from 'react-icons/fi';
import { getJointAngles, setJointAngles } from '../../api/apiInterface';

const JointAngles = ({ setJointAngles: updateParentJointAngles }) => {
  const [jointAngles, setLocalJointAngles] = useState([0, 0, 0, 0, 0, 0]);
  const [isPolling, setIsPolling] = useState(true);

  const handleChange = (index, value) => {
    const newAngles = [...jointAngles];
    newAngles[index] = Number(value);
    setLocalJointAngles(newAngles);
    updateParentJointAngles(newAngles);
  };

  const resetAngles = () => {
    const resetAngles = [0, 0, 0, 0, 0, 0];
    setLocalJointAngles(resetAngles);
    updateParentJointAngles(resetAngles);
  };

  const fetchAngles = async () => {
    try {
      const data = await getJointAngles();
      setLocalJointAngles(data.joint_angles);
      updateParentJointAngles(data.joint_angles);
    } catch (error) {
      console.error('Error fetching joint angles:', error);
      setIsPolling(false);
      alert('Failed to fetch joint angles. Polling has been stopped.');
    }
  };

  useEffect(() => {
    let intervalId;
    if (isPolling) {
      intervalId = setInterval(fetchAngles, 1000); // Poll every second
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling]);

  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  const sendToBackend = async () => {
    try {
      await setJointAngles(jointAngles);
    } catch (error) {
      alert('Failed to send joint angles. Please try again.');
    }
  };

  const getColor = (angle) => {
    // Normalize the angle to a 0-1 range
    const normalizedAngle = (angle + 180) / 360;

    // Define color stops
    const colors = [
      { pos: 0, r: 41, g: 121, b: 255 },  // Blue
      { pos: 0.25, r: 0, g: 255, b: 204 }, // Cyan
      { pos: 0.5, r: 46, g: 213, b: 115 },  // Green
      { pos: 0.75, r: 255, g: 204, b: 0 },  // Yellow
      { pos: 1, r: 255, g: 71, b: 87 }   // Red
    ];

    // Find the two colors to interpolate between
    let lower = colors[0];
    let upper = colors[colors.length - 1];
    for (let i = 0; i < colors.length - 1; i++) {
      if (normalizedAngle >= colors[i].pos && normalizedAngle <= colors[i + 1].pos) {
        lower = colors[i];
        upper = colors[i + 1];
        break;
      }
    }

    // Interpolate between the two colors
    const range = upper.pos - lower.pos;
    const rangePct = (normalizedAngle - lower.pos) / range;
    const pctLower = 1 - rangePct;
    const pctUpper = rangePct;

    const r = Math.floor(lower.r * pctLower + upper.r * pctUpper);
    const g = Math.floor(lower.g * pctLower + upper.g * pctUpper);
    const b = Math.floor(lower.b * pctLower + upper.b * pctUpper);

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Joint Angles</h2>
      <div className="space-y-2">
        {jointAngles.map((angle, index) => (
          <div key={index} className="bg-white p-2 rounded-lg shadow-sm flex items-center text-sm">
            <div className="w-1/6 font-semibold text-gray-700">
              Joint {index + 1}
            </div>
            <div className="w-4/6 px-2">
              <div className="relative">
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={angle}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-full h-1 bg-transparent rounded-md appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${getColor(-180)}, ${getColor(-90)}, ${getColor(0)}, ${getColor(90)}, ${getColor(180)})`,
                  }}
                />
                <div className="absolute -bottom-4 left-0 w-full flex justify-between text-xs text-gray-500">
                  <span>-180°</span>
                  <span>0°</span>
                  <span>180°</span>
                </div>
              </div>
            </div>
            <div className="w-1/6 flex justify-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-xs"
                style={{ backgroundColor: getColor(angle) }}
              >
                {angle}°
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={resetAngles}
          className="flex items-center px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition duration-300"
        >
          <FiRotateCcw className="mr-1" />
          Reset
        </button>
        <button
          onClick={togglePolling}
          className={`flex items-center px-3 py-1 text-white text-sm rounded-md transition duration-300 ${isPolling ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
            }`}
        >
          <FiDownload className="mr-1" />
          {isPolling ? 'Stop Auto-update' : 'Start Auto-update'}
        </button>
        <button
          onClick={sendToBackend}
          className="flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition duration-300"
        >
          <FiSend className="mr-1" />
          Send
        </button>
      </div>
    </div>
  );
};

export default JointAngles;
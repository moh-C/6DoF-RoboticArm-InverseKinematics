import React from 'react';
import { FiRotateCcw, FiSend, FiDownload  } from 'react-icons/fi';

const JointAngles = ({ jointAngles, setJointAngles, sendToBackend }) => {
  const handleChange = (index, value) => {
    const newAngles = [...jointAngles];
    newAngles[index] = Number(value);
    setJointAngles(newAngles);
  };

  const resetAngles = () => {
    setJointAngles([0, 0, 0, 0, 0, 0]);
  };

  const fetchAngles = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/joint_angles');
      if (!response.ok) {
        throw new Error('Failed to fetch joint angles');
      }
      const data = await response.json();
      const angles = [
        data.joint1,
        data.joint2,
        data.joint3,
        data.joint4,
        data.joint5,
        data.joint6
      ];
      setJointAngles(angles);
    } catch (error) {
      console.error('Error fetching joint angles:', error);
      // User-facing error handling
      alert('Failed to fetch joint angles. Please try again.');
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
                  min="-120"
                  max="120"
                  value={angle}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-full h-1 bg-transparent rounded-md appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${getColor(-120)}, ${getColor(-60)}, ${getColor(0)}, ${getColor(60)}, ${getColor(120)})`,
                  }}
                />
                <div className="absolute -bottom-4 left-0 w-full flex justify-between text-xs text-gray-500">
                  <span>-120°</span>
                  <span>0°</span>
                  <span>120°</span>
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
      <div className="mt-6 flex justify-between">
        <button
          onClick={resetAngles}
          className="flex items-center px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition duration-300"
        >
          <FiRotateCcw className="mr-1" />
          Reset
        </button>
        <button
          onClick={fetchAngles}
          className="flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition duration-300"
        >
          <FiDownload className="mr-1" />
          Fetch
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
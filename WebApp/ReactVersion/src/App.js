import React, { useState, useEffect } from 'react';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import * as math from 'mathjs';
import Plotly from 'plotly.js-gl3d-dist';

function App() {
  const [jointAngles, setJointAngles] = useState([0, 0, 0, 0, 0, 0]);
  const [dhParams, setDhParams] = useState([
    [0, 90, 0.0, 0],
    [50, 0, 0, 90],
    [50, 0, 0, -90],
    [0, 90, 10, -90],
    [0, -90, 10, 0],
    [0, 0, 10, 0],
  ]);
  const [endEffectorPosition, setEndEffectorPosition] = useState({ x: 0, y: 0, z: 0, roll: 0, pitch: 0, yaw: 0 });

  useEffect(() => {
    updateSimulation();
  }, [jointAngles, dhParams]);

  function dh_matrix(a, alpha, d, theta) {
    // ... (same as before)
  }

  function forward_kinematics(thetas, dh_params) {
    // ... (same as before)
  }

  function updateSimulation() {
    // ... (similar to before, but update state instead of DOM)
    const result = forward_kinematics(jointAngles, dhParams);
    const positions = result.positions;
    const T = result.T;

    // Calculate end-effector position and orientation
    const end_pos = math.subset(T, math.index([0, 1, 2], 3)).toArray().map(Number);
    // ... (calculate roll, pitch, yaw)

    setEndEffectorPosition({
      x: end_pos[0],
      y: end_pos[1],
      z: end_pos[2],
      roll: roll * 180 / Math.PI,
      pitch: pitch * 180 / Math.PI,
      yaw: yaw * 180 / Math.PI,
    });

    // Update plot
    const traces = []; // ... (create traces similar to before)
    Plotly.react("plotDiv", traces, layout);
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <LeftPanel
        jointAngles={jointAngles}
        setJointAngles={setJointAngles}
        dhParams={dhParams}
        setDhParams={setDhParams}
        endEffectorPosition={endEffectorPosition}
      />
      <RightPanel />
    </div>
  );
}

export default App;
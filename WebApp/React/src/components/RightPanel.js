import React, { useEffect, useRef, useState, useCallback } from 'react';
import Plotly from 'plotly.js-gl3d-dist';

const jointColors = [
  "#FF4136", "#FF851B", "#FFDC00", "#2ECC40", "#0074D9", "#B10DC9"
];

const FETCH_INTERVAL = 100; // Fetch every 100ms

const RightPanel = ({ jointAngles }) => {
  const plotDiv = useRef(null);
  const [jointPositions, setJointPositions] = useState([]);
  const [endEffectorInfo, setEndEffectorInfo] = useState({});
  const [error, setError] = useState(null);

  const fetchJointPositions = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/joint_positions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setJointPositions(data);
      setEndEffectorInfo(data[data.length - 1]); // Assume last position is end effector
      setError(null); // Clear any previous errors
    } catch (e) {
      console.error("Failed to fetch joint positions:", e);
      setError("Failed to fetch joint positions. Please check the server connection.");
    }
  }, []);

  useEffect(() => {
    fetchJointPositions(); // Fetch immediately on mount or jointAngles change

    const intervalId = setInterval(fetchJointPositions, FETCH_INTERVAL);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [fetchJointPositions, jointAngles]);

  const createEndEffectorOverlay = () => {
    const { x, y, z } = endEffectorInfo;
    return {
      x: 1,
      y: 0,
      xref: 'paper',
      yref: 'paper',
      xanchor: 'right',
      yanchor: 'bottom',
      text: [
        '<b>End Effector Position</b>',
        `X: ${x?.toFixed(2) ?? 'N/A'}`,
        `Y: ${y?.toFixed(2) ?? 'N/A'}`,
        `Z: ${z?.toFixed(2) ?? 'N/A'}`,
      ].join('<br>'),
      font: {
        family: 'Arial, sans-serif',
        size: 12,
        color: 'white'
      },
      bgcolor: 'rgba(0,0,0,0.7)',
      bordercolor: 'rgba(255,255,255,0.5)',
      borderwidth: 2,
      borderpad: 4,
      align: 'left',
      showarrow: false
    };
  };

  const layout = {
    scene: {
      aspectmode: "cube",
      xaxis: { range: [-10, 70], showgrid: true, zeroline: true, title: 'X' },
      yaxis: { range: [-10, 70], showgrid: true, zeroline: true, title: 'Y' },
      zaxis: { range: [0, 70], showgrid: true, zeroline: true, title: 'Z' },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 },
        center: { x: 0, y: 0, z: 0 },
        up: { x: 0, y: 0, z: 1 }
      }
    },
    margin: { l: 0, r: 0, b: 0, t: 0 },
    showlegend: true,
    legend: {
      x: 0,
      y: 1,
      traceorder: 'normal',
      font: { size: 12 },
      bordercolor: '#FFFFFF',
      borderwidth: 2
    },
    annotations: []
  };

  const createTraces = () => {
    let traces = [];

    // Create arm segments
    for (let i = 0; i < jointPositions.length - 1; i++) {
      traces.push({
        x: [jointPositions[i].x, jointPositions[i + 1].x],
        y: [jointPositions[i].y, jointPositions[i + 1].y],
        z: [jointPositions[i].z, jointPositions[i + 1].z],
        mode: "lines",
        type: "scatter3d",
        line: { color: jointColors[i], width: 10 },
        name: `Segment ${i + 1}`,
      });
    }

    // Create joints
    traces.push({
      x: jointPositions.map(p => p.x),
      y: jointPositions.map(p => p.y),
      z: jointPositions.map(p => p.z),
      mode: "markers",
      type: "scatter3d",
      marker: {
        size: 12,
        color: jointColors,
        symbol: 'sphere',
      },
      name: "Joints",
    });

    return traces;
  };

  const createEndEffectorTraces = () => {
    const { x, y, z } = endEffectorInfo;
    const arrowLength = 10;
    const arrowHeadLength = 2;

    const createArrow = (dir, color, name) => {
      const end = [x + dir[0] * arrowLength, y + dir[1] * arrowLength, z + dir[2] * arrowLength];

      return [
        {
          type: "scatter3d",
          x: [x, end[0]],
          y: [y, end[1]],
          z: [z, end[2]],
          mode: "lines",
          line: { color: color, width: 5 },
          name: name
        },
        {
          type: "cone",
          x: [end[0]],
          y: [end[1]],
          z: [end[2]],
          u: [dir[0] * arrowHeadLength],
          v: [dir[1] * arrowHeadLength],
          w: [dir[2] * arrowHeadLength],
          colorscale: [[0, color], [1, color]],
          showscale: false,
          sizemode: "absolute",
          sizeref: 2,
          anchor: "tip",
          name: name + " head"
        }
      ];
    };

    return [
      ...createArrow([1, 0, 0], "red", "X-axis"),
      ...createArrow([0, 1, 0], "green", "Y-axis"),
      ...createArrow([0, 0, 1], "blue", "Z-axis"),
      {
        type: "scatter3d",
        x: [x],
        y: [y],
        z: [z],
        mode: "markers",
        marker: {
          size: 8,
          color: "purple",
          symbol: "circle",
        },
        name: "End Effector"
      }
    ];
  };

  useEffect(() => {
    if (plotDiv.current && jointPositions.length > 0) {
      const traces = createTraces();
      const endEffectorTraces = createEndEffectorTraces();
      const overlay = createEndEffectorOverlay();

      const updatedLayout = {
        ...layout,
        annotations: [overlay]
      };

      Plotly.react(plotDiv.current, [...traces, ...endEffectorTraces], updatedLayout);
    }
  }, [jointPositions]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div ref={plotDiv} style={{ width: '100%', height: '100%' }} />;
};

export default RightPanel;
import React, { useEffect, useRef, useCallback } from 'react';
import Plotly from 'plotly.js-gl3d-dist';
import { forwardKinematics, createTraces, createEndEffectorTraces, endEffectorPositionOrientation } from './kinematicsFunctions';

const RightPanel = ({ jointAngles, dhParams }) => {
  const plotDiv = useRef(null);

  const createEndEffectorOverlay = (endEffectorInfo) => {
    const { position, orientation } = endEffectorInfo;
    return {
      x: 1,
      y: 0,
      xref: 'paper',
      yref: 'paper',
      xanchor: 'right',
      yanchor: 'bottom',
      text: [
        '<b>End Effector Position</b>',
        `X: ${position.x.toFixed(2)}`,
        `Y: ${position.y.toFixed(2)}`,
        `Z: ${position.z.toFixed(2)}`,
        '<b>End Effector Orientation</b>',
        `Roll: ${orientation.roll.toFixed(2)}°`,
        `Pitch: ${orientation.pitch.toFixed(2)}°`,
        `Yaw: ${orientation.yaw.toFixed(2)}°`
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
      xaxis: { range: [-115, 115], showgrid: true, zeroline: true, title: 'X' },
      yaxis: { range: [-115, 115], showgrid: true, zeroline: true, title: 'Y' },
      zaxis: { range: [-115, 115], showgrid: true, zeroline: true, title: 'Z' },
      camera: {
        eye: { x: 0.75, y: 0.5, z: 0.5 },
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

  const updatePlot = useCallback(() => {
    if (plotDiv.current) {
      // console.log("Joint Angles:", jointAngles);
      // console.log("DH Parameters:", dhParams);

      const result = forwardKinematics(jointAngles, dhParams);
      const { positions, T } = result;

      // console.log("Final Positions:", positions);
      // console.log("Final Transformation Matrix:", T.toString());

      const traces = createTraces(positions);
      const endEffectorTraces = createEndEffectorTraces(T);

      // Calculate end effector position and orientation
      const endEffectorInfo = endEffectorPositionOrientation(T);
      // console.log("End Effector Info:", endEffectorInfo);

      // Create the end effector overlay
      const overlay = createEndEffectorOverlay(endEffectorInfo);

      // Update layout with the new overlay
      const updatedLayout = {
        ...layout,
        annotations: [overlay]
      };

      // Update plot
      Plotly.react(plotDiv.current, [...traces, ...endEffectorTraces], updatedLayout);
    }
  }, [jointAngles, dhParams]);

  useEffect(() => {
    updatePlot();
  }, [updatePlot]);

  return <div ref={plotDiv} style={{ width: '100%', height: '100%' }} />;
};

export default RightPanel;
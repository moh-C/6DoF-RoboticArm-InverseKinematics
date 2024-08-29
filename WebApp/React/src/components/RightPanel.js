import React, { useEffect, useRef, useCallback } from 'react';
import Plotly from 'plotly.js-gl3d-dist';
import { forwardKinematics, createTraces, createEndEffectorTraces } from './kinematicsFunctions';

const RightPanel = ({ jointAngles, dhParams }) => {
  const plotDiv = useRef(null);

  const updatePlot = useCallback(() => {
    if (plotDiv.current) {
      const result = forwardKinematics(jointAngles, dhParams);
      const { positions, T } = result;

      const traces = createTraces(positions);
      const endEffectorTraces = createEndEffectorTraces(T);

      Plotly.react(plotDiv.current, [...traces, ...endEffectorTraces], layout);
    }
  }, [jointAngles, dhParams]);

  useEffect(() => {
    updatePlot();
  }, [updatePlot]);

  const layout = {
    scene: {
      aspectmode: "cube",
      xaxis: { range: [-115, 115], showgrid: true, zeroline: true },
      yaxis: { range: [-115, 115], showgrid: true, zeroline: true },
      zaxis: { range: [-115, 115], showgrid: true, zeroline: true },
    },
    margin: { l: 0, r: 0, b: 0, t: 0 },
    showlegend: true,
  };

  return <div ref={plotDiv} style={{ width: '100%', height: '100%' }} />;
};

export default RightPanel;
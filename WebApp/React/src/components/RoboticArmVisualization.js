// import React, { useEffect, useRef } from 'react';
// import Plotly from 'plotly.js-gl3d-dist';
// import * as math from 'mathjs';
// import { forwardKinematics } from './kinematicsFunctions';

// const RoboticArmVisualization = ({ jointAngles, dhParams }) => {
//     const plotDiv = useRef(null);

//     useEffect(() => {
//         if (plotDiv.current && jointAngles.length > 0 && dhParams.length > 0) {
//             updatePlot();
//         }
//     }, [jointAngles, dhParams]);

//     const createCylinder = (start, end, radius, color) => {
//         const vec = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
//         const len = Math.sqrt(vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2);
//         const theta = Math.acos(vec[2] / len);
//         const phi = Math.atan2(vec[1], vec[0]);

//         const x = [];
//         const y = [];
//         const z = [];

//         for (let i = 0; i <= 360; i += 10) {
//             const r = i * Math.PI / 180;
//             x.push(radius * Math.cos(r));
//             y.push(radius * Math.sin(r));
//             z.push(0);
//             x.push(radius * Math.cos(r));
//             y.push(radius * Math.sin(r));
//             z.push(len);
//         }

//         return {
//             type: 'mesh3d',
//             x: x,
//             y: y,
//             z: z,
//             i: [],
//             j: [],
//             k: [],
//             color: color,
//             opacity: 0.8,
//             transform: {
//                 type: 'rotate',
//                 roll: 0,
//                 pitch: theta,
//                 yaw: phi,
//                 x: start[0],
//                 y: start[1],
//                 z: start[2]
//             }
//         };
//     };

//     const createSphere = (center, radius, color) => {
//         return {
//             type: 'mesh3d',
//             x: [center[0]],
//             y: [center[1]],
//             z: [center[2]],
//             alphahull: 0,
//             color: color,
//             opacity: 0.8,
//             size: radius
//         };
//     };

//     const updatePlot = () => {
//         const result = forwardKinematics(jointAngles, dhParams);
//         const { positions, T } = result;

//         const traces = [];

//         // Add cylinders for arm segments
//         for (let i = 0; i < positions.length - 1; i++) {
//             traces.push(createCylinder(positions[i], positions[i + 1], 5, `hsl(${i * 60}, 70%, 50%)`));
//         }

//         // Add spheres for joints
//         positions.forEach((pos, i) => {
//             traces.push(createSphere(pos, 8, `hsl(${i * 60}, 100%, 30%)`));
//         });

//         // Add end effector orientation arrows
//         const arrowScale = 20;
//         const endPos = positions[positions.length - 1];
//         const xDir = math.subset(T, math.index([0, 1, 2], 0)).toArray().map(Number);
//         const yDir = math.subset(T, math.index([0, 1, 2], 1)).toArray().map(Number);
//         const zDir = math.subset(T, math.index([0, 1, 2], 2)).toArray().map(Number);

//         traces.push({
//             type: 'cone',
//             x: [endPos[0]], y: [endPos[1]], z: [endPos[2]],
//             u: [xDir[0] * arrowScale], v: [xDir[1] * arrowScale], w: [xDir[2] * arrowScale],
//             colorscale: [[0, 'red'], [1, 'red']], sizemode: 'absolute', sizeref: 3
//         });
//         traces.push({
//             type: 'cone',
//             x: [endPos[0]], y: [endPos[1]], z: [endPos[2]],
//             u: [yDir[0] * arrowScale], v: [yDir[1] * arrowScale], w: [yDir[2] * arrowScale],
//             colorscale: [[0, 'green'], [1, 'green']], sizemode: 'absolute', sizeref: 3
//         });
//         traces.push({
//             type: 'cone',
//             x: [endPos[0]], y: [endPos[1]], z: [endPos[2]],
//             u: [zDir[0] * arrowScale], v: [zDir[1] * arrowScale], w: [zDir[2] * arrowScale],
//             colorscale: [[0, 'blue'], [1, 'blue']], sizemode: 'absolute', sizeref: 3
//         });

//         const layout = {
//             scene: {
//                 aspectmode: "data",
//                 xaxis: { range: [-100, 100] },
//                 yaxis: { range: [-100, 100] },
//                 zaxis: { range: [-100, 100] },
//             },
//             margin: { l: 0, r: 0, b: 0, t: 0 },
//             showlegend: false,
//         };

//         Plotly.react(plotDiv.current, traces, layout);
//     };

//     return <div ref={plotDiv} style={{ width: '100%', height: '100%' }} />;
// };

// export default RoboticArmVisualization;
import * as math from 'mathjs';

const jointColors = [
  "#FF4136", "#FF851B", "#FFDC00", "#2ECC40", "#0074D9", "#B10DC9"
];

function dhMatrix(a, alpha, d, theta) {
  theta = math.unit(theta, "deg").toNumber("rad");
  alpha = math.unit(alpha, "deg").toNumber("rad");
  return math.matrix([
    [
      math.cos(theta),
      -math.sin(theta) * math.cos(alpha),
      math.sin(theta) * math.sin(alpha),
      a * math.cos(theta),
    ],
    [
      math.sin(theta),
      math.cos(theta) * math.cos(alpha),
      -math.cos(theta) * math.sin(alpha),
      a * math.sin(theta),
    ],
    [0, math.sin(alpha), math.cos(alpha), d],
    [0, 0, 0, 1],
  ]);
}

export function forwardKinematics(thetas, dhParams) {
  let T = math.identity(4);
  let positions = [[0, 0, 0]];

  for (let i = 0; i < dhParams.length; i++) {
    let [a, alpha, d, theta_offset] = dhParams[i];
    let theta = thetas[i] + theta_offset;
    let T_i = dhMatrix(a, alpha, d, theta);
    T = math.multiply(T, T_i);
    positions.push(
      math.subset(T, math.index([0, 1, 2], 3)).toArray().map(Number)
    );
  }

  return { positions, T };
}

export function createTraces(positions) {
  let traces = [];
  for (let i = 0; i < positions.length - 1; i++) {
    traces.push({
      x: [positions[i][0], positions[i + 1][0]],
      y: [positions[i][1], positions[i + 1][1]],
      z: [positions[i][2], positions[i + 1][2]],
      mode: "lines+markers",
      type: "scatter3d",
      line: { color: jointColors[i], width: 6 },
      marker: { size: 8, color: jointColors[i] },
      name: `Joint ${i + 1}`,
    });
  }
  return traces;
}

export function createEndEffectorTraces(T) {
  const arrowScale = 5;
  const arrowLength = 50;
  
  const endPos = math.subset(T, math.index([0, 1, 2], 3)).toArray().map(Number);
  const xDir = math.subset(T, math.index([0, 1, 2], 0)).toArray().map(Number);
  const yDir = math.subset(T, math.index([0, 1, 2], 1)).toArray().map(Number);
  const zDir = math.subset(T, math.index([0, 1, 2], 2)).toArray().map(Number);

  return [
    {
      type: "cone",
      x: [endPos[0]],
      y: [endPos[1]],
      z: [endPos[2]],
      u: [xDir[0] * arrowLength],
      v: [xDir[1] * arrowLength],
      w: [xDir[2] * arrowLength],
      colorscale: [[0, "red"], [1, "red"]],
      showscale: false,
      sizemode: "absolute",
      sizeref: arrowScale,
      anchor: "tail",
      name: "X-axis",
    },
    {
      type: "cone",
      x: [endPos[0]],
      y: [endPos[1]],
      z: [endPos[2]],
      u: [yDir[0] * arrowLength],
      v: [yDir[1] * arrowLength],
      w: [yDir[2] * arrowLength],
      colorscale: [[0, "green"], [1, "green"]],
      showscale: false,
      sizemode: "absolute",
      sizeref: arrowScale,
      anchor: "tail",
      name: "Y-axis",
    },
    {
      type: "cone",
      x: [endPos[0]],
      y: [endPos[1]],
      z: [endPos[2]],
      u: [zDir[0] * arrowLength],
      v: [zDir[1] * arrowLength],
      w: [zDir[2] * arrowLength],
      colorscale: [[0, "blue"], [1, "blue"]],
      showscale: false,
      sizemode: "absolute",
      sizeref: arrowScale,
      anchor: "tail",
      name: "Z-axis",
    },
  ];
}
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

  // console.log("Initial T:", T.toString());

  for (let i = 0; i < dhParams.length; i++) {
    let [a, alpha, d, theta_offset] = dhParams[i];
    let theta = thetas[i] + theta_offset;
    let T_i = dhMatrix(a, alpha, d, theta);
    // console.log(`Joint ${i + 1} DH Matrix:`, T_i.toString());
    T = math.multiply(T, T_i);
    // console.log(`Cumulative T after Joint ${i + 1}:`, T.toString());
    positions.push(
      math.subset(T, math.index([0, 1, 2], 3)).toArray().map(Number)
    );
  }

  // console.log("Final T:", T.toString());
  return { positions, T };
}

export function createTraces(positions) {
  let traces = [];

  // Create arm segments
  for (let i = 0; i < positions.length - 1; i++) {
    traces.push({
      x: [positions[i][0], positions[i + 1][0]],
      y: [positions[i][1], positions[i + 1][1]],
      z: [positions[i][2], positions[i + 1][2]],
      mode: "lines",
      type: "scatter3d",
      line: { color: jointColors[i], width: 10 },  // Increased width for visibility
      name: `Segment ${i + 1}`,
    });
  }

  // Create joints
  traces.push({
    x: positions.map(p => p[0]),
    y: positions.map(p => p[1]),
    z: positions.map(p => p[2]),
    mode: "markers",
    type: "scatter3d",
    marker: {
      size: 12,  // Increased size for visibility
      color: jointColors,
      symbol: 'sphere',
    },
    name: "Joints",
  });

  return traces;
}

export function createEndEffectorTraces(T) {
  const arrowLength = 20; // Adjust this value to change the length of the arrows
  const arrowHeadLength = 3; // Length of the arrowhead cone
  const endPos = math.subset(T, math.index([0, 1, 2], 3)).toArray().map(Number);
  const xDir = math.subset(T, math.index([0, 1, 2], 0)).toArray().map(Number);
  const yDir = math.subset(T, math.index([0, 1, 2], 1)).toArray().map(Number);
  const zDir = math.subset(T, math.index([0, 1, 2], 2)).toArray().map(Number);

  const createArrow = (dir, color, name) => {
    const end = [
      endPos[0] + dir[0] * arrowLength,
      endPos[1] + dir[1] * arrowLength,
      endPos[2] + dir[2] * arrowLength
    ];

    return [
      // Arrow shaft
      {
        type: "scatter3d",
        x: [endPos[0], end[0]],
        y: [endPos[1], end[1]],
        z: [endPos[2], end[2]],
        mode: "lines",
        line: {
          color: color,
          width: 5
        },
        name: name
      },
      // Arrowhead
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
    ...createArrow(xDir, "red", "X-axis"),
    ...createArrow(yDir, "green", "Y-axis"),
    ...createArrow(zDir, "blue", "Z-axis"),
    {
      type: "scatter3d",
      x: [endPos[0]],
      y: [endPos[1]],
      z: [endPos[2]],
      mode: "markers",
      marker: {
        size: 8,
        color: "purple",
        symbol: "circle",
      },
      name: "End Effector"
    }
  ];
}

export function endEffectorPositionOrientation(T) {
  // Extract position (X, Y, Z)
  const position = math.subset(T, math.index([0, 1, 2], 3)).toArray().map(Number);

  // Extract rotation matrix
  const R = math.subset(T, math.index([0, 1, 2], [0, 1, 2]));

  // Calculate pitch (rotation around Y-axis)
  const pitch = math.atan2(-R.get([2, 0]), math.sqrt(R.get([2, 1]) ** 2 + R.get([2, 2]) ** 2));

  // Calculate yaw (rotation around Z-axis)
  const yaw = math.atan2(R.get([1, 0]), R.get([0, 0]));

  // Calculate roll (rotation around X-axis)
  const roll = math.atan2(R.get([2, 1]), R.get([2, 2]));

  // Convert radians to degrees
  const rollDeg = roll * (180 / Math.PI);
  const pitchDeg = pitch * (180 / Math.PI);
  const yawDeg = yaw * (180 / Math.PI);

  return {
    position: {
      x: position[0],
      y: position[1],
      z: position[2]
    },
    orientation: {
      roll: rollDeg,
      pitch: pitchDeg,
      yaw: yawDeg
    }
  };
}
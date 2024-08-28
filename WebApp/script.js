// DH matrix calculation
function dh_matrix(a, alpha, d, theta) {
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

// Forward kinematics
function forward_kinematics(thetas, dh_params) {
  let T = math.identity(4);
  let positions = [[0, 0, 0]];

  for (let i = 0; i < dh_params.length; i++) {
    let [a, alpha, d, theta_offset] = dh_params[i];
    let theta = thetas[i] + theta_offset;
    let T_i = dh_matrix(a, alpha, d, theta);
    T = math.multiply(T, T_i);
    positions.push(
      math
        .subset(T, math.index([0, 1, 2], 3))
        .toArray()
        .map(Number)
    );
  }

  return { positions: positions, T: T };
}

// Initialize DH parameters
let dh_params = [
  [0, 90, 0.0, 0], // Joint 1
  [50, 0, 0, 90], // Joint 2
  [50, 0, 0, -90], // Joint 3
  [0, 90, 10, -90], // Joint 4
  [0, -90, 10, 0], // Joint 5
  [0, 0, 10, 0], // Joint 6
];

let endEffectorTraces = [];

// Joint colors
const jointColors = [
  "#FF4136",
  "#FF851B",
  "#FFDC00",
  "#2ECC40",
  "#0074D9",
  "#B10DC9",
];

// Create input fields for joint angles
let jointInputs = document.getElementById("jointInputs");
for (let i = 0; i < 6; i++) {
  let jointControl = document.createElement("div");
  jointControl.className = "joint-control";

  let label = document.createElement("label");
  label.htmlFor = `joint${i + 1}`;
  label.textContent = `Joint ${i + 1}: `;
  jointControl.appendChild(label);

  let sliderContainer = document.createElement("div");
  sliderContainer.className = "slider-container";

  let slider = document.createElement("input");
  slider.type = "range";
  slider.id = `joint${i + 1}-slider`;
  slider.min = -180;
  slider.max = 180;
  slider.value = 0;
  slider.addEventListener("input", function () {
    document.getElementById(`joint${i + 1}`).value = this.value;
    updateSimulation();
  });
  sliderContainer.appendChild(slider);

  let input = document.createElement("input");
  input.type = "number";
  input.id = `joint${i + 1}`;
  input.value = 0;
  input.min = -180;
  input.max = 180;
  input.addEventListener("input", function () {
    document.getElementById(`joint${i + 1}-slider`).value = this.value;
    updateSimulation();
  });
  sliderContainer.appendChild(input);

  jointControl.appendChild(sliderContainer);
  jointInputs.appendChild(jointControl);
}

// Create editable DH parameter table
let dhTable = document.getElementById("dhTable");
for (let i = 0; i < 6; i++) {
  let row = dhTable.insertRow();
  row.insertCell(0).textContent = `Joint ${i + 1}`;
  for (let j = 0; j < 4; j++) {
    let cell = row.insertCell(j + 1);
    let input = document.createElement("input");
    input.type = "number";
    input.value = dh_params[i][j];
    input.step = 0.1;
    cell.appendChild(input);
  }
}

function updateSimulation() {
  // Get joint angles
  let thetas = [];
  for (let i = 0; i < 6; i++) {
    thetas.push(parseFloat(document.getElementById(`joint${i + 1}`).value));
  }

  // Update DH parameters
  let table = document.getElementById("dhTable");
  for (let i = 1; i < table.rows.length; i++) {
    let row = table.rows[i];
    dh_params[i - 1] = [
      parseFloat(row.cells[1].children[0].value),
      parseFloat(row.cells[2].children[0].value),
      parseFloat(row.cells[3].children[0].value),
      parseFloat(row.cells[4].children[0].value),
    ];
  }

  // Perform forward kinematics
  let result = forward_kinematics(thetas, dh_params);
  let positions = result.positions;
  let T = result.T;

  // Calculate end-effector orientation
  let end_pos = math
    .subset(T, math.index([0, 1, 2], 3))
    .toArray()
    .map(Number);
  let x_dir = math
    .subset(T, math.index([0, 1, 2], 0))
    .toArray()
    .map(Number);
  let y_dir = math
    .subset(T, math.index([0, 1, 2], 1))
    .toArray()
    .map(Number);
  let z_dir = math
    .subset(T, math.index([0, 1, 2], 2))
    .toArray()
    .map(Number);

  let pitch = math.atan2(
    -T.get([2, 0]),
    math.sqrt(T.get([0, 0]) ** 2 + T.get([1, 0]) ** 2)
  );
  let roll, yaw;
  if (math.abs(pitch) === math.pi / 2) {
    roll = 0;
    yaw = math.atan2(T.get([0, 1]), T.get([1, 1])) * math.sign(pitch);
  } else {
    roll = math.atan2(T.get([2, 1]), T.get([2, 2]));
    yaw = math.atan2(T.get([1, 0]), T.get([0, 0]));
  }

  // Update plot
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
      name: `Joint ${i + 1}`, // Add this line to set the legend label
    });
  }

  let arrow_scale = 5;
  let arrow_length = 50;

  // Create new end effector traces
  let newEndEffectorTraces = [
    {
      type: "cone",
      x: [end_pos[0]],
      y: [end_pos[1]],
      z: [end_pos[2]],
      u: [x_dir[0] * arrow_length],
      v: [x_dir[1] * arrow_length],
      w: [x_dir[2] * arrow_length],
      colorscale: [
        [0, "red"],
        [1, "red"],
      ],
      showscale: false,
      sizemode: "absolute",
      sizeref: arrow_scale,
      anchor: "tail",
      name: "X-axis", // Add this line
    },
    {
      type: "cone",
      x: [end_pos[0]],
      y: [end_pos[1]],
      z: [end_pos[2]],
      u: [y_dir[0] * arrow_length],
      v: [y_dir[1] * arrow_length],
      w: [y_dir[2] * arrow_length],
      colorscale: [
        [0, "green"],
        [1, "green"],
      ],
      showscale: false,
      sizemode: "absolute",
      sizeref: arrow_scale,
      anchor: "tail",
      name: "Y-axis", // Add this line
    },
    {
      type: "cone",
      x: [end_pos[0]],
      y: [end_pos[1]],
      z: [end_pos[2]],
      u: [z_dir[0] * arrow_length],
      v: [z_dir[1] * arrow_length],
      w: [z_dir[2] * arrow_length],
      colorscale: [
        [0, "blue"],
        [1, "blue"],
      ],
      showscale: false,
      sizemode: "absolute",
      sizeref: arrow_scale,
      anchor: "tail",
      name: "Z-axis", // Add this line
    },
  ];

  traces = traces.concat(newEndEffectorTraces);

  Plotly.react("plotDiv", traces, layout);

  // Update output
  let output = document.getElementById("output");
  output.innerHTML = `
        <div class="end-effector-item">x: ${end_pos[0].toFixed(4)}</div>
        <div class="end-effector-item">y: ${end_pos[1].toFixed(4)}</div>
        <div class="end-effector-item">z: ${end_pos[2].toFixed(4)}</div>
        <div class="end-effector-item">roll: ${math
          .multiply(roll, 180 / math.pi)
          .toFixed(4)}°</div>
        <div class="end-effector-item">pitch: ${math
          .multiply(pitch, 180 / math.pi)
          .toFixed(4)}°</div>
        <div class="end-effector-item">yaw: ${math
          .multiply(yaw, 180 / math.pi)
          .toFixed(4)}°</div>
    `;
}

function resetJointAngles() {
  for (let i = 1; i <= 6; i++) {
    document.getElementById(`joint${i}`).value = 0;
    document.getElementById(`joint${i}-slider`).value = 0;
  }
  updateSimulation();
}

// Create initial plot
let initial_positions = forward_kinematics(
  [0, 0, 0, 0, 0, 0],
  dh_params
).positions;
let traces = [];
for (let i = 0; i < initial_positions.length - 1; i++) {
  traces.push({
    x: [initial_positions[i][0], initial_positions[i + 1][0]],
    y: [initial_positions[i][1], initial_positions[i + 1][1]],
    z: [initial_positions[i][2], initial_positions[i + 1][2]],
    mode: "lines+markers",
    type: "scatter3d",
    line: { color: jointColors[i], width: 6 },
    marker: { size: 8, color: jointColors[i] },
    name: `Joint ${i + 1}`, // Add this line to set the legend label
  });
}

let axLim = 115;
let layout = {
  scene: {
    aspectmode: "cube",
    xaxis: {
      range: [-axLim, axLim],
      showgrid: true,
      gridcolor: "rgb(200, 200, 200)",
      zeroline: true,
      zerolinecolor: "rgb(200, 200, 200)",
      showline: true,
      linecolor: "rgb(100, 100, 100)",
    },
    yaxis: {
      range: [-axLim, axLim],
      showgrid: true,
      gridcolor: "rgb(200, 200, 200)",
      zeroline: true,
      zerolinecolor: "rgb(200, 200, 200)",
      showline: true,
      linecolor: "rgb(100, 100, 100)",
    },
    zaxis: {
      range: [-axLim, axLim],
      showgrid: true,
      gridcolor: "rgb(200, 200, 200)",
      zeroline: true,
      zerolinecolor: "rgb(200, 200, 200)",
      showline: true,
      linecolor: "rgb(100, 100, 100)",
    },
  },
  margin: { l: 0, r: 0, b: 0, t: 0 },
  showlegend: true,
  legend: {
    x: 0,
    y: 1,
    traceorder: "normal",
    font: {
      family: "sans-serif",
      size: 12,
      color: "#000",
    },
    bgcolor: "#E2E2E2",
    bordercolor: "#FFFFFF",
    borderwidth: 2,
  },
};

Plotly.newPlot("plotDiv", traces, layout);

// Initialize the simulation
updateSimulation();

// Resize plot on window resize
window.addEventListener("resize", function () {
  Plotly.relayout("plotDiv", {
    width: window.innerWidth * 0.75,
    height: window.innerHeight,
  });
});

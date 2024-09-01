# RobotArm Class

## Description

The `RobotArm` class is a Python implementation of a 6-joint robotic arm using Denavit-Hartenberg parameters. This class provides methods to set and get the robot's pose, calculate transformations, and retrieve joint positions.

## Features

- Initialize a robotic arm with custom DH parameters
- Set and get robot pose
- Calculate DH transformations
- Retrieve joint positions
- Error handling for invalid inputs
- Consistent use of units (meters for linear measurements, degrees for angular measurements)

## Dependencies

This class depends on the following Python libraries:
- `numpy`
- `spatialmath`

Ensure these are installed in your Python environment before using the `RobotArm` class.

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/robotarm.git
   ```
2. Install the required dependencies:
   ```
   pip install numpy spatialmath
   ```

## Usage

Here's a basic example of how to use the `RobotArm` class:

```python
from robotarm import RobotArm

# Define DH parameters for a 6-joint robot
dh_params = [
    [0, 0.1625, 0, -np.pi/2],
    [0, 0, -0.425, 0],
    [0, 0, -0.3922, 0],
    [0, 0.1333, 0, -np.pi/2],
    [0, 0.0997, 0, np.pi/2],
    [0, 0.0996, 0, 0]
]

# Create a RobotArm instance
robot = RobotArm(dh_params)

# Set a new pose (joint angles in degrees)
new_pose = robot.set_pose([0, -90, 0, -90, 0, 0])
print("New pose:", new_pose)

# Get current joint positions
joint_positions = robot.get_joint_positions()
print("Joint positions:", joint_positions)
```

## API Reference

### `RobotArm(dh_params)`
Initialize the RobotArm with DH parameters.

### `set_pose(joint_angles)`
Set the pose of the robotic arm using the provided joint angles (in degrees).

### `get_pose()`
Get the current pose of the robotic arm.

### `get_joint_positions()`
Get the positions of all joints.

### `get_dh_params()`
Get the DH parameters for each joint.

For more detailed information about each method, please refer to the docstrings in the source code.

## Contributing

Contributions to improve the RobotArm class are welcome. Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
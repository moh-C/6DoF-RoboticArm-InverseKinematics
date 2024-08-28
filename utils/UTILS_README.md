# Robotics Kinematics Utilities

This repository contains Python utilities for performing forward kinematics calculations for robotic arms, with implementations in both NumPy and TensorFlow for performance comparison.

## Files

### [utils.py](utils.py)

Contains utility functions for forward kinematics calculations:

- `dh_matrix`: Calculates the Denavit-Hartenberg (DH) transformation matrix using NumPy.
- `forward_kinematics`: Computes forward kinematics for a set of joint angles using NumPy.
- `dh_matrix_tf`: Calculates the DH transformation matrix using TensorFlow (batched version).
- `forward_kinematics_TF`: Computes forward kinematics for a batch of joint angles using TensorFlow.

### [dh_params.py](dh_params.py)

Defines the Denavit-Hartenberg parameters for a 6-joint robotic arm:

- `dh_params`: NumPy array containing DH parameters [a, alpha, d, theta] for each joint.

## Usage

```python
import numpy as np
from utils import forward_kinematics, forward_kinematics_TF
from dh_params import dh_params

# NumPy version
joint_angles = np.zeros(6)  # Example joint angles
positions, T = forward_kinematics(joint_angles, dh_params)

# TensorFlow version (batched)
import tensorflow as tf
batch_size = 1000
joint_angles_batch = tf.random.uniform((batch_size, 6), -np.pi, np.pi)
positions_tf, T_tf = forward_kinematics_TF(joint_angles_batch, dh_params)
import numpy as np

# Denavit-Hartenberg (DH) parameters for a 6-joint robotic arm
# Each row represents a joint and contains four parameters: [a, alpha, d, theta]
# a: link length, alpha: link twist, d: link offset, theta: joint angle
# Units: lengths in mm, angles in degrees
dh_params = np.array([
    [0, -90, 10, 0],
    [50, 0, 0, -90],
    [0, -90, 5, 0],
    [0, 90, 50, 0],
    [0, -90, 0, 0],
    [0, 0, 10, 180]
])
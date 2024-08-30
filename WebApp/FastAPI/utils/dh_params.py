# Denavit-Hartenberg (DH) parameters for a 6-joint robotic arm
# Each row represents a joint and contains four parameters: [a, alpha, d, theta]
# a: link length, alpha: link twist, d: link offset, theta: joint angle
# Units: lengths in mm, angles in degrees
dh_params = [
    [0, -90, 10, 0],
    [50, 0, 0, -90],
    [0, -90, 5, 0],
    [0, 90, 50, 0],
    [0, -90, 0, 0],
    [0, 0, 40, 180]
]

def update_dh_params(new_params):
    global dh_params
    if len(new_params) != len(dh_params) or any(len(joint) != 4 for joint in new_params):
        raise ValueError("Invalid DH parameters structure")
    dh_params = new_params
dh_params = [
    [0, 90, 0.0, 0],    # Joint 1
    [50, 0, 0, 90],     # Joint 2
    [50, 0, 0, -90],    # Joint 3
    [0, 90, 10, -90],   # Joint 4
    [0, -90, 10, 0],    # Joint 5
    [0, 0, 10, 0],      # Joint 6
]

def update_dh_params(new_params):
    global dh_params
    if len(new_params) != len(dh_params) or any(len(joint) != 4 for joint in new_params):
        raise ValueError("Invalid DH parameters structure")
    dh_params = new_params
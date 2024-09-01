import numpy as np
from spatialmath import SE3

class RobotArm:
    def __init__(self, dh_params):
        self.dh_params = dh_params
        self.joint_angles = np.zeros(6)
        self.joint_positions = np.zeros((6, 3))
        self.set_pose(joint_angles=self.joint_angles)

    def set_dh_params(self, dh_params):
        """
        Set the DH parameters for each joint.
        Args:
            dh_params (list): List of DH parameters [theta_home, d, a, alpha] for each joint.
        """
        self.dh_params = dh_params
    
    def get_dh_params(self):
        """
        Get the DH parameters for each joint.
        Returns:
            dict: Dictionary of DH parameters for each joint.
        """
        return {
            f"joint_{i}": {
                "theta_home": round(float(params[0]), 4),
                "d": round(float(params[1]), 4),
                "a": round(float(params[2]), 4),
                "alpha": round(float(params[3]), 4)
            }
            for i, params in enumerate(self.dh_params)
        }

    def dh_transform(self, theta, d, a, alpha):
        """
        Calculate the DH transformation matrix using the provided DH parameters.
        """
        return SE3(np.array([
            [np.cos(theta), -np.sin(theta) * np.cos(alpha),  np.sin(theta) * np.sin(alpha), a * np.cos(theta)],
            [np.sin(theta),  np.cos(theta) * np.cos(alpha), -np.cos(theta) * np.sin(alpha), a * np.sin(theta)],
            [0,              np.sin(alpha),                np.cos(alpha),                 d],
            [0,              0,                            0,                             1]
        ]))

    def set_pose(self, joint_angles):
        """
        Set the pose of the robotic arm using the provided joint angles.
        Args:
            joint_angles (list): List of joint angles [theta1, theta2, ..., theta6] in degrees.
        Returns:
            dict: Position of the end effector and Euler ZYX angles.
        """
        self.joint_angles = np.array(joint_angles)
        joint_angles_rad = np.radians(self.joint_angles)
        T = SE3()
        self.joint_positions = np.zeros((6, 3))

        for i in range(6):
            theta_home, d, a, alpha = self.dh_params[i]
            theta = theta_home + joint_angles_rad[i]
            T *= self.dh_transform(theta, d, a, alpha)
            self.joint_positions[i, :] = T.t

        return self.extract_pose(T)

    def get_pose(self):
        """
        Get the current pose of the robotic arm.
        Returns:
            dict: A dictionary containing the position (x, y, z) and orientation (roll, pitch, yaw) 
                  of the end effector. All values are floats with 4 decimal places.
        """
        T = SE3()
        for i in range(6):
            theta_home, d, a, alpha = self.dh_params[i]
            theta = theta_home + np.radians(self.joint_angles[i])
            T *= self.dh_transform(theta, d, a, alpha)

        return self.extract_pose(T)

    def extract_pose(self, T):
        """
        Extract the position (X, Y, Z) and roll, pitch, yaw angles from the transformation matrix.
        Args:
            T (SE3): SE3 transformation matrix.
        Returns:
            dict: A dictionary containing the position (x, y, z) and orientation (roll, pitch, yaw) 
                  of the end effector. All values are floats with 4 decimal places.
        """
        pos = T.t
        rpy = T.rpy()  # Returns (roll, pitch, yaw) in radians
        return {
            "x": round(float(pos[0]), 4),
            "y": round(float(pos[1]), 4),
            "z": round(float(pos[2]), 4),
            "roll": round(float(np.degrees(rpy[0])), 4),   # Convert to degrees
            "pitch": round(float(np.degrees(rpy[1])), 4),  # Convert to degrees
            "yaw": round(float(np.degrees(rpy[2])), 4)     # Convert to degrees
        }

    def get_joint_positions(self):
        """
        Get the positions of all joints.
        Returns:
            list: A list of dictionaries containing the x, y, z positions of each joint, 
                  including the end effector. All values are floats with 4 decimal places.
        """
        return [
            {
                "x": round(float(pos[0]), 4),
                "y": round(float(pos[1]), 4),
                "z": round(float(pos[2]), 4)
            }
            for pos in self.joint_positions
        ]
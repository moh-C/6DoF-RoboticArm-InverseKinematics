from typing import List, Dict, Union
import numpy as np
from spatialmath import SE3

class RobotArm:
    """
    A class representing a 6-joint robotic arm using Denavit-Hartenberg parameters.

    This class provides methods to set and get the robot's pose, calculate transformations,
    and retrieve joint positions.

    Attributes:
        dh_params (List[List[float]]): DH parameters for each joint [theta_home, d, a, alpha].
        joint_angles (np.ndarray): Current joint angles in degrees.
        joint_positions (np.ndarray): Current positions of each joint.
        T (SE3): Current transformation matrix of the end effector.

    Note:
        This class depends on the `spatialmath` library for SE3 transformations.
        Linear measurements are in meters, and angular measurements are in degrees
        for input and output operations.
    """

    def __init__(self, dh_params: List[List[float]]):
        """
        Initialize the RobotArm with DH parameters.

        Args:
            dh_params: List of DH parameters [theta_home, d, a, alpha] for each joint.

        Raises:
            ValueError: If dh_params is not a list of 6 joints with 4 parameters each.
        """
        if not isinstance(dh_params, list) or len(dh_params) != 6 or not all(len(joint) == 4 for joint in dh_params):
            raise ValueError("dh_params must be a list of 6 joints, each with 4 parameters")
        
        self.dh_params: List[List[float]] = dh_params
        self.joint_angles: np.ndarray = np.zeros(6)
        self.joint_positions: np.ndarray = np.zeros((6, 3))
        self.T: SE3 = SE3()  # Cache for the current transformation matrix
        self.initialize_pose()

    def initialize_pose(self) -> None:
        """
        Initialize the robot's pose with default joint angles.

        This method sets the initial pose of the robot using zero joint angles.
        """
        self.set_pose(self.joint_angles)

    def set_dh_params(self, dh_params: List[List[float]]) -> None:
        """
        Set the DH parameters for each joint.

        Args:
            dh_params: List of DH parameters [theta_home, d, a, alpha] for each joint.

        Raises:
            ValueError: If dh_params is not a list of 6 joints with 4 parameters each.
        """
        if not isinstance(dh_params, list) or len(dh_params) != 6 or not all(len(joint) == 4 for joint in dh_params):
            raise ValueError("dh_params must be a list of 6 joints, each with 4 parameters")
        self.dh_params = dh_params
    
    def get_dh_params(self) -> Dict[str, Dict[str, float]]:
        """
        Get the DH parameters for each joint.

        Returns:
            A dictionary of DH parameters for each joint.
            Each joint's parameters are represented as a nested dictionary
            with keys 'theta_home', 'd', 'a', and 'alpha'.
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

    def dh_transform(self, theta: float, d: float, a: float, alpha: float) -> SE3:
        """
        Calculate the DH transformation matrix using the provided DH parameters.

        Args:
            theta: Joint angle (in radians).
            d: Link offset.
            a: Link length.
            alpha: Link twist.

        Returns:
            The resulting SE3 transformation matrix.
        """
        return SE3(np.array([
            [np.cos(theta), -np.sin(theta) * np.cos(alpha),  np.sin(theta) * np.sin(alpha), a * np.cos(theta)],
            [np.sin(theta),  np.cos(theta) * np.cos(alpha), -np.cos(theta) * np.sin(alpha), a * np.sin(theta)],
            [0,              np.sin(alpha),                np.cos(alpha),                 d],
            [0,              0,                            0,                             1]
        ]))

    def set_pose(self, joint_angles: Union[List[float], np.ndarray]) -> Dict[str, float]:
        """
        Set the pose of the robotic arm using the provided joint angles.

        Args:
            joint_angles: List of joint angles [theta1, theta2, ..., theta6] in degrees.

        Returns:
            A dictionary containing the position (x, y, z) and orientation 
            (roll, pitch, yaw) of the end effector.

        Raises:
            ValueError: If joint_angles is not a list or array of 6 floats.
        """
        if not isinstance(joint_angles, (list, np.ndarray)) or len(joint_angles) != 6:
            raise ValueError("joint_angles must be a list or array of 6 floats")
        
        self.joint_angles = np.array(joint_angles)
        joint_angles_rad = np.radians(self.joint_angles)
        self.T = SE3()
        self.joint_positions = np.zeros((6, 3))

        for i in range(6):
            theta_home, d, a, alpha = self.dh_params[i]
            theta = theta_home + joint_angles_rad[i]
            self.T *= self.dh_transform(theta, d, a, alpha)
            self.joint_positions[i, :] = self.T.t

        return self.extract_pose()

    def get_pose(self) -> Dict[str, float]:
        """
        Get the current pose of the robotic arm.

        Returns:
            A dictionary containing the position (x, y, z) in meters and orientation 
            (roll, pitch, yaw) in degrees of the end effector. 
            Linear measurements have 4 decimal places, angular measurements have 2.
        """
        return self.extract_pose()

    def extract_pose(self) -> Dict[str, float]:
        """
        Extract the position and orientation from the current transformation matrix.

        Returns:
            A dictionary containing the position (x, y, z) in meters and orientation 
            (roll, pitch, yaw) in degrees of the end effector. 
            Linear measurements have 4 decimal places, angular measurements have 2.
        """
        pos = self.T.t
        rpy = self.T.rpy()  # Returns (roll, pitch, yaw) in radians
        return {
            "x": round(float(pos[0]), 4),  # meters, 4 decimal places
            "y": round(float(pos[1]), 4),  # meters, 4 decimal places
            "z": round(float(pos[2]), 4),  # meters, 4 decimal places
            "roll": round(float(np.degrees(rpy[0])), 2),   # degrees, 2 decimal places
            "pitch": round(float(np.degrees(rpy[1])), 2),  # degrees, 2 decimal places
            "yaw": round(float(np.degrees(rpy[2])), 2)     # degrees, 2 decimal places
        }

    def get_joint_positions(self) -> List[Dict[str, float]]:
        """
        Get the positions of all joints.

        Returns:
            A list of dictionaries containing the x, y, z positions 
            of each joint in meters, including the end effector. 
            All values are floats with 4 decimal places.
        """
        return [
            {
                "x": round(float(pos[0]), 4),
                "y": round(float(pos[1]), 4),
                "z": round(float(pos[2]), 4)
            }
            for pos in self.joint_positions
        ]
import numpy as np
import tensorflow as tf
import time

def dh_matrix(a, alpha, d, theta):
    """
    Calculate the Denavit-Hartenberg (DH) transformation matrix for given parameters.

    Args:
        a (float): Link length (distance along X_i from O_i to O_i+1)
        alpha (float): Link twist (angle about X_i from Z_i to Z_i+1)
        d (float): Link offset (distance along Z_i-1 from X_i-1 to X_i)
        theta (float): Joint angle (angle about Z_i-1 from X_i-1 to X_i)

    Returns:
        numpy.ndarray: 4x4 DH transformation matrix
    """
    theta = np.deg2rad(theta)
    alpha = np.deg2rad(alpha)
    return np.array([
        [np.cos(theta), -np.sin(theta)*np.cos(alpha), np.sin(theta)*np.sin(alpha), a*np.cos(theta)],
        [np.sin(theta), np.cos(theta)*np.cos(alpha), -np.cos(theta)*np.sin(alpha), a*np.sin(theta)],
        [0, np.sin(alpha), np.cos(alpha), d],
        [0, 0, 0, 1]
    ])

def euler_from_matrix(matrix):
    """
    Extract Euler angles (roll, pitch, yaw) from a rotation matrix.
    
    Args:
        matrix (numpy.ndarray): 3x3 rotation matrix

    Returns:
        tuple: (roll, pitch, yaw) in degrees
    """
    sy = np.sqrt(matrix[0, 0] ** 2 + matrix[1, 0] ** 2)
    singular = sy < 1e-6

    if not singular:
        x = np.arctan2(matrix[2, 1], matrix[2, 2])
        y = np.arctan2(-matrix[2, 0], sy)
        z = np.arctan2(matrix[1, 0], matrix[0, 0])
    else:
        x = np.arctan2(-matrix[1, 2], matrix[1, 1])
        y = np.arctan2(-matrix[2, 0], sy)
        z = 0

    return np.rad2deg(x), np.rad2deg(y), np.rad2deg(z)

def forward_kinematics(thetas, dh_params):
    """
    Calculate forward kinematics for given joint angles and DH parameters.

    Args:
        thetas (list or numpy.ndarray): List of joint angles in degrees
        dh_params (numpy.ndarray): Array of DH parameters, each row [a, alpha, d, theta_offset]

    Returns:
        tuple:
            - numpy.ndarray: List of (x, y, z, roll, pitch, yaw) for each joint
            - numpy.ndarray: Final 4x4 transformation matrix
    """
    T = np.eye(4)
    positions_and_orientations = [np.array([0, 0, 0, 0, 0, 0])]

    for i in range(len(dh_params)):
        a, alpha, d, theta_offset = dh_params[i]
        theta = thetas[i] + theta_offset
        T_i = dh_matrix(a, alpha, d, theta)
        T = np.dot(T, T_i)
        position = T[:3, 3]
        roll, pitch, yaw = euler_from_matrix(T[:3, :3])
        positions_and_orientations.append(np.array([*position, roll, pitch, yaw]))

    return np.array(positions_and_orientations), T

def euler_from_matrix_tf(matrix):
    """
    Extract Euler angles (roll, pitch, yaw) from a rotation matrix using TensorFlow.
    
    Args:
        matrix (tf.Tensor): 3x3 rotation matrix or batch of matrices

    Returns:
        tf.Tensor: (roll, pitch, yaw) in degrees
    """
    sy = tf.sqrt(matrix[..., 0, 0] ** 2 + matrix[..., 1, 0] ** 2)
    singular = tf.less(sy, 1e-6)

    x = tf.where(singular,
                 tf.atan2(-matrix[..., 1, 2], matrix[..., 1, 1]),
                 tf.atan2(matrix[..., 2, 1], matrix[..., 2, 2]))
    y = tf.where(singular,
                 tf.atan2(-matrix[..., 2, 0], sy),
                 tf.atan2(-matrix[..., 2, 0], sy))
    z = tf.where(singular,
                 tf.zeros_like(x),
                 tf.atan2(matrix[..., 1, 0], matrix[..., 0, 0]))

    return tf.stack([x, y, z], axis=-1) * 180.0 / np.pi

def dh_matrix_tf(a, alpha, d, theta):
    """
    Calculate the Denavit-Hartenberg (DH) transformation matrix using TensorFlow.

    This function computes the DH matrix for given parameters using TensorFlow operations.
    It is designed to work with batched inputs for efficient parallel processing.

    Args:
        a (tf.Tensor): Link length (distance along X_i from O_i to O_i+1).
        alpha (tf.Tensor): Link twist (angle about X_i from Z_i to Z_i+1) in degrees.
        d (tf.Tensor): Link offset (distance along Z_i-1 from X_i-1 to X_i).
        theta (tf.Tensor): Joint angle (angle about Z_i-1 from X_i-1 to X_i) in degrees.

    Returns:
        tf.Tensor: 4x4 DH transformation matrix (or batch of matrices).
    """
    # Convert degrees to radians
    theta = theta * np.pi / 180.0
    alpha = alpha * np.pi / 180.0
    
    cos_theta, sin_theta = tf.cos(theta), tf.sin(theta)
    cos_alpha, sin_alpha = tf.cos(alpha), tf.sin(alpha)
    
    # Ensure all inputs have the same shape for broadcasting
    zeros = tf.zeros_like(theta)
    ones = tf.ones_like(theta)
    
    return tf.stack([
        tf.stack([cos_theta, -sin_theta*cos_alpha, sin_theta*sin_alpha, a*cos_theta], axis=-1),
        tf.stack([sin_theta, cos_theta*cos_alpha, -cos_theta*sin_alpha, a*sin_theta], axis=-1),
        tf.stack([zeros, sin_alpha, cos_alpha, d*ones], axis=-1),
        tf.stack([zeros, zeros, zeros, ones], axis=-1)
    ], axis=-2)

def forward_kinematics_TF(thetas_batch, dh_params):
    """
    Calculate forward kinematics for a batch of joint angles using TensorFlow.

    Args:
        thetas_batch: TensorFlow tensor of shape (batch_size, num_joints)
        dh_params: NumPy array of shape (num_joints, 4) containing DH parameters [a, alpha, d, theta_offset]

    Returns:
        positions_and_orientations: TensorFlow tensor of shape (batch_size, num_joints + 1, 6)
        T: TensorFlow tensor of shape (batch_size, 4, 4) - final transformation matrices
    """
    batch_size = tf.shape(thetas_batch)[0]
    num_joints = tf.shape(thetas_batch)[1]

    dh_params_tf = tf.constant(dh_params, dtype=tf.float32)
    dh_params_tf = tf.broadcast_to(dh_params_tf[None, :, :], [batch_size, num_joints, 4])

    T = tf.eye(4, batch_shape=[batch_size])
    
    # Initialize positions_and_orientations with zeros
    positions_and_orientations = tf.zeros((batch_size, num_joints + 1, 6))
    
    # Set the initial position (0,0,0) and orientation (0,0,0) for the base
    positions_and_orientations = tf.tensor_scatter_nd_update(
        positions_and_orientations,
        tf.stack([tf.range(batch_size), tf.zeros(batch_size, dtype=tf.int32)], axis=1),
        tf.zeros((batch_size, 6))
    )

    for i in range(num_joints):
        a, alpha, d, theta_offset = tf.unstack(dh_params_tf[:, i], axis=-1)
        theta = thetas_batch[:, i] + theta_offset
        T_i = dh_matrix_tf(a, alpha, d, theta)
        T = tf.matmul(T, T_i)
        position = T[..., :3, 3]
        rotation = euler_from_matrix_tf(T[..., :3, :3])
        positions_and_orientations = tf.tensor_scatter_nd_update(
            positions_and_orientations,
            tf.stack([tf.range(batch_size), tf.fill([batch_size], i+1)], axis=1),
            tf.concat([position, rotation], axis=-1)
        )

    return positions_and_orientations, T
# [FK_Speedup.ipynb](FK_Speedup.ipynb)
## Forward Kinematics Speedup with Full Pose Calculation

This notebook demonstrates the implementation and comparison of forward kinematics calculations, including full pose (position and orientation), using NumPy and TensorFlow. The goal is to highlight the speedup achieved by using TensorFlow for batch processing while providing complete pose information.

### Helper Functions
- **dh_matrix**: Calculates the Denavit-Hartenberg (DH) matrix for given parameters using NumPy.
- **euler_from_matrix**: Extracts Euler angles (roll, pitch, yaw) from a rotation matrix using NumPy.
- **forward_kinematics**: Computes forward kinematics with full pose for given joint angles and DH parameters using NumPy.
- **dh_matrix_tf**: Calculates the DH matrix for given parameters using TensorFlow.
- **euler_from_matrix_tf**: Extracts Euler angles from a rotation matrix using TensorFlow.
- **forward_kinematics_TF**: Computes forward kinematics with full pose for a batch of joint angles using TensorFlow.

### Initialization
- **DH Parameters**: Defined for a 6-joint robotic arm.

### Timing Comparisons
- **NumPy Version**: Tested with a single iteration and multiple iterations, now including full pose calculation.
- **TensorFlow Version**: Tested with a batch of joint angles, providing position and orientation for each joint.
- **Speedup Factor**: Calculated to compare the performance of NumPy and TensorFlow implementations.

### Results
- **NumPy Version**: Sequential processing with full pose (x, y, z, roll, pitch, yaw) for each joint.
- **TensorFlow Version**: Batched processing with full pose for each joint in the entire batch.
- **Speedup Factor**: TensorFlow achieves a significant speedup over NumPy, even with the added complexity of orientation calculations.

### Conclusion
The notebook demonstrates the efficiency of TensorFlow for batch processing in forward kinematics calculations, including full pose estimation. Despite the additional computations for orientation, TensorFlow maintains a substantial speedup factor compared to NumPy, showcasing its power in parallel processing for robotic kinematics.

### Note on Output Formatting
All numerical outputs are formatted to display a maximum of 4 decimal places for clarity and consistency.
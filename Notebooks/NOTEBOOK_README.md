# [FK_Speedup.ipynb](FK_Speedup.ipynb)
## Forward Kinematics Speedup

This notebook demonstrates the implementation and comparison of forward kinematics calculations using NumPy and TensorFlow. The goal is to highlight the speedup achieved by using TensorFlow for batch processing.

### Helper Functions
- **dh_matrix**: Calculates the Denavit-Hartenberg (DH) matrix for given parameters using NumPy.
- **forward_kinematics**: Computes forward kinematics for given joint angles and DH parameters using NumPy.
- **dh_matrix_tf**: Calculates the DH matrix for given parameters using TensorFlow.
- **forward_kinematics_TF**: Computes forward kinematics for a batch of joint angles using TensorFlow.

### Initialization
- **DH Parameters**: Defined for a 6-joint robotic arm.

### Timing Comparisons
- **NumPy Version**: Tested with a single iteration and multiple iterations.
- **TensorFlow Version**: Tested with a batch of joint angles.
- **Speedup Factor**: Calculated to compare the performance of NumPy and TensorFlow implementations.

### Results
- **NumPy Version**: Sequential processing.
- **TensorFlow Version**: Batched processing.
- **Speedup Factor**: TensorFlow achieves a significant speedup over NumPy.

### Conclusion
The notebook demonstrates the efficiency of TensorFlow for batch processing in forward kinematics calculations, achieving a speedup factor of approximately ~300x compared to NumPy (at 65k batchsize)!
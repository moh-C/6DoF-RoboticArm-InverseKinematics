import numpy as np
import tensorflow as tf
import json
from utils import forward_kinematics, forward_kinematics_TF
from utils.dh_params import dh_params

def generate_dataset(angle_range=75, num_samples=100000):
    """
    Generate a dataset by changing joint angles within the specified range.
    
    Args:
        angle_range (float): Range of angles in degrees (-angle_range to +angle_range)
        num_samples (int): Number of samples to generate
    
    Returns:
        dict: Dataset containing inputs, outputs, and metadata
    """
    thetas = np.random.uniform(-angle_range, angle_range, (num_samples, 6))
    
    # Calculate forward kinematics for all samples
    positions_orientations, _ = forward_kinematics_TF(thetas, dh_params)
    
    # Extract end effector position and orientation
    end_effector = positions_orientations[:, -1, :]
    
    return {
        'inputs': thetas,
        'outputs': end_effector,
        'metadata': positions_orientations
    }

def get_home_position():
    """Calculate the home position (all thetas are 0)"""
    home_thetas = np.zeros(6)
    home_positions_orientations, _ = forward_kinematics(home_thetas, dh_params)
    return home_positions_orientations[-1]  # Return end effector position

def subtract_home_position(dataset, home_position):
    """Subtract the home position from all outputs and metadata"""
    dataset['outputs'] -= home_position
    dataset['metadata'] = dataset['metadata'] - home_position
    return dataset

def normalize_data(data, data_min, data_range):
    """Normalize data to the range [0, 1]"""
    return (data - data_min) / data_range

def denormalize_data(normalized_data, data_min, data_range):
    """Denormalize data from [0, 1] to original range"""
    return normalized_data * data_range + data_min

def normalize_dataset(dataset):
    """Normalize the entire dataset and save normalization parameters"""
    norm_params = {}
    
    # Normalize inputs (thetas)
    theta_min = -75
    theta_max = 75
    theta_range = theta_max - theta_min
    norm_params['theta'] = {'min': theta_min, 'range': theta_range}
    dataset['inputs'] = normalize_data(dataset['inputs'], theta_min, theta_range)
    
    # Normalize outputs and metadata
    for key in ['outputs', 'metadata']:
        data_min = np.min(dataset[key], axis=0)
        data_max = np.max(dataset[key], axis=0)
        data_range = data_max - data_min
        norm_params[key] = {'min': data_min.tolist(), 'range': data_range.tolist()}
        dataset[key] = normalize_data(dataset[key], data_min, data_range)
    
    return dataset, norm_params

def save_normalization_params(norm_params, filename='norm_params.json'):
    """Save normalization parameters to a JSON file"""
    with open(filename, 'w') as f:
        json.dump(norm_params, f)

def load_normalization_params(filename='norm_params.json'):
    """Load normalization parameters from a JSON file"""
    with open(filename, 'r') as f:
        return json.load(f)

def denormalize_end_effector(normalized_end_effector, norm_params):
    """Denormalize the end effector position and orientation"""
    output_min = np.array(norm_params['outputs']['min'])
    output_range = np.array(norm_params['outputs']['range'])
    return denormalize_data(normalized_end_effector, output_min, output_range)

def main():
    # Generate dataset
    dataset = generate_dataset()
    
    # Get home position and subtract from outputs and metadata
    home_position = get_home_position()
    dataset = subtract_home_position(dataset, home_position)
    
    # Normalize dataset
    normalized_dataset, norm_params = normalize_dataset(dataset)
    
    # Save normalization parameters
    save_normalization_params(norm_params)
    
    # Example of denormalizing end effector position
    normalized_end_effector = normalized_dataset['outputs'][0]  # First sample
    denormalized_end_effector = denormalize_end_effector(normalized_end_effector, norm_params)
    
    print("Original end effector position:", dataset['outputs'][0])
    print("Denormalized end effector position:", denormalized_end_effector)

if __name__ == "__main__":
    main()
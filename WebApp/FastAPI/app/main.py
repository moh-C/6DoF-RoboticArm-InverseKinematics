from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, conlist, confloat
from typing import List, Dict
import numpy as np
from app.RobotArm import RobotArm
from app.DH import dh_params
import logging
from functools import lru_cache

app = FastAPI(title="RobotArm API", version="1.0.0")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dependency for RobotArm instance
@lru_cache()
def get_robot_arm():
    try:
        # Log the dh_params for debugging
        logger.info(f"Initializing RobotArm with dh_params: {dh_params}")
        
        # Check if dh_params is a list and has 6 items
        if not isinstance(dh_params, list) or len(dh_params) != 6:
            raise ValueError(f"dh_params must be a list of 6 joints, got {type(dh_params)} with {len(dh_params)} items")
        
        # Check if each item in dh_params is a list with 4 items
        for i, params in enumerate(dh_params):
            if not isinstance(params, list) or len(params) != 4:
                raise ValueError(f"Each joint in dh_params must have 4 parameters, joint {i} has {len(params)} parameters")
        
        return RobotArm(dh_params)
    except Exception as e:
        logger.error(f"Error initializing RobotArm: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error initializing RobotArm: {str(e)}")

class DHParams(BaseModel):
    params: conlist(conlist(confloat(ge=-np.pi, le=np.pi), min_items=4, max_items=4), min_items=6, max_items=6)

class JointAngles(BaseModel):
    angles: conlist(confloat(ge=-180, le=180), min_items=6, max_items=6)

@app.get("/", summary="API Information")
async def root():
    """
    Root endpoint that provides information about all available endpoints.
    """
    return {
        "message": "Welcome to the RobotArm API v1.0.0",
        "endpoints": {
            "/": "This endpoint. Provides information about all available endpoints.",
            "/dh_params": "GET: Retrieve current DH parameters. PUT: Set new DH parameters. POST: Set new DH parameters.",
            "/pose": "GET: Get current robot pose. PUT: Set new robot pose. POST: Set new robot pose.",
            "/joint_positions": "GET: Retrieve current joint positions.",
            "/joint_angles": "GET: Retrieve current joint angles. POST: Set new joint angles.",
            "/health": "GET: Check the health status of the API.",
        }
    }

@app.get("/dh_params", summary="Get DH Parameters")
async def get_dh_params(robot_arm: RobotArm = Depends(get_robot_arm)):
    """
    Retrieve the current DH parameters of the robot arm.

    Returns:
        dict: A dictionary containing the DH parameters for each joint.
    """
    logger.info("Retrieving DH parameters")
    return robot_arm.get_dh_params()

@app.put("/dh_params", summary="Set DH Parameters")
@app.post("/dh_params", summary="Set DH Parameters")
async def set_dh_params(dh_params: DHParams, robot_arm: RobotArm = Depends(get_robot_arm)):
    """
    Set new DH parameters for the robot arm.

    Args:
        dh_params (DHParams): The new DH parameters to set.

    Returns:
        dict: A message confirming the update.

    Raises:
        HTTPException: If the input is invalid or the operation fails.
    """
    try:
        logger.info("Setting new DH parameters")
        robot_arm.set_dh_params(dh_params.params)
        return {"message": "DH parameters updated successfully"}
    except ValueError as e:
        logger.error(f"Error setting DH parameters: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/pose", summary="Get Current Pose")
async def get_pose(robot_arm: RobotArm = Depends(get_robot_arm)):
    """
    Retrieve the current pose of the robot arm.

    Returns:
        dict: A dictionary containing the current position and orientation of the end effector.
    """
    logger.info("Retrieving current pose")
    return robot_arm.get_pose()

@app.put("/pose", summary="Set New Pose")
@app.post("/pose", summary="Set New Pose")
async def set_pose(joint_angles: JointAngles, robot_arm: RobotArm = Depends(get_robot_arm)):
    """
    Set a new pose for the robot arm using the provided joint angles.

    Args:
        joint_angles (JointAngles): The new joint angles to set.

    Returns:
        dict: The new pose of the robot arm.

    Raises:
        HTTPException: If the input is invalid or the operation fails.
    """
    try:
        logger.info("Setting new pose")
        new_pose = robot_arm.set_pose(joint_angles.angles)
        return new_pose
    except ValueError as e:
        logger.error(f"Error setting pose: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/joint_positions", summary="Get Joint Positions")
async def get_joint_positions(robot_arm: RobotArm = Depends(get_robot_arm)):
    """
    Retrieve the current positions of all joints.

    Returns:
        list: A list of dictionaries containing the x, y, z positions of each joint.
    """
    logger.info("Retrieving joint positions")
    return robot_arm.get_joint_positions()

@app.get("/joint_angles", summary="Get Joint Angles")
async def get_joint_angles(robot_arm: RobotArm = Depends(get_robot_arm)):
    """
    Retrieve the current joint angles of the robot arm.

    Returns:
        dict: A dictionary containing the current joint angles.
    """
    logger.info("Retrieving joint angles")
    return {"joint_angles": robot_arm.joint_angles.tolist()}

@app.post("/joint_angles", summary="Set Joint Angles")
async def set_joint_angles(joint_angles: JointAngles, robot_arm: RobotArm = Depends(get_robot_arm)):
    """
    Set new joint angles for the robot arm.

    Args:
        joint_angles (JointAngles): The new joint angles to set.

    Returns:
        dict: A dictionary containing the new end effector position, orientation, and joint positions.

    Raises:
        HTTPException: If the input is invalid or the operation fails.
    """
    try:
        logger.info("Setting new joint angles")
        x, y, z, roll, pitch, yaw = robot_arm.set_pose(joint_angles.angles)
        return {
            "end_effector_position": {"x": x, "y": y, "z": z},
            "end_effector_orientation": {"roll": roll, "pitch": pitch, "yaw": yaw},
            "joint_positions": robot_arm.joint_positions.tolist()
        }
    except ValueError as e:
        logger.error(f"Error setting joint angles: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health", summary="Health Check")
async def health_check():
    """
    Perform a health check on the API.

    Returns:
        dict: A message indicating the health status of the API.
    """
    logger.info("Performing health check")
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
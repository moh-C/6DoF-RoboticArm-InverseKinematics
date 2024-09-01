from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from spatialmath import SE3
from app.RobotArm import RobotArm
from app.DH import dh_params

app = FastAPI()

class JointAngles(BaseModel):
    angles: List[float]

class DHParameters(BaseModel):
    params: List[List[float]]

robotic_arm = RobotArm(dh_params)

@app.get("/joint_angles")
def get_joint_angles():
    return {"joint_angles": robotic_arm.joint_angles.tolist()}

@app.post("/joint_angles")
def set_joint_angles(joint_angles: JointAngles):
    if len(joint_angles.angles) != 6:
        raise HTTPException(status_code=400, detail="Must provide 6 joint angles")
    x, y, z, roll, pitch, yaw = robotic_arm.set_pose(joint_angles.angles)
    return {
        "end_effector_position": {"x": x, "y": y, "z": z},
        "end_effector_orientation": {"roll": roll, "pitch": pitch, "yaw": yaw},
        "joint_positions": robotic_arm.joint_positions.tolist()
    }

@app.get("/dh_parameters")
def get_dh_parameters():
    return robotic_arm.get_dh_params()

@app.post("/dh_parameters")
def set_dh_parameters(dh_params: DHParameters):
    if len(dh_params.params) != 6 or any(len(param) != 4 for param in dh_params.params):
        raise HTTPException(status_code=400, detail="Must provide 6 sets of 4 DH parameters each")
    robotic_arm.set_dh_params(dh_params.params)
    return {"message": "DH parameters updated successfully"}

@app.get("/joint_positions")
def get_joint_positions():
    return {"joint_positions": robotic_arm.joint_positions.tolist()}

@app.get("/get_pose")
def get_joint_positions():
    return {"pose": robotic_arm.get_pose()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
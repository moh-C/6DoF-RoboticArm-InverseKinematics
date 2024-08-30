from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sys
import os
# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dh_params import dh_params, update_dh_params

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DHParams(BaseModel):
    dh_params: List[List[float]]

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Robot Arm Simulation API"}

@app.get("/api/joint_angles")
async def get_joint_angles():
    # Placeholder data
    return {
        "joint1": 0,
        "joint2": 0,
        "joint3": 0,
        "joint4": 0,
        "joint5": 0,
        "joint6": 0
    }

@app.get("/api/dh_parameters")
async def get_dh_parameters():
    return {
        "dh_params": dh_params
    }

@app.post("/api/dh_parameters")
async def update_dh_parameters(params: DHParams):
    try:
        update_dh_params(params.dh_params)
        return {"message": "DH parameters updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
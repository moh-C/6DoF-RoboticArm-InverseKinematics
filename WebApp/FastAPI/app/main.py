from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow the React app to access the API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Robot Arm Simulation API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/joint_angles")
async def get_joint_angles():
    # Placeholder data
    return {
        "joint1": 0,
        "joint2": 45,
        "joint3": -30,
        "joint4": 0,
        "joint5": 80,
        "joint6": 11
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
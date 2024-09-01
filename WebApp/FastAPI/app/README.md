# FastAPI RobotArm API

This project implements a RESTful API for controlling and monitoring a robotic arm using FastAPI.

## Table of Contents

1. [Installation](#installation)
2. [Running the Server](#running-the-server)
3. [API Endpoints](#api-endpoints)
4. [Usage Examples](#usage-examples)
5. [Error Handling](#error-handling)
6. [Logging](#logging)
7. [Dependencies](#dependencies)
8. [Contributing](#contributing)
9. [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fastapi-robotarm.git
   cd fastapi-robotarm
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Server

To start the FastAPI server, run:

```
python main.py
```

The server will start on `http://0.0.0.0:8000`.

## API Endpoints

- `/` (GET): Root endpoint providing information about all available endpoints.
- `/dh_params` (GET, PUT, POST): Retrieve or set DH parameters.
- `/pose` (GET, PUT, POST): Retrieve or set the robot's pose.
- `/joint_positions` (GET): Retrieve current joint positions.
- `/joint_angles` (GET, POST): Retrieve or set joint angles.
- `/health` (GET): Check the health status of the API.

For detailed information about request/response formats, visit the auto-generated docs at `http://localhost:8000/docs` when the server is running.

## Usage Examples

### Getting current pose

```python
import requests

response = requests.get('http://localhost:8000/pose')
print(response.json())
```

### Setting new joint angles

```python
import requests

new_angles = {"angles": [0, 45, -90, 0, 90, 0]}
response = requests.post('http://localhost:8000/joint_angles', json=new_angles)
print(response.json())
```

## Error Handling

The API uses standard HTTP status codes for error reporting:

- 400: Bad Request (e.g., invalid input)
- 500: Internal Server Error

Detailed error messages are provided in the response body.

## Logging

The application uses Python's built-in logging module. Logs are output to the console and include information about API calls and any errors that occur.

## Dependencies

- FastAPI
- Pydantic
- NumPy
- uvicorn

See `requirements.txt` for version information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
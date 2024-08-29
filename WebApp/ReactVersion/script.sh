# Build the Docker image
docker build -t react-robotics-app .

# Run the Docker container
docker run -p 3000:3000 react-robotics-app
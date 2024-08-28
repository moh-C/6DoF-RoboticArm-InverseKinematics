#!/bin/bash

# Build the Docker image
docker build -t tensorflow-gpu-custom .

# Run the Docker container
docker run --rm -it \
  --name tensorflow-gpu-custom \
  --network host \
  --gpus all \
  -v $(pwd):/tf/workdir \
  -w /tf/workdir \
  tensorflow-gpu-custom
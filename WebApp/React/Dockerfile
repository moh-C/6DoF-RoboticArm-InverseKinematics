# Use an official Node runtime as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Install global dependencies
RUN npm install -g serve

# Copy the rest of the application code
COPY . .

# Build the app for production
RUN npm run build

# Expose port 3000 for the application
EXPOSE 3000

# Run the app
CMD ["serve", "-s", "build", "-l", "3000"]
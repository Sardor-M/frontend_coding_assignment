#!/bin/bash

echo "Starting deployment process..."

# Build and run with Docker Compose
echo "Building Docker images..."
docker-compose build

# Pull the Phi model
echo "Pulling Phi model..."
docker-compose exec ollama ollama pull phi4-mini

# Start services
echo "Starting services..."
docker-compose up -d

echo "Deployment complete!"
echo "Backend running at: http://localhost:3001"
echo "Frontend running at: http://localhost:5173"
echo "Ollama running at: http://localhost:11434"
#!/bin/bash
set -e

echo "=== Container Build and Deploy Script ==="

# Change to terraform directory
cd terraform

# Get ECR repository URLs from Terraform output
echo "Getting ECR repository URLs..."
BACKEND_REPO=$(terraform output -raw backend_ecr_repository)
FRONTEND_REPO=$(terraform output -raw frontend_ecr_repository)
REGION=us-east-1

echo "Backend repo: $BACKEND_REPO"
echo "Frontend repo: $FRONTEND_REPO"

# Login to ECR
echo "Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $BACKEND_REPO

# Build and push backend
echo "Building and pushing backend..."
cd ../backend
docker build -t $BACKEND_REPO:latest .
docker push $BACKEND_REPO:latest

# Build and push frontend
echo "Building and pushing frontend..."
cd ../frontend
docker build -t $FRONTEND_REPO:latest .
docker push $FRONTEND_REPO:latest

# Update ECS Services
echo "Updating ECS services..."
cd ../terraform

# Force ECS service update to pull new images
aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) --service agent-assistant-backend-service --force-new-deployment
aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) --service agent-assistant-frontend-service --force-new-deployment

echo "=== Deployment Complete ==="
echo "Application URL: http://$(terraform output -raw alb_dns_name)"
echo "Backend API: http://$(terraform output -raw alb_dns_name)/api"
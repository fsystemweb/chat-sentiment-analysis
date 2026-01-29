# AWS Deployment Guide

Deploy Agent Assistant to AWS using ECS Fargate with containerized applications.

## Prerequisites

- [Terraform](https://terraform.io/downloads) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configured with credentials
- [Docker](https://docs.docker.com/get-docker/) installed locally
- OpenAI API key

## Deployment Steps

### 1. Infrastructure Setup

```bash
cd terraform

# Initialize Terraform
terraform init

# Create your variables file
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Set environment variables
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
export AWS_DEFAULT_REGION=your_region

# Deploy infrastructure
terraform plan
terraform apply
```

### 2. Build and Push Container Images

```bash
# Get ECR repository URLs from Terraform output
BACKEND_REPO=$(terraform output -raw backend_ecr_repository)
FRONTEND_REPO=$(terraform output -raw frontend_ecr_repository)
REGION=us-east-1

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $BACKEND_REPO

# Build and push backend
cd ../backend
docker build -t $BACKEND_REPO:latest .
docker push $BACKEND_REPO:latest

# Build and push frontend
cd ../frontend
docker build -t $FRONTEND_REPO:latest .
docker push $FRONTEND_REPO:latest
```

### 3. Update ECS Services

```bash
cd ../terraform

# Force ECS service update to pull new images
aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) --service agent-assistant-backend-service --force-new-deployment
aws ecs update-service --cluster $(terraform output -raw ecs_cluster_name) --service agent-assistant-frontend-service --force-new-deployment
```

### 4. Access Application

After ~3-5 minutes, access your app at:
- **Application**: `http://$(terraform output -raw alb_dns_name)`
- **Backend API**: `http://$(terraform output -raw alb_dns_name)/api`
- **API Docs**: `http://$(terraform output -raw alb_dns_name)/docs`

## Local Development

```bash
# Run locally with Docker Compose
cp backend/.env.example backend/.env
# Edit backend/.env with your OpenAI API key

docker-compose up --build
```

Access locally at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Updating the Application

```bash
# Rebuild and push images (steps 2-3 above)
# ECS will automatically deploy new containers
```

## Monitoring

```bash
# View ECS service status
aws ecs describe-services --cluster $(terraform output -raw ecs_cluster_name) --services agent-assistant-backend-service agent-assistant-frontend-service

# View container logs
aws logs tail /ecs/agent-assistant-backend --follow
aws logs tail /ecs/agent-assistant-frontend --follow
```

## Complete Teardown

```bash
cd terraform
terraform destroy
# Type 'yes' to confirm
```

This removes:
- ECS cluster and services
- Application Load Balancer
- ECR repositories
- VPC and networking components
- All associated resources

## Cost Tracking

All resources are tagged with:
- `Project = agent-assistant`
- `Environment = temporary`
- `ManagedBy = terraform`

Filter by `Project` tag in AWS Cost Explorer.

## Architecture

- **Frontend**: Next.js static build served by nginx in ECS Fargate
- **Backend**: FastAPI Python application in ECS Fargate
- **Load Balancer**: ALB routes `/api/*` to backend, `/*` to frontend
- **Networking**: VPC with 2 public subnets across AZs
- **Logging**: CloudWatch logs for all containers

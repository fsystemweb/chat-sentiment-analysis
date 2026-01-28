# AWS Deployment Guide

Deploy Agent Assistant to AWS using Terraform.

## Prerequisites

- [Terraform](https://terraform.io/downloads) >= 1.0
- [AWS CLI](https://aws.amazon.com/cli/) configured with credentials
- EC2 key pair (create in AWS Console → EC2 → Key Pairs)
- OpenAI API key

## Quick Deploy

```bash
cd terraform

# Initialize Terraform
terraform init

# Create your variables file, only the first time
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Set environment variables
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
export AWS_DEFAULT_REGION=your_region


# Preview changes
terraform plan

# Deploy (type 'yes' to confirm)
terraform apply
```

After ~5-10 minutes, access your app at the URLs shown in the output.

## Updating the Application

SSH into the instance and pull latest code:

```bash
# Get SSH command from Terraform output
terraform output ssh_backend
terraform output ssh_frontend

# On the instance:
cd /opt/app
git pull
sudo systemctl restart backend  # or frontend
```

## Complete Teardown

**Remove all resources with a single command:**

```bash
cd terraform
terraform destroy
# Type 'yes' to confirm
```

This removes:
- EC2 instances (backend + frontend)
- VPC, subnets, security groups
- All associated resources

## Troubleshooting

Check logs on EC2:
```bash
# Bootstrap log
sudo cat /var/log/user-data.log

# Service logs
sudo journalctl -u backend -f
sudo journalctl -u frontend -f
```

## Cost Tracking

All resources are tagged with:
- `Project = agent-assistant`
- `Environment = temporary`
- `ManagedBy = terraform`

Filter by `Project` tag in AWS Cost Explorer.

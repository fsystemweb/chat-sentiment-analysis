variable "project_name" {
  description = "Project name for resource tagging and identification"
  type        = string
  default     = "agent-assistant"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type for both frontend and backend"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Name of existing EC2 key pair for SSH access"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key for backend"
  type        = string
  sensitive   = true
}

variable "openai_model" {
  description = "OpenAI model to use"
  type        = string
  default     = "gpt-4"
}

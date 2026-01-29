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

variable "container_cpu" {
  description = "CPU units for ECS containers (256, 512, 1024, etc.)"
  type        = number
  default     = 256
}

variable "container_memory" {
  description = "Memory for ECS containers in MB (512, 1024, 2048, etc.)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
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

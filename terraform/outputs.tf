output "backend_public_ip" {
  description = "Public IP of the backend EC2 instance"
  value       = aws_instance.backend.public_ip
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_instance.backend.public_ip}:8000"
}

output "frontend_public_ip" {
  description = "Public IP of the frontend EC2 instance"
  value       = aws_instance.frontend.public_ip
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${aws_instance.frontend.public_ip}:3000"
}

output "backend_instance_id" {
  description = "Backend EC2 instance ID"
  value       = aws_instance.backend.id
}

output "frontend_instance_id" {
  description = "Frontend EC2 instance ID"
  value       = aws_instance.frontend.id
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "ssh_backend" {
  description = "SSH command for backend"
  value       = "ssh -i <your-key.pem> ec2-user@${aws_instance.backend.public_ip}"
}

output "ssh_frontend" {
  description = "SSH command for frontend"
  value       = "ssh -i <your-key.pem> ec2-user@${aws_instance.frontend.public_ip}"
}

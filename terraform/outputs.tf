output "backend_instance_id" {
  description = "Backend EC2 instance ID"
  value       = aws_instance.backend.id
}

output "backend_public_ip" {
  description = "Elastic Public IP of the backend EC2 instance"
  value       = aws_eip.backend.public_ip
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.backend.public_ip}:8000"
}

output "frontend_instance_id" {
  description = "Frontend EC2 instance ID"
  value       = aws_instance.frontend.id
}

output "frontend_public_ip" {
  description = "Elastic Public IP of the frontend EC2 instance"
  value       = aws_eip.frontend.public_ip
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${aws_eip.frontend.public_ip}:3000"
}

output "ssh_backend" {
  description = "SSH command for backend"
  value       = "ssh -i ${var.key_name} ec2-user@${aws_eip.backend.public_ip}"
}

output "ssh_frontend" {
  description = "SSH command for frontend"
  value       = "ssh -i ${var.key_name} ec2-user@${aws_eip.frontend.public_ip}"
}

output "s3_bucket" {
  description = "S3 bucket containing the deployed code"
  value       = aws_s3_bucket.code_bucket.id
}

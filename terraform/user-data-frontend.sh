#!/bin/bash
set -e

# Log all output
exec > >(tee /var/log/user-data.log) 2>&1

echo "=== Starting Frontend Setup ==="

# Update system
dnf update -y

# Install Node.js 18
dnf install -y nodejs npm git

# Create app directory
mkdir -p /opt/app
cd /opt/app

# Download code from S3
aws s3 cp s3://${s3_bucket}/${s3_key} /tmp/code.zip
unzip /tmp/code.zip

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file for backend connection
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://${backend_public_ip}:8000
EOF

# Build the application
npm run build

# Create systemd service
cat > /etc/systemd/system/frontend.service << EOF
[Unit]
Description=Agent Assistant Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/app/frontend
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Start service
systemctl daemon-reload
systemctl enable frontend
systemctl start frontend

echo "=== Frontend Setup Complete ==="

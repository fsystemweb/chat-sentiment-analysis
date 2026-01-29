#!/bin/bash
set -e

# Log all output
exec > >(tee /var/log/user-data.log) 2>&1

echo "=== Starting Backend Setup ==="

# Update system
dnf update -y

# Install Python 3.11 and development tools
dnf install -y python3.11 python3.11-pip python3.11-devel git

# Create app directory
mkdir -p /opt/app
cd /opt/app

# Download code from S3
aws s3 cp s3://${s3_bucket}/${s3_key} /tmp/code.zip
unzip /tmp/code.zip

# Navigate to backend
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
OPENAI_API_KEY=${openai_api_key}
OPENAI_MODEL=${openai_model}
DATA_DIR=./data
EOF

# Create systemd service
cat > /etc/systemd/system/backend.service << EOF
[Unit]
Description=Agent Assistant Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/app/backend
Environment=PATH=/opt/app/backend/venv/bin
ExecStart=/opt/app/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Start service
systemctl daemon-reload
systemctl enable backend
systemctl start backend

echo "=== Backend Setup Complete ==="

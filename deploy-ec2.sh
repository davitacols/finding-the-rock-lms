#!/bin/bash

# AWS EC2 Deployment Script
echo "🚀 Deploying to AWS EC2..."

# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone or update repository
if [ -d "hotr" ]; then
    cd hotr
    git pull
else
    git clone https://github.com/your-repo/hotr.git
    cd hotr
fi

# Build frontend
cd frontend
npm install
npm run build

# Setup backend
cd ../backend
npm install --production
mkdir -p public
cp -r ../frontend/build/* public/

# Copy production environment
cp .env.production .env

# Start with PM2
pm2 start server.js --name "hotr-lms"
pm2 startup
pm2 save

# Setup nginx reverse proxy
sudo yum install -y nginx
sudo tee /etc/nginx/conf.d/hotr.conf > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo systemctl start nginx
sudo systemctl enable nginx

echo "✅ Deployment complete! App running on http://your-domain.com"
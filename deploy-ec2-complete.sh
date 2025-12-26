#!/bin/bash

# AWS EC2 Deployment Script for Finding the Rock LMS
echo "🚀 Deploying Finding the Rock LMS Backend to EC2..."

# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone https://github.com/davitacols/finding-the-rock-lms.git
cd finding-the-rock-lms/backend

# Install dependencies
npm install --production

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=5000
DB_HOST=dev-lms-db.ca968o2wg9ep.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=lmsdb
DB_USER=lmsadmin
DB_PASSWORD=SecureLMS2024!
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAUHPTTS4ANU4AH2O4
AWS_SECRET_ACCESS_KEY=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
S3_BUCKET_NAME=dev-lms-content-290958055168
COGNITO_USER_POOL_ID=us-east-1_F6mrWuxuI
COGNITO_CLIENT_ID=21ercn6i5emt61re8fsmk32t14
JWT_SECRET=your_super_secure_jwt_secret_key_here_2024
FROM_EMAIL=noreply@yourdomain.com
EOF

# Start with PM2
pm2 start server.js --name "finding-the-rock-api"
pm2 startup
pm2 save

# Install and configure nginx
sudo yum install -y nginx

# Create nginx config
sudo tee /etc/nginx/conf.d/api.conf > /dev/null << EOF
server {
    listen 80;
    server_name _;
    
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

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "✅ Deployment complete!"
echo "🌐 API running at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "📊 Monitor with: pm2 status"
echo "📝 Logs with: pm2 logs finding-the-rock-api"
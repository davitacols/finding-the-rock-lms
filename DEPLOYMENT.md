# Finding the Rock - Deployment Guide

## Quick Deployment

### Option 1: Local Deployment (Windows)
```bash
# Run the deployment script
deploy.bat
```

### Option 2: Local Deployment (Linux/Mac)
```bash
# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

### Option 3: Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build -d
```

## Manual Deployment Steps

### 1. Frontend Build
```bash
cd frontend
npm install
npm run build
```

### 2. Backend Setup
```bash
cd backend
npm install --production
mkdir -p public
cp -r ../frontend/build/* public/
```

### 3. Environment Configuration
- Copy `.env.production` to `.env` in backend folder
- Update database and AWS credentials as needed

### 4. Start Application
```bash
cd backend
npm start
```

## Production Deployment

### AWS EC2 Deployment
1. Launch EC2 instance (t3.medium recommended)
2. Install Node.js 18+ and npm
3. Clone repository
4. Run deployment script
5. Configure security groups (port 5000)
6. Set up SSL with nginx/CloudFront

### Docker on AWS ECS
1. Build and push Docker image to ECR
2. Create ECS task definition
3. Deploy to ECS cluster
4. Configure load balancer

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://your-domain.com/api
REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_F6mrWuxuI
REACT_APP_COGNITO_CLIENT_ID=21ercn6i5emt61re8fsmk32t14
```

### Backend (.env)
```
NODE_ENV=production
PORT=5000
DB_HOST=your-rds-endpoint
DB_USER=your-db-user
DB_PASSWORD=your-db-password
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Health Check
- Endpoint: `GET /api/health`
- Returns application status and uptime

## Monitoring
- Application runs on port 5000
- Health checks every 30 seconds
- Automatic restart on failure

## Troubleshooting
- Check logs: `docker-compose logs -f`
- Verify environment variables
- Ensure database connectivity
- Check AWS credentials and permissions
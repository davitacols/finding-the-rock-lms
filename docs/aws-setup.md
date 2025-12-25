# AWS Setup Guide for Finding the Rock LMS

## 1. Create AWS Account
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Complete registration with email and payment method

## 2. Install AWS CLI
**Windows:**
```bash
# Download and install from: https://aws.amazon.com/cli/
# Or use chocolatey:
choco install awscli
```

**Verify installation:**
```bash
aws --version
```

## 3. Create IAM User
1. Go to AWS Console → IAM → Users
2. Click "Add users"
3. Username: `lms-admin`
4. Access type: ✅ Programmatic access
5. Attach policies:
   - `AdministratorAccess` (for initial setup)
6. Download credentials CSV file

## 4. Configure AWS CLI
```bash
aws configure
```
Enter:
- AWS Access Key ID: [from CSV file]
- AWS Secret Access Key: [from CSV file]  
- Default region: `us-east-1`
- Default output format: `json`

## 5. Test AWS Connection
```bash
aws sts get-caller-identity
```

## 6. Deploy Infrastructure
```bash
# Clone/navigate to project
cd hotr

# Make deploy script executable (if on Linux/Mac)
chmod +x deploy.sh

# Deploy to development environment
./deploy.sh dev
```

## 7. Get Stack Outputs
After deployment, get these values:
```bash
# Database endpoint
aws cloudformation describe-stacks --stack-name lms-dev --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' --output text

# Cognito User Pool ID
aws cloudformation describe-stacks --stack-name lms-dev --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' --output text

# Cognito Client ID
aws cloudformation describe-stacks --stack-name lms-dev --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' --output text
```

## 8. Update Environment Files
Create `.env` in root directory:
```bash
cp .env.example .env
```

Update with actual values from stack outputs.

Create `frontend/.env`:
```bash
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=[your_user_pool_id]
REACT_APP_COGNITO_CLIENT_ID=[your_client_id]
```

## 9. Start Application
```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## 10. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api

## Troubleshooting
- **Permission denied**: Check IAM user has required permissions
- **Region mismatch**: Ensure all services in same region
- **Stack creation failed**: Check CloudFormation events in AWS Console
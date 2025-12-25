@echo off
echo Setting up Finding the Rock LMS on Windows...

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo AWS CLI not found. Please install from: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Please install from: https://nodejs.org/
    pause
    exit /b 1
)

REM Set environment (default to dev)
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=dev

echo Deploying to environment: %ENVIRONMENT%

REM Deploy CloudFormation stack
echo Deploying AWS infrastructure...
aws cloudformation deploy ^
    --template-file infrastructure/cloudformation.yaml ^
    --stack-name lms-%ENVIRONMENT% ^
    --parameter-overrides Environment=%ENVIRONMENT% ^
    --capabilities CAPABILITY_IAM

if %errorlevel% neq 0 (
    echo CloudFormation deployment failed
    pause
    exit /b 1
)

REM Get stack outputs
echo Getting stack outputs...
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name lms-%ENVIRONMENT% --query "Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue" --output text') do set DB_ENDPOINT=%%i
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name lms-%ENVIRONMENT% --query "Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue" --output text') do set USER_POOL_ID=%%i
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name lms-%ENVIRONMENT% --query "Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue" --output text') do set USER_POOL_CLIENT_ID=%%i

REM Create .env file
echo Creating environment configuration...
(
echo NODE_ENV=%ENVIRONMENT%
echo PORT=3000
echo DB_HOST=%DB_ENDPOINT%
echo DB_PORT=5432
echo DB_NAME=lmsdb
echo DB_USER=lmsadmin
echo DB_PASSWORD=your_secure_password_here
echo AWS_REGION=us-east-1
echo COGNITO_USER_POOL_ID=%USER_POOL_ID%
echo COGNITO_CLIENT_ID=%USER_POOL_CLIENT_ID%
echo JWT_SECRET=your_jwt_secret_here
) > .env

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Backend npm install failed
    pause
    exit /b 1
)

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Frontend npm install failed
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ Setup complete!
echo.
echo 📊 Stack Information:
echo    Database Endpoint: %DB_ENDPOINT%
echo    User Pool ID: %USER_POOL_ID%
echo.
echo 🔧 Next Steps:
echo 1. Update .env file with your secure passwords
echo 2. Start backend: cd backend ^&^& npm start
echo 3. Start frontend: cd frontend ^&^& npm start
echo.
pause
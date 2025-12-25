@echo off
echo 🚀 Starting deployment process...

REM Build frontend
echo 📦 Building frontend...
cd frontend
call npm install
call npm run build

REM Copy build to backend public folder
echo 📁 Copying frontend build to backend...
cd ..\backend
if not exist public mkdir public
xcopy ..\frontend\build\* public\ /E /Y

REM Install backend dependencies
echo 📦 Installing backend dependencies...
call npm install --production

REM Start the application
echo 🎉 Deployment complete! Starting application...
call npm start
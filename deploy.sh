#!/bin/bash

echo "🚀 Starting deployment process..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

# Copy build to backend public folder
echo "📁 Copying frontend build to backend..."
cd ../backend
mkdir -p public
cp -r ../frontend/build/* public/

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install --production

# Start the application
echo "🎉 Deployment complete! Starting application..."
npm start
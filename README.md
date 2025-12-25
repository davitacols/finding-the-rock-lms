# Finding the Rock - Church Discipleship Learning Management System

A comprehensive online learning platform for church discipleship courses built on AWS.

## Courses
- **Finding the Rock** (12 weeks) - Prerequisite course
- **Understanding Spiritual Authority** (14-20 weeks) - Advanced course

## Architecture Overview
- **Frontend**: React.js with responsive design
- **Backend**: Node.js with Express.js
- **Database**: AWS RDS (PostgreSQL)
- **Authentication**: AWS Cognito
- **Storage**: AWS S3 for videos and documents
- **CDN**: AWS CloudFront
- **Video Processing**: AWS MediaConvert
- **Serverless Functions**: AWS Lambda

## Key Features
- User management with role-based access
- Course progression tracking
- Live session attendance tracking
- Video streaming and content delivery
- Assessment and grading system
- Certificate generation
- Comprehensive reporting and analytics

## Quick Start
1. Install dependencies: `npm install`
2. Configure AWS credentials
3. Set up environment variables
4. Run database migrations
5. Start development server: `npm run dev`

## Project Structure
```
/backend          - Node.js API server
/frontend         - React.js application
/database         - Database schemas and migrations
/infrastructure   - AWS CloudFormation templates
/docs            - Documentation and architecture diagrams
```
# Multi-stage build for React frontend and Node.js backend
FROM node:18-alpine AS frontend-build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend

WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production

# Copy backend files
COPY backend/ ./

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./public

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
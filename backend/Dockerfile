# Multi-stage production Dockerfile for Student Management Backend & MCP Server
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies needed for production
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose standard port
ENV PORT=5000
EXPOSE 5000

# Healthcheck to verify the server is active
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Default start command runs the REST API + MCP endpoints
CMD ["npm", "start"]

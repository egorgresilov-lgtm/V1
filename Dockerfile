FROM node:18-alpine

WORKDIR /app

# Copy glen directory (where package.json is located)
COPY glen/ ./

# Use production environment configuration
RUN cp .env.production .env || true

# Install dependencies
RUN npm ci --only=production

# Set environment variables (override if needed)
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start application directly with Node.js (more reliable in containers)
CMD ["node", "server.js"]

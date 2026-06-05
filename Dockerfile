FROM node:18-alpine

WORKDIR /app

# Copy glen directory
COPY glen/ ./

# Install dependencies
RUN npm ci --only=production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]

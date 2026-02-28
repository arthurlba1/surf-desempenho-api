# Use Node.js 20 (non-Alpine - better SSL/TLS compatibility with MongoDB Atlas)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port (Cloud Run uses 8080 by default)
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start:prod"]
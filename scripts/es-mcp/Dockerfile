# Dockerfile for Elasticsearch MCP Server
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock tsconfig.json ./

# Install dependencies
RUN yarn install --production=false

# Copy all source files and data
COPY src/ ./src/
COPY data/ ./data/

# Expose HTTP port
EXPOSE 8001

# Default command (can be overridden)
CMD ["yarn", "rag:server"]



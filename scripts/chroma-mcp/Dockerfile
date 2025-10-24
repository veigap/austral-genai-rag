# Use Node.js LTS
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Default command (overridden by docker-compose)
CMD ["yarn", "chroma:data:setup"]




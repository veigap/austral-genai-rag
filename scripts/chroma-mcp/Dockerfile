# Use Node.js LTS with Ubuntu base (has required libraries for ONNX)
FROM node:20-slim

WORKDIR /app

# Install required system dependencies for ONNX runtime
RUN apt-get update && apt-get install -y \
    libc6 \
    libgcc-s1 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with verbose output
RUN yarn install --frozen-lockfile --verbose

# Verify chromadb-default-embed installation
RUN node -e "console.log('Testing chromadb-default-embed...'); try { require('chromadb-default-embed'); console.log('✅ chromadb-default-embed installed successfully'); } catch(e) { console.error('❌ chromadb-default-embed not found:', e.message); process.exit(1); }"

# Copy source code
COPY . .

# Default command (overridden by docker-compose)
CMD ["yarn", "chroma:data:setup"]




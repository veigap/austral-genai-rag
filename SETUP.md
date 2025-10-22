# Project Setup Guide

## Environment Variables

This project requires a Google API key for the Generative AI features.

### Creating the .env file

1. **Create a `.env` file** in the project root:
   ```bash
   touch .env
   ```

2. **Add your Google API key**:
   ```bash
   # .env
   GOOGLE_API_KEY=your-actual-api-key-here
   
   # Elasticsearch Configuration
   ELASTICSEARCH_URL=http://localhost:9200
   
   # ChromaDB Configuration
   CHROMA_URL=http://localhost:8000
   CHROMA_EMBEDDING_FUNCTION=default  # Options: default, openai, cohere, jina, voyageai, roboflow
   
   # Note: GOOGLE_API_KEY above is for the AI model (Google Gemini)
   # ChromaDB embeddings are separate and use their own API keys if needed
   # Default embedding (MiniLM-L6-v2) doesn't need an API key
   ```

3. **Get your Google API key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key and paste it in your `.env` file

**Note**: The `.env` file is automatically loaded using the `dotenv` package at the start of each executable script. No additional configuration is needed!

### Security Note

⚠️ **IMPORTANT**: Never commit your `.env` file to version control! 

The `.env` file is already listed in `.gitignore` to prevent accidental commits. Always keep your API keys secure and private.

## Quick Start

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Start Elasticsearch and Kibana**:
   ```bash
   yarn elasticsearch:start
   ```

3. **In a new terminal, run an example**:
   ```bash
   # Direct RAG example (no agents)
   yarn rag:direct

   # Agent-based RAG example
   yarn rag:agent

   # Agent with MCP example
   yarn rag:agent-mcp
   ```

## Available Scripts

See `package.json` for all available commands.

### MCP Servers (stdio)
- `yarn mcp:math` - Math operations MCP server
- `yarn mcp:weather` - Weather information MCP server  
- `yarn mcp:elasticsearch` - Elasticsearch MCP server

### RAG Examples
- `yarn rag:direct` - Direct RAG without agents
- `yarn rag:agent` - Agent-based RAG
- `yarn rag:agent-mcp` - Agent with MCP integration
- `yarn rag:simple` - Simple MCP client example

### Elasticsearch
- `yarn elasticsearch:start` - Start Elasticsearch + Kibana (with auto data setup)
- `yarn elasticsearch:stop` - Stop all services
- `yarn elasticsearch:logs` - View logs
- `yarn data:setup` - Manually run data initialization

## Troubleshooting

### Missing API Key Error

If you see errors like `"Please set an API key for Google GenerativeAI"`, make sure:
1. You created the `.env` file in the project root
2. The `.env` file contains `GOOGLE_API_KEY=your-key`
3. The key is valid and not expired

### Elasticsearch Connection Issues

If you can't connect to Elasticsearch:
1. Make sure Docker is running
2. Check if Elasticsearch started: `docker ps`
3. View logs: `yarn elasticsearch:logs`
4. Try restarting: `yarn elasticsearch:stop && yarn elasticsearch:start`


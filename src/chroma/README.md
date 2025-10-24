# ChromaDB RAG Examples

This directory contains ChromaDB-related files for RAG (Retrieval-Augmented Generation) examples.

## Overview

ChromaDB is a vector database designed for AI applications. Unlike Elasticsearch, ChromaDB is specifically built for semantic search using embeddings, making it ideal for AI-powered search and retrieval.

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Docker Compose Stack                   │
│                                                  │
│  ChromaDB:8000 ←──────┐                         │
│                       │                          │
└───────────────────────┼──────────────────────────┘
                        │
                        │ HTTP connection
                        │ (localhost:8000)
                        │
┌───────────────────────┼──────────────────────────┐
│              Local Machine                       │
│                      │                           │
│  chroma-mcp ─────────┘                           │
│  (Python via pip)                                │
│       ↑                                          │
│       │ stdio                                    │
│       │                                          │
│  (LangChain Agent)                               │
└──────────────────────────────────────────────────┘
```

## Files

### `setup-data.ts`
Initializes ChromaDB with sample product data from the shared `data/products.json` file.

**Features:**
- Loads products from shared JSON data file
- Creates a "products" collection
- Adds documents with embeddings
- Includes metadata (name, category, price, description, stock)

## Quick Start

### 1. Start ChromaDB

```bash
yarn chroma:start
```

This will:
- Start ChromaDB in Docker (port 8000)
- Automatically initialize with sample product data
- Keep running in foreground mode

### 2. Install chroma-mcp (Python MCP Server)

The official Chroma MCP server is a Python package. Install it using `pip`:

```bash
# Install chroma-mcp
pip3 install chroma-mcp

# Verify installation
python3 -m chroma_mcp --help
```

### 3. Run the Example

```bash
# In a new terminal
```

## How It Works

### Case 4: Agent with Chroma MCP


**Flow:**
1. Client spawns `chroma-mcp` Python server via stdio using `python3 -m chroma_mcp`
2. The MCP server connects to ChromaDB via HTTP (`http://localhost:8000`)
3. LangChain agent auto-discovers Chroma tools via MCP
4. Agent uses semantic search to find relevant products
5. Agent provides recommendations based on retrieved data

**Key Features:**
- **Automatic tool discovery** - No manual tool definitions needed
- **Semantic search** - Uses embeddings for meaning-based search
- **Official MCP server** - Uses the official `chroma-mcp` Python package
- **stdio communication** - MCP server auto-spawned by client

## Available Commands

```bash
# Start ChromaDB with auto data initialization
yarn chroma:start

# Stop ChromaDB
yarn chroma:stop

# Manually run data setup (usually not needed)
yarn chroma:data:setup

# Run Case 4: Agent with Chroma MCP
```

## Environment Variables

Required in `.env`:

```bash
# Google API Key (for the AI model)
GOOGLE_API_KEY=your-google-api-key-here

# ChromaDB URL (optional, defaults to http://localhost:8000)
CHROMA_URL=http://localhost:8000

# Embedding Function (optional, defaults to 'default')
# Options: default, openai, cohere, jina, voyageai, roboflow
CHROMA_EMBEDDING_FUNCTION=default

# IMPORTANT: GOOGLE_API_KEY above is for the AI model (Google Gemini)
# ChromaDB embeddings are separate! Default embedding doesn't need an API key.
```

## Embedding Configuration (Educational)

For educational purposes, this example explicitly configures the embedding function, showing how to customize it.

### Default Embedding (MiniLM-L6-v2)

**No additional configuration needed!** The default setup uses:
- **Model**: MiniLM-L6-v2 
- **Runtime**: OnnxRuntime (runs locally)
- **Dimensions**: 384
- **API Key**: None required
- **Cost**: Free

### Using OpenAI Embeddings (Optional Advanced Topic)

**Note:** The AI model (Google Gemini) is separate from embeddings. 
- **AI Model**: Uses `GOOGLE_API_KEY` for generating text responses
- **Embeddings**: Only needed if you want OpenAI embeddings instead of default

For OpenAI embeddings (optional, requires separate API key):

1. **Update `.env`**:
```bash
# Keep your existing GOOGLE_API_KEY for the AI model
GOOGLE_API_KEY=your-google-api-key

# Add ChromaDB OpenAI embedding configuration
CHROMA_EMBEDDING_FUNCTION=openai
CHROMA_OPENAI_API_KEY=sk-your-openai-embedding-key
```

2. **Restart ChromaDB**:
```bash
yarn chroma:stop
yarn chroma:start
```

3. **Run the example**:
```bash
```

**Why two API keys?**
- **GOOGLE_API_KEY**: For AI text generation (Google Gemini)
- **CHROMA_OPENAI_API_KEY**: For document embeddings (OpenAI embeddings)

### Comparison: Default vs OpenAI

| Feature | Default (MiniLM-L6-v2) | OpenAI (ada-002) |
|---------|------------------------|------------------|
| **Quality** | Good | Excellent |
| **Speed** | Very fast (local) | Fast (API) |
| **Cost** | Free | ~$0.0001 per 1K tokens |
| **API Key** | Not needed | Required |
| **Dimensions** | 384 | 1536 |
| **Use Case** | Development, testing | Production |

### Other Embedding Options

**Remember:** Keep `GOOGLE_API_KEY` for the AI model. These are additional embeddings API keys:

```bash
# Cohere Embeddings
CHROMA_EMBEDDING_FUNCTION=cohere
CHROMA_COHERE_API_KEY=your-cohere-key

# Jina Embeddings
CHROMA_EMBEDDING_FUNCTION=jina
CHROMA_JINA_API_KEY=your-jina-key

# VoyageAI Embeddings
CHROMA_EMBEDDING_FUNCTION=voyageai
CHROMA_VOYAGEAI_API_KEY=your-voyage-key

# Roboflow Embeddings
CHROMA_EMBEDDING_FUNCTION=roboflow
CHROMA_ROBOFLOW_API_KEY=your-roboflow-key
```

**Key Concept:**
- AI Model (Google Gemini) = GOOGLE_API_KEY (always needed)
- Embeddings (ChromaDB) = Optional, only if not using default

## Data Source

All product data is loaded from the shared file: `data/products.json`

This ensures consistency across both Elasticsearch and ChromaDB examples.

## ChromaDB vs Elasticsearch

| Feature | ChromaDB | Elasticsearch |
|---------|----------|---------------|
| **Primary Use** | Vector/semantic search | Full-text + structured search |
| **Embeddings** | Built-in | Requires plugin |
| **Setup** | Simple | More complex |
| **Metadata** | Yes | Yes |
| **Search Type** | Semantic similarity | Text matching + filters |
| **Best For** | AI/ML applications | Traditional search engines |

## ChromaDB Query Console

We've created an interactive query console for exploring ChromaDB:

```bash
# Start the interactive console
yarn chroma:console
```

Available commands:
- `list` - List all collections
- `peek <collection>` - Show first 5 documents
- `peek <collection> <n>` - Show first N documents  
- `query <collection> <text>` - Search collection
- `query <collection> <text> <n>` - Search with N results
- `help` - Show help
- `exit` - Exit console

Example session:
```
chroma> list
📚 Available Collections:
   📦 products (5 documents)

chroma> query products laptop
🔍 Searching "products" for: "laptop"
   Found 2 results:
   
   1. ID: 1
      Distance: 0.3421
      Metadata: {"name":"MacBook Pro 16\"","category":"Laptop","price":2499}
      Document: MacBook Pro 16". Powerful laptop with M3 Pro chip...
```

## Troubleshooting

### API Version Error

If you see "The v1 API is deprecated. Please use /v2 apis":

```bash
# The docker-compose.yml pins ChromaDB to version 0.4.24
# which is compatible with chromadb npm package 3.0.17

# Rebuild and restart:
yarn chroma:stop
yarn chroma:start
```

### ChromaDB Connection Issues

If you can't connect to ChromaDB:

```bash
# Check if ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat

# View logs
docker logs chroma-mcp

# Restart
yarn chroma:stop && yarn chroma:start
```

### chroma-mcp/Python Issues

If `chroma-mcp` is not found:

```bash
# Install chroma-mcp
pip3 install chroma-mcp

# Verify it's installed
python3 -m chroma_mcp --help

# If you get "No module named chroma_mcp":
# Make sure you're using the correct Python/pip
which python3
which pip3
```

### Missing Data

If the collection is empty:

```bash
# Manually run data setup
yarn chroma:data:setup
```

## MCP Tools Provided by chroma-mcp

The official `chroma-mcp` server provides these tools:

- `chroma_list_collections` - List all collections
- `chroma_create_collection` - Create a new collection
- `chroma_get_collection_info` - Get collection details
- `chroma_add_documents` - Add documents with embeddings
- `chroma_query_documents` - Semantic search
- `chroma_get_documents` - Retrieve specific documents
- `chroma_update_documents` - Update documents
- `chroma_delete_documents` - Delete documents
- `chroma_delete_collection` - Delete a collection

## Learn More

- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Official chroma-mcp GitHub](https://github.com/chroma-core/chroma-mcp)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)


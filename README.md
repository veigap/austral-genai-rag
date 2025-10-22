# AI Agents Tutorial

A comprehensive tutorial on building AI agents with LangChain, Model Context Protocol (MCP), and Retrieval-Augmented Generation (RAG).

## 📚 What's Inside

This repository contains examples and tutorials for:

1. **LangChain Agents** - Basic agent setup with tools
2. **MCP Servers** - Model Context Protocol implementations (stdio-based)
3. **RAG Examples** - Retrieval-Augmented Generation with Elasticsearch
4. **Production Patterns** - Best practices for AI applications

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
yarn install
```

### ⚙️ Environment Setup (Required!)

Create a `.env` file in the project root:

```bash
# Create the file
touch .env

# Add your Google API key (get from https://makersuite.google.com/app/apikey)
echo "GOOGLE_API_KEY=your-actual-api-key-here" >> .env
echo "ELASTICSEARCH_URL=http://localhost:9200" >> .env
```

**📖 See [SETUP.md](SETUP.md) for detailed instructions**

### Try the Examples

**1. Simple RAG (No agents, no MCP):**
```bash
# Start Elasticsearch + Kibana
yarn elasticsearch:start

# In another terminal
yarn rag:case1
```

**2. Agent-based RAG:**
```bash
# Elasticsearch should already be running
yarn rag:case2
```

**3. Production RAG with MCP:**
```bash
# Start Elasticsearch
yarn elasticsearch:start

# In another terminal, start MCP server
yarn mcp:elasticsearch

# In a third terminal, run agent
yarn rag:case3
```

## 📂 Project Structure

```
.
├── src/
│   ├── mcp/                        # MCP server examples (stdio)
│   │   ├── math-io.ts              # Math operations
│   │   └── weather-http.ts         # Weather service  
│   └── rag/                        # RAG with Elasticsearch
│       ├── elasticsearch-mcp-server.ts  # MCP server for ES (stdio)
│       ├── setup-data.ts           # Sample data setup
│       └── README.md               # 📖 RAG DOCUMENTATION
│
├── test/
│   ├── mcp/                        # MCP client tests
│   │   ├── test-mcp-stdio-client.ts
│   │   └── test-mcp-http-client.ts
│   └── rag/                        # RAG examples
│       ├── case1:direct-rag-example.ts     # ⭐ Start here
│       ├── case2: agent-rag-example.ts     # Agent with tools
│       ├── case3: agent-mcp-example.ts     # ⭐⭐ Production
│       └── README.md               # RAG examples guide
│
├── scripts/
│   └── es-mcp/                     # Docker setup
│       ├── docker-compose.yml      # ES + Kibana + data init
│       └── Dockerfile              # Data initialization container
│
├── resources/
│   └── MCP-Weather-Server.postman_collection.json  # API tests
│
├── .env.example                    # Environment variables template
├── .gitignore                      # Excludes .env from git
└── SETUP.md                        # 📖 Setup instructions
```

## 📖 Documentation

### Main Guides

- **[SETUP.md](SETUP.md)** - Environment setup and API keys
- **[RAG Documentation](src/rag/README.md)** - Comprehensive guide to all RAG examples
- **[RAG Examples](test/rag/README.md)** - Quick comparison and use cases
- **[Postman Resources](resources/README.md)** - API testing examples

### Key Concepts

**MCP (Model Context Protocol):**
- Standard protocol for AI tool integration
- JSON-RPC 2.0 based
- Supports stdio and HTTP transports
- Perfect for microservices

**RAG (Retrieval-Augmented Generation):**
- Search your data (Elasticsearch)
- Pass context to AI model
- Get accurate, grounded responses
- Reduces hallucinations

**Agents:**
- AI that decides when to use tools
- Multi-step reasoning
- Natural conversation
- Framework: LangChain

## 🎯 Examples Overview

### Case 1: Direct RAG ⭐ (Simplest)

**Best for:** Learning RAG basics

```bash
yarn elasticsearch:start
yarn rag:case1
```

**What it does:** Search → AI → Answer (no agents, no complexity)

**Features:**
- 🔍 Debug logging shows ES queries and results
- 📊 Relevance scores displayed
- 🎯 Simple, linear flow

### Case 2: Agent with Tools

**Best for:** Smart assistants, chatbots

```bash
yarn elasticsearch:start
yarn rag:case2
```

**What it does:** Agent decides when/how to search, then generates response

**Features:**
- 🤖 Agent intelligence
- 🔧 Custom tools
- 🔍 Debug logging for all searches

### Case 3: Agent + MCP ⭐⭐ (Production)

**Best for:** Production apps, microservices, scalability

```bash
yarn elasticsearch:start    # Terminal 1
yarn mcp:elasticsearch      # Terminal 2
yarn rag:case3             # Terminal 3
```

**What it does:** Agent + MCP protocol + Elasticsearch = Scalable architecture

**Features:**
- 🏗️ Microservices architecture
- 📡 stdio-based MCP communication
- 🔄 Decoupled components
- 🔍 Debug logging in MCP server

## 🛠️ All Commands

### Elasticsearch Stack
```bash
yarn elasticsearch:start     # Start ES + Kibana + auto-load data
yarn elasticsearch:stop      # Stop all containers
yarn elasticsearch:logs      # View all logs
```

**What you get:**
- ✅ **Elasticsearch** at http://localhost:9200
- ✅ **Kibana UI** at http://localhost:5601 (auto-configured!)
- ✅ **Sample data** auto-loaded (5 products + 4 customers)

### RAG Examples
```bash
yarn rag:case1              # Direct RAG (no agents, no MCP)
yarn rag:case2              # Agent with tools (no MCP)
yarn rag:case3              # Agent + MCP (production)
```

### MCP Servers (stdio)
```bash
yarn mcp:math               # Math operations server
yarn mcp:weather            # Weather service server
yarn mcp:elasticsearch      # Elasticsearch MCP server
```

### Data Management
```bash
yarn data:setup             # Manually run data initialization
```

### Tests
```bash
yarn test-mcp-io            # Test stdio MCP server
yarn test-mcp-http          # Test HTTP MCP server (legacy)
```

## 🖥️ Web Interfaces

When running with Docker:

- **Elasticsearch:** http://localhost:9200
- **Kibana UI:** http://localhost:5601
- **Kibana Dev Tools:** http://localhost:5601/app/dev_tools#/console

## 🔧 Technologies

- **TypeScript** - Type-safe JavaScript
- **LangChain** - AI agent framework
- **@langchain/mcp-adapters** - MCP integration for LangChain
- **Google Gemini** - AI model (via API key)
- **Elasticsearch** - Search engine
- **Docker** - Containerization
- **dotenv** - Environment variable management
- **Zod** - Schema validation
- **tsx** - TypeScript execution

## 📦 Key Dependencies

```json
{
  "langchain": "^1.0.0-alpha.9",
  "@langchain/core": "^1.0.0-alpha.7",
  "@langchain/google-genai": "^1.0.0",
  "@langchain/mcp-adapters": "^1.0.0",
  "@elastic/elasticsearch": "^8.11.0",
  "@modelcontextprotocol/sdk": "^1.20.1",
  "dotenv": "^17.2.3",
  "tsx": "^4.19.2"
}
```

## 🎓 Learning Path

1. **Setup environment:**
   ```bash
   # Create .env with your Google API key
   cat > .env << EOF
   GOOGLE_API_KEY=your-key-here
   ELASTICSEARCH_URL=http://localhost:9200
   EOF
   ```

2. **Start Elasticsearch:**
   ```bash
   yarn elasticsearch:start
   ```

3. **Learn RAG (simplest):**
   ```bash
   yarn rag:case1  # Watch the debug output!
   ```

4. **Try agent intelligence:**
   ```bash
   yarn rag:case2  # See how the agent decides
   ```

5. **Go production with MCP:**
   ```bash
   yarn mcp:elasticsearch  # Terminal 2
   yarn rag:case3         # Terminal 3
   ```

6. **Explore Kibana:**
   - Go to: http://localhost:5601/app/dev_tools#/console
   - Try: `GET /products/_search`

## 🌟 Highlights

### Debug Logging

All RAG examples now show:
- 📤 **Elasticsearch queries** sent
- 📥 **Raw results** returned
- 🎯 **Relevance scores** for each hit
- 📊 **Total hits** and metadata

Example output:
```
📤 Elasticsearch Query:
{
  "index": "products",
  "query": {
    "multi_match": {
      "query": "laptop",
      "fields": ["name", "description", "category"]
    }
  },
  "size": 5
}

📥 Elasticsearch Results:
   Total hits: 3
   Max score: 2.45
   1. [Score: 2.45] Dell XPS 15 ($1299.99)
   2. [Score: 1.87] MacBook Pro 14" ($1999.99)
```

### MCP Adapters (Auto-discovery!)

The project uses `@langchain/mcp-adapters` which **automatically** discovers tools:

```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// Magic! Auto-discovers tools from MCP server
const mcpClient = new MultiServerMCPClient({
    elasticsearch: {
        type: "stdio",
        command: "yarn",
        args: ["mcp:elasticsearch"]
    }
});

await mcpClient.initializeConnections();
const tools = await mcpClient.getTools();  // ✨ No manual definitions!
```

### Production-Ready Architecture (Case 3)

```
User Question
    ↓
Agent (LangChain)
    ↓
MCP Adapter (auto-discovers tools)
    ↓
stdio → MCP Server (in separate process)
    ↓
Elasticsearch (your data)
    ↓
Response → Agent → User
```

## 🐛 Troubleshooting

### Missing API Key Error

```bash
# Make sure .env file exists
ls -la .env

# Should contain:
# GOOGLE_API_KEY=your-key-here
# ELASTICSEARCH_URL=http://localhost:9200
```

See [SETUP.md](SETUP.md) for detailed instructions.

### Elasticsearch won't start

```bash
# Check if port 9200 is in use
lsof -i :9200

# Remove old containers
yarn elasticsearch:stop
docker system prune -a

# Start fresh
yarn elasticsearch:start
```

### Module not found

```bash
# Reinstall dependencies
rm -rf node_modules
yarn install
```

### MCP server not responding

```bash
# Test the server directly
yarn mcp:elasticsearch

# You should see:
# "Elasticsearch MCP server running on stdio"
```

## 📚 Additional Resources

- [LangChain Documentation](https://js.langchain.com/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Kibana Guide](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Get your API key

## 💡 Tips

1. **Always create `.env` first** with your Google API key
2. **Use Kibana** for Elasticsearch queries (much better than curl!)
3. **Start simple** with `rag:case1` before moving to MCP
4. **Check logs** if something fails: `yarn elasticsearch:logs`
5. **Use MCP adapters** - they auto-discover tools (no manual setup!)
6. **Debug logging** - All examples show ES queries and results
7. **Production?** Use `rag:case3` pattern with stdio MCP

## 🔒 Security

- ✅ `.env` is in `.gitignore` - never committed
- ✅ No API keys hardcoded in code
- ✅ `dotenv` automatically loads environment variables
- ✅ See [SETUP.md](SETUP.md) for security best practices

## 📝 License

MIT

## 🤝 Contributing

This is a tutorial project. Feel free to use it for learning!

---

**Ready to start?** 

```bash
# 1. Setup environment
echo "GOOGLE_API_KEY=your-key-here" > .env
echo "ELASTICSEARCH_URL=http://localhost:9200" >> .env

# 2. Start Elasticsearch
yarn elasticsearch:start

# 3. In another terminal, run examples
yarn rag:case1
```

## ✨ What Gets Initialized Automatically:

When you run `yarn elasticsearch:start`, Docker Compose orchestrates:

1. **Elasticsearch** starts and becomes healthy
2. **Kibana** starts (auto-configured to Elasticsearch)
3. **Data Initialization** runs once:
   - Creates `products` index with 5 sample products
   - Creates `customers` index with 4 sample customers
   - Exits after completion

**All ready to use** - no manual steps! 🚀

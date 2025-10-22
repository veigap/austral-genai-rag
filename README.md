# AI Agents Tutorial

A comprehensive tutorial on building AI agents with LangChain, Model Context Protocol (MCP), and Retrieval-Augmented Generation (RAG).

## 📚 What's Inside

This repository contains examples and tutorials for:

1. **LangChain Agents** - Basic agent setup with tools
2. **MCP Servers** - Model Context Protocol implementations
3. **RAG Examples** - Retrieval-Augmented Generation with Elasticsearch
4. **Production Patterns** - Best practices for AI applications

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
yarn install

# Or if you prefer npm
npm install
```

### Try the Examples

**1. Simple LangChain Agent:**
```bash
yarn start
```

**2. RAG with Elasticsearch:**
```bash
# Start everything (ES + Kibana + MCP + auto-loads data)
yarn elasticsearch_mcp:start

# In another terminal, run RAG example
yarn rag:direct
```

**3. Production RAG with MCP:**
```bash
# Start everything (same command!)
yarn elasticsearch_mcp:start

# In another terminal, run agent
yarn rag:agent-mcp
```

## 📂 Project Structure

```
.
├── src/
│   ├── hello.ts                    # Basic LangChain agent
│   ├── mcp/                        # MCP server examples
│   │   ├── math-io.ts              # Math operations (stdio)
│   │   └── weather-http.ts         # Weather service (HTTP)
│   └── rag/                        # RAG with Elasticsearch
│       ├── elasticsearch-mcp-server.ts  # MCP server for ES
│       ├── setup-data.ts           # Sample data setup
│       └── README.md               # 📖 RAG DOCUMENTATION
│
├── test/
│   ├── mcp/                        # MCP client tests
│   └── rag/                        # RAG examples
│       ├── 1 - direct-rag-example.ts    # ⭐ Start here
│       ├── 2 - agent-rag-example.ts     # Agent with tools
│       ├── 3-agent-mcp-example.ts       # ⭐⭐ Production
│       └── README.md               # RAG examples guide
│
├── scripts/
│   └── es-mcp/                     # Docker setup
│       ├── docker-compose.yml      # ES + Kibana + MCP
│       └── Dockerfile              # MCP server container
│
└── resources/
    └── MCP-Weather-Server.postman_collection.json  # API tests
```

## 📖 Documentation

### Main Guides

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

### 1. Direct RAG ⭐ (Simplest)

**Best for:** Learning RAG basics

```bash
yarn elasticsearch:start
yarn elasticsearch:setup
yarn rag:direct
```

**What it does:** Search → AI → Answer (no complexity)

### 2. Agent with Tools

**Best for:** Smart assistants, chatbots

```bash
yarn elasticsearch:start
yarn elasticsearch:setup
yarn rag:agent
```

**What it does:** Agent decides when to search, then generates response

### 3. Agent + MCP ⭐⭐ (Production)

**Best for:** Production apps, microservices

```bash
yarn elasticsearch_mcp:start  # Auto-initializes data
yarn rag:agent-mcp
```

**What it does:** Agent + MCP protocol + Elasticsearch = Scalable architecture

## 🛠️ All Commands

### Elasticsearch + MCP Stack
```bash
yarn elasticsearch_mcp:start  # Start ES + Kibana + MCP + auto-load data
yarn elasticsearch_mcp:stop   # Stop all containers
yarn elasticsearch_mcp:logs   # View all logs
```

**What you get:**
- ✅ **Elasticsearch** at http://localhost:9200
- ✅ **Kibana UI** at http://localhost:5601 (auto-configured!)
- ✅ **MCP Server** at http://localhost:8001
- ✅ **Sample data** auto-loaded (5 products + 4 customers)

### RAG Examples
```bash
yarn rag:direct              # Simple RAG (no agents, no MCP)
yarn rag:agent               # Agent with tools (no MCP)
yarn rag:agent-mcp           # Agent + MCP (production)
yarn rag:simple              # Simple MCP client
```

### MCP Servers
```bash
yarn mcp:math                # Math operations (stdio)
yarn mcp:weather             # Weather service (HTTP)
yarn rag:server              # Elasticsearch MCP server
```

### Tests
```bash
yarn test-mcp-io             # Test stdio MCP server
yarn test-mcp-http           # Test HTTP MCP server
```

## 🖥️ Web Interfaces

When running with Docker:

- **Elasticsearch:** http://localhost:9200
- **Kibana UI:** http://localhost:5601
- **MCP Server:** http://localhost:8001/mcp

## 🔧 Technologies

- **TypeScript** - Type-safe JavaScript
- **LangChain** - AI agent framework
- **@langchain/mcp-adapters** - MCP integration for LangChain
- **Google Gemini** - AI model
- **Elasticsearch** - Search engine
- **Docker** - Containerization
- **Express** - HTTP server
- **Zod** - Schema validation

## 📦 Key Dependencies

```json
{
  "langchain": "^1.0.1",
  "@langchain/core": "^1.0.1",
  "@langchain/langgraph": "^1.0.0",
  "@langchain/google-genai": "^1.0.0",
  "@langchain/mcp-adapters": "^1.0.0",
  "@elastic/elasticsearch": "^9.1.1",
  "@modelcontextprotocol/sdk": "^1.20.1"
}
```

## 🎓 Learning Path

1. **Start with basics:**
   ```bash
   yarn start  # Basic LangChain agent
   ```

2. **Start the full stack:**
   ```bash
   yarn elasticsearch_mcp:start  # Starts everything!
   ```

3. **Learn RAG:**
   ```bash
   # In another terminal
   yarn rag:direct  # Simplest RAG example
   ```

4. **Try agent intelligence:**
   ```bash
   yarn rag:agent  # Agent decides when to search
   ```

5. **Go production:**
   ```bash
   yarn rag:agent-mcp  # Full MCP architecture
   ```

6. **Explore Kibana:**
   ```bash
   # Already running at http://localhost:5601
   # Go to Dev Tools: http://localhost:5601/app/dev_tools#/console
   ```

## 🌟 Highlights

### MCP Adapters (New!)

The project uses `@langchain/mcp-adapters` which **automatically** discovers and converts MCP tools:

```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// Magic! Auto-discovers tools from MCP server
const mcpClient = new MultiServerMCPClient({
    elasticsearch: {
        type: "http",
        url: "http://localhost:8001/mcp"
    }
});

await mcpClient.initializeConnections();
const tools = await mcpClient.getTools();  // ✨ No manual definitions!
```

### Production-Ready Architecture

```
User Question
    ↓
Agent (LangChain)
    ↓
MCP Adapter (auto-discovers tools)
    ↓
HTTP → MCP Server (scalable)
    ↓
Elasticsearch (your data)
    ↓
Response → Agent → User
```

## 🐛 Troubleshooting

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
# Check if it's running
curl http://localhost:8001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Restart it
yarn rag:server
```

## 📚 Additional Resources

- [LangChain Documentation](https://js.langchain.com/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Kibana Guide](https://www.elastic.co/guide/en/kibana/current/index.html)

## 💡 Tips

1. **Use Kibana** for Elasticsearch queries (much better than curl!)
2. **Start simple** with `rag:direct` before moving to MCP
3. **Check logs** if something fails: `yarn elasticsearch:logs`
4. **Use MCP adapters** - they auto-discover tools (no manual setup!)
5. **Production?** Use `rag:agent-mcp` pattern with Docker

## 📝 License

MIT

## 🤝 Contributing

This is a tutorial project. Feel free to use it for learning!

---

**Ready to start?** 

```bash
# Start everything with one command
yarn elasticsearch_mcp:start

# In another terminal, run examples
yarn rag:direct
```

## ✨ What Gets Initialized Automatically:

When you run `yarn elasticsearch_mcp:start`, Docker Compose orchestrates:

1. **Elasticsearch** starts and becomes healthy
2. **Kibana** starts (auto-configured to Elasticsearch)
3. **Data Initialization** runs:
   - Creates `products` index with 5 sample products
   - Creates `customers` index with 4 sample customers
   - Exits after completion
4. **MCP Server** starts (waits for data initialization)

**All ready to use** - no manual steps! 🚀

# austral-genai-rag

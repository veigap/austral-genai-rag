# Elasticsearch RAG (Retrieval-Augmented Generation)

This directory contains an Elasticsearch integration using the Model Context Protocol (MCP) for AI-powered search and Retrieval-Augmented Generation capabilities.

## 📁 Directory Structure

```
src/rag/
├── README.md                       # This file
├── elasticsearch-mcp-server.ts     # MCP server for Elasticsearch (HTTP)
└── setup-data.ts                   # Script to populate sample data

test/rag/
├── 1 - direct-rag-example.ts       # ⭐ Simplest RAG (no MCP, no agents)
├── 2 - agent-rag-example.ts        # Agent with tools (no MCP)
├── 3-agent-mcp-example.ts          # ⭐⭐ Agent + MCP (production-ready)
└── simple-example.ts               # Simple MCP client example

scripts/es-mcp/
├── docker-compose.yml              # Docker setup for Elasticsearch + MCP
└── Dockerfile                      # Container for MCP server
```

## 🚀 Quick Start

### Quick Start - One Command Does Everything! 🚀

```bash
# Terminal 1: Start everything
yarn elasticsearch_mcp:start

# Terminal 2: Run any example
yarn rag:direct       # ⭐ Simplest RAG
yarn rag:agent        # Agent with tools
yarn rag:agent-mcp    # Production with MCP
```

**What starts:**
- Elasticsearch + Kibana
- Auto-loads 5 products + 4 customers
- MCP server ready

### Option 1: Direct RAG Example (Recommended for Learning)

Shows the core RAG pattern without complexity:

```bash
# 1. Start everything (if not running)
yarn elasticsearch_mcp:start

# 2. In another terminal, run the example
yarn rag:direct
```

### Option 2: Agent with Tools

Agent decides when to search:

```bash
# 1. Start everything (if not running)
yarn elasticsearch_mcp:start

# 2. In another terminal, run the agent
yarn rag:agent
```

### Option 3: Production with MCP ⭐ Production-Ready

Uses `@langchain/mcp-adapters` to auto-discover MCP tools:

```bash
# 1. Start everything (if not running)
yarn elasticsearch_mcp:start

# 2. In another terminal, run the agent
yarn rag:agent-mcp
```

## 📚 All Available Commands

```bash
# Elasticsearch + MCP Stack (One command for everything!)
yarn elasticsearch_mcp:start  # Start ES + Kibana + MCP + auto-load data
yarn elasticsearch_mcp:stop   # Stop all containers
yarn elasticsearch_mcp:logs   # View all logs
yarn data:setup               # Manually load data (if needed)

# RAG Examples
yarn rag:direct                        # Simple RAG (no MCP, no agent)
yarn rag:agent                         # Agent with tool (no MCP)
yarn rag:agent-mcp                     # Agent + MCP (production)
yarn rag:simple                        # Simple MCP client example

# MCP Server (standalone, no Docker)
yarn rag:server                        # Start MCP HTTP server (port 8001)
```

## 🖥️ Kibana - Elasticsearch UI

Kibana provides a web interface to explore and visualize your Elasticsearch data.

**Kibana is automatically included** with all Docker commands:

```bash
# Starts ES + Kibana
yarn elasticsearch:start

# Starts ES + Kibana + MCP
yarn elasticsearch_mcp:start
```

### Access Kibana

Open in browser: **http://localhost:5601**

Wait ~30 seconds for Kibana to fully start, then:

1. **Home** → Navigate to different sections
2. **Dev Tools** → Run Elasticsearch queries
3. **Discover** → Browse your data
4. **Dashboard** → Create visualizations

### Dev Tools Console

Navigate to **Dev Tools** (http://localhost:5601/app/dev_tools#/console) and run queries:

```
// List all products
GET /products/_search
{
  "query": { "match_all": {} }
}

// Search for laptops
GET /products/_search
{
  "query": {
    "match": { "category": "laptop" }
  }
}

// Get price statistics
GET /products/_search
{
  "size": 0,
  "aggs": {
    "avg_price": { "avg": { "field": "price" } },
    "max_price": { "max": { "field": "price" } },
    "min_price": { "min": { "field": "price" } },
    "by_category": { 
      "terms": { "field": "category.keyword" } 
    }
  }
}
```

### Quick Tips

- **View indices:** Kibana Home → Management → Index Management
- **Explore data:** Discover → Create data view for `products`
- **Run queries:** Dev Tools → Console
- **View logs:** Use `yarn kibana:logs` to troubleshoot

## 📚 Files Overview

### `elasticsearch-mcp-server.ts`

HTTP-based MCP server that exposes Elasticsearch operations as tools via JSON-RPC 2.0.

**Uses:** `@modelcontextprotocol/sdk` for proper MCP protocol handling.

**Available Tools:**

| Tool | Description | Parameters |
|------|-------------|------------|
| `elasticsearch_search` | Search documents in an index | `index`, `query`, `size` |
| `elasticsearch_index_document` | Index a new document | `index`, `document`, `id` (optional) |
| `elasticsearch_get_indices` | List all available indices | None |

**Start the server:**
```bash
yarn rag:server
```

The server runs on **HTTP** (port 8001) and implements the MCP protocol over JSON-RPC 2.0.

### `setup-data.ts`

Creates sample data in Elasticsearch for testing.

**Creates two indices:**

**Products Index:**
- MacBook Pro 16"
- Dell XPS 13
- Lenovo ThinkPad X1
- Apple Magic Mouse
- Logitech MX Master 3

**Customers Index:**
- John Doe (San Francisco, CA)
- Jane Smith (Los Angeles, CA)
- Bob Johnson (New York, NY)
- Alice Williams (San Diego, CA)

**Run:**
```bash
yarn elasticsearch:setup
```

## 🎯 Examples Deep Dive

### Example 1: `1 - direct-rag-example.ts` ⭐ **Start Here**

**Best for:** Learning RAG, simple use cases, minimal complexity

The purest form of RAG - no agents, no MCP, just the core pattern.

**How to run:**
```bash
# Step 1: Start Elasticsearch
yarn elasticsearch:start

# Step 2: Load sample data
yarn elasticsearch:setup

# Step 3: Run the example
yarn rag:direct
```

**What happens:**
1. User asks: "I need a laptop for work"
2. Code searches Elasticsearch for "laptop"
3. Finds 3 matching products
4. Passes results to AI model with a prompt
5. AI generates personalized recommendation

**Perfect when you:**
- Want to understand RAG fundamentals
- Need simple product recommendations
- Don't need agent complexity
- Want full control over search logic

### Example 2: `2 - agent-rag-example.ts` - **Agent Intelligence**

**Best for:** Smart assistants, conversational interfaces

Adds agent intelligence - the agent decides when and how to search.

**How to run:**
```bash
# Step 1: Start Elasticsearch
yarn elasticsearch:start

# Step 2: Load sample data
yarn elasticsearch:setup

# Step 3: Run the agent
yarn rag:agent
```

**What happens:**
1. Agent receives: "I need a laptop for programming"
2. Agent *decides* to use the search_products tool
3. Tool searches Elasticsearch
4. Agent *analyzes* results
5. Agent generates intelligent recommendation

**Benefits over Example 1:**
- ✅ Agent decides when to search vs. just chat
- ✅ Can handle follow-up questions
- ✅ Multi-turn conversations
- ✅ Uses LangChain's tool framework

**Perfect when you:**
- Building chatbots or assistants
- Need conversational AI
- Want automatic tool selection
- Don't need microservices (yet)

### Example 3: `3-agent-mcp-example.ts` ⭐⭐ **Production Ready**

**Best for:** Production apps, microservices, enterprise systems

Combines agent intelligence with MCP protocol for scalable architecture.

**How to run (Option A - Docker - Recommended):**
```bash
# Terminal 1: Start both ES + MCP server (data auto-loads!)
yarn elasticsearch_mcp:start

# Terminal 2: Run the agent
yarn rag:agent-mcp
```

**How to run (Option B - Separate):**
```bash
# Terminal 1: Start Elasticsearch
yarn elasticsearch:start
yarn elasticsearch:setup

# Terminal 2: Start MCP server (standalone)
yarn rag:server

# Terminal 3: Run the agent
yarn rag:agent-mcp
```

**What happens:**
1. Agent receives user question
2. Agent uses `@langchain/mcp-adapters` to discover tools
3. MCP adapter auto-loads tools from HTTP server
4. Agent calls MCP tool over HTTP
5. MCP server queries Elasticsearch
6. Agent gets results and responds

**Key Technology:**
```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// Automatically discovers and converts MCP tools!
const mcpClient = new MultiServerMCPClient({
    elasticsearch: {
        type: "http",
        url: "http://localhost:8001/mcp"
    }
});

await mcpClient.initializeConnections();
const tools = await mcpClient.getTools(); // Magic! ✨
```

**Benefits:**
- ✅ Microservices architecture
- ✅ Scale search server independently
- ✅ Multiple clients can use same MCP server
- ✅ Uses MCP standard protocol
- ✅ Tools auto-discovered (no manual definitions!)
- ✅ Production-ready pattern

**Perfect when you:**
- Building production applications
- Need to scale components independently
- Have multiple services using same data
- Want enterprise-grade architecture
- Following best practices

### Example 4: `simple-example.ts` - **MCP Client Only**

**Best for:** Testing MCP server, API integration

Simple HTTP client that calls the MCP server without agent intelligence.

**How to run:**
```bash
# Terminal 1: Start infrastructure
yarn elasticsearch:start
yarn elasticsearch:setup
yarn rag:server

# Terminal 2: Run client
yarn rag:simple
```

**Perfect when you:**
- Testing the MCP server
- Building custom MCP clients
- Don't need agent intelligence
- Integrating with non-LangChain systems

## 🏗️ Architecture Comparison

### Example 1: Direct RAG (Simplest)
```
User Question → Elasticsearch → AI Model → Response
```

### Example 2: Agent with Tools
```
User Question → Agent → Tool → Elasticsearch → Tool → Agent → Response
```

### Example 3: Agent + MCP (Production)
```
User Question → Agent → MCP Adapter → HTTP → MCP Server → Elasticsearch
                                                    ↓
Response ← Agent ← MCP Adapter ← HTTP ← MCP Server
```

## 🤔 Which Example Should I Use?

**Decision Tree:**

```
Start Here
    ↓
Do you need agent intelligence?
    │
    ├─ NO → Example 1 (direct-rag) ⭐ Simplest!
    │
    └─ YES → Do you need microservices architecture?
              │
              ├─ NO → Example 2 (agent-rag)
              │
              └─ YES → Example 3 (agent-mcp) ⭐⭐ Production!
```

**Quick Reference:**

| Need | Use Example |
|------|-------------|
| Learning RAG | 1 - direct-rag |
| Simple recommendations | 1 - direct-rag |
| Chatbot/Assistant | 2 - agent-rag |
| Production app | 3 - agent-mcp |
| Microservices | 3 - agent-mcp |
| Scale independently | 3 - agent-mcp |

## 📝 Usage Examples

### Direct MCP Search

```typescript
import { ElasticsearchMCPClient } from './simple-example';

const client = new ElasticsearchMCPClient();
await client.start();

const result = await client.search('products', 'laptop', 5);
console.log(result);

await client.stop();
```

### AI Summarization

```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
});

const searchResults = await client.search('customers', 'California');
const summary = await model.invoke(
    `Summarize these search results: ${JSON.stringify(searchResults)}`
);
```

### JSON-RPC Message Format

**List Tools Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

**Search Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "elasticsearch_search",
    "arguments": {
      "index": "products",
      "query": "laptop",
      "size": 5
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"total\": {\"value\": 3}, \"hits\": [...]}"
      }
    ]
  }
}
```

## 🐳 Docker Commands

```bash
# Start Elasticsearch
yarn elasticsearch:start

# Stop Elasticsearch
yarn elasticsearch:stop

# View logs
yarn elasticsearch:logs

# Check status
curl http://localhost:9200/_cluster/health?pretty
```

## 🔍 Elasticsearch Query Console

Access Elasticsearch directly for debugging and development:

### Web Console

Open in browser: **http://localhost:9200**

### REST API Examples

```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# List all indices
curl http://localhost:9200/_cat/indices?v

# Get index mapping
curl http://localhost:9200/products/_mapping?pretty

# Count documents
curl http://localhost:9200/products/_count?pretty

# Search all products
curl -X GET "http://localhost:9200/products/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
    "query": { "match_all": {} }
  }'

# Search for laptops
curl -X GET "http://localhost:9200/products/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
    "query": {
      "multi_match": {
        "query": "laptop",
        "fields": ["name", "description", "category"]
      }
    }
  }'

# Search with filters (price range)
curl -X GET "http://localhost:9200/products/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
    "query": {
      "bool": {
        "must": { "match": { "category": "laptop" } },
        "filter": {
          "range": { "price": { "gte": 1000, "lte": 2000 } }
        }
      }
    }
  }'

# Get specific document by ID
curl http://localhost:9200/products/_doc/1?pretty

# Index a new document
curl -X POST "http://localhost:9200/products/_doc?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "New Product",
    "category": "Electronics",
    "price": 999,
    "description": "A great product",
    "stock": 50
  }'

# Update a document
curl -X POST "http://localhost:9200/products/_update/1?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
    "doc": { "stock": 20 }
  }'

# Delete a document
curl -X DELETE "http://localhost:9200/products/_doc/1?pretty"

# Aggregations (get price statistics)
curl -X GET "http://localhost:9200/products/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
    "size": 0,
    "aggs": {
      "price_stats": { "stats": { "field": "price" } },
      "categories": { "terms": { "field": "category.keyword" } }
    }
  }'
```

### Using with Postman

Import this as a collection or use these examples:

**Base URL:** `http://localhost:9200`

**Headers:** `Content-Type: application/json`

**Common Endpoints:**
- GET `/_cluster/health` - Cluster status
- GET `/_cat/indices?v` - List indices
- GET `/products/_search` - Search products
- POST `/products/_doc` - Create document
- GET `/products/_doc/{id}` - Get by ID

### Kibana Dev Tools (Recommended)

**Start Kibana:**
```bash
yarn elasticsearch:start-with-kibana
yarn elasticsearch:setup
```

**Access:** http://localhost:5601/app/dev_tools#/console

Copy/paste these queries directly:

```
// List all products
GET /products/_search
{
  "query": { "match_all": {} }
}

// Search laptops
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "laptop",
      "fields": ["*"]
    }
  }
}

// Aggregations
GET /products/_search
{
  "size": 0,
  "aggs": {
    "avg_price": { "avg": { "field": "price" } },
    "by_category": { "terms": { "field": "category.keyword" } }
  }
}
```

💡 **Tip:** Kibana's Dev Tools provides autocomplete and syntax highlighting!

## 🔍 Manual Testing

### Test Elasticsearch Directly

```bash
# Search products
curl -X GET "http://localhost:9200/products/_search?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
    "query": { "match": { "name": "laptop" } }
  }'

# List indices
curl http://localhost:9200/_cat/indices?v
```

### Test MCP Server

```bash
# Terminal 1: Start server
yarn rag:server

# Terminal 2: Send request
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | yarn rag:server
```

## ⚙️ Configuration

### Environment Variables

```bash
# Elasticsearch URL (default: http://localhost:9200)
export ELASTICSEARCH_URL=http://your-elasticsearch:9200

# Google AI API Key (for AI examples)
export GOOGLE_API_KEY=your-api-key
```

### Customize Search

Edit `elasticsearch-server.ts` to modify search behavior:

```typescript
// Change from multi_match to specific field
const result = await esClient.search({
    index,
    body: {
        query: {
            match: {
                name: query  // Search only in 'name' field
            }
        },
        size,
    },
});
```

## 🛠️ Troubleshooting

### Elasticsearch won't start

```bash
# Check if port 9200 is in use
lsof -i :9200

# Remove old containers and volumes
docker-compose down -v

# Start fresh
yarn elasticsearch:start
```

### Connection refused

Wait 30-60 seconds for Elasticsearch to fully start:

```bash
# Watch logs for "Active license is now [BASIC]"
yarn elasticsearch:logs
```

### Out of memory

Edit `docker-compose.yml`:

```yaml
ES_JAVA_OPTS: "-Xms1g -Xmx1g"  # Increase from 512m
```

### MCP Server timeout

Increase timeout in client code:

```typescript
setTimeout(() => {
    reject(new Error('Request timeout'));
}, 30000);  // Increase from 10000
```

## 📖 Additional Resources

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Elasticsearch Node.js Client](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html)
- [LangChain Documentation](https://js.langchain.com/)

## 🎯 Next Steps

1. **Add more tools**: Implement aggregations, filters, bulk operations
2. **Authentication**: Enable Elasticsearch security features
3. **Production setup**: Use managed Elasticsearch (AWS, Elastic Cloud)
4. **Advanced queries**: Fuzzy search, geo queries, nested documents
5. **Monitoring**: Add logging, metrics, and error tracking

## 📄 License

MIT


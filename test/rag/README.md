# RAG (Retrieval-Augmented Generation) Examples

This directory contains three progressive examples of using Elasticsearch with AI for intelligent search and recommendations.

## 📋 Overview

All examples require a `.env` file with your Google API key:
```bash
GOOGLE_API_KEY=your-key-here
ELASTICSEARCH_URL=http://localhost:9200
```

See [SETUP.md](../../SETUP.md) for details.

## 📁 Files

### `case1:direct-rag-example.ts` ⭐ **Simplest RAG**

A straightforward RAG example **without MCP or agents**. Perfect for learning the RAG pattern.

**What it does:**
1. User asks a question
2. Searches Elasticsearch directly
3. Passes results to AI model
4. AI generates a helpful, contextual response

**Architecture:**
```
User Question
     ↓
Elasticsearch Search  (retrieval)
     ↓
Search Results (context)
     ↓
AI Model (generation)
     ↓
Helpful Answer
```

**Features:**
- 🔍 Debug logging shows ES queries and results
- 📊 Relevance scores displayed
- 🎯 Simple, linear flow

**Run:**
```bash
# 1. Create .env with your Google API key (one-time)
echo "GOOGLE_API_KEY=your-key-here" > .env

# 2. Start Elasticsearch
yarn elasticsearch:start

# 3. Run the example (data auto-loads)
yarn rag:case1
```

**Example output:**
```
🔍 User question: "I need a powerful laptop for work"

📦 Searching product catalog...

📤 Elasticsearch Query:
{
  "index": "products",
  "query": {
    "multi_match": {
      "query": "powerful laptop work",
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
   3. [Score: 1.23] HP Spectre x360 ($1399.99)

✅ Found 3 products

🤖 Generating AI response...

💬 AI Assistant:
─────────────────────────────────────────────────
Based on your need for a powerful work laptop, I'd recommend:

1. **Dell XPS 15** ($1,299.99) - Best value!
   Perfect balance of power and price with i7 processor and 16GB RAM.
   Excellent for demanding work tasks. We have 15 units in stock.

2. **MacBook Pro 14"** ($1,999.99)
   If you're in the Apple ecosystem, this is excellent with the
   M2 Pro chip and 16GB RAM. Premium build quality. 8 in stock.

All are in stock and ready to ship!
```

### `case2: agent-rag-example.ts` - **Agent with Tools** ⭐

Uses LangChain agent with a tool to search Elasticsearch. The agent decides when to use the search tool.

**What it does:**
1. Agent receives customer question
2. Agent decides to use the search_products tool
3. Tool searches Elasticsearch (with debug logging)
4. Agent generates helpful recommendation

**Architecture:**
```
User Question
     ↓
Agent (decides to use tool)
     ↓
search_products Tool → Elasticsearch
     ↓
Search Results (with debug info)
     ↓
Agent (generates answer)
     ↓
Helpful Response
```

**Features:**
- 🤖 Agent intelligence
- 🔧 Custom LangChain tools
- 🔍 Debug logging for all searches
- 📊 Shows ES queries and relevance scores

**Run:**
```bash
# 1. Start Elasticsearch
yarn elasticsearch:start

# 2. Run the agent example
yarn rag:case2
```

**Benefits over case1:**
- ✅ Agent decides when to search
- ✅ Can ask clarifying questions
- ✅ Multi-turn conversations
- ✅ Tool calling framework

### `case3: agent-mcp-example.ts` - **Agent with MCP** ⭐⭐

Agent that uses the MCP Elasticsearch server through the `@langchain/mcp-adapters`. Best of both worlds!

**What it does:**
1. Agent receives customer question
2. Agent decides to use MCP tool (auto-discovered)
3. Tool calls MCP server (stdio)
4. MCP server searches Elasticsearch (with debug logging)
5. Agent generates recommendation

**Architecture:**
```
User Question
     ↓
Agent (decides to use tool)
     ↓
MCP Adapter (auto-discovers tools)
     ↓
stdio → MCP Server (separate process)
     ↓
Elasticsearch (with debug logging)
     ↓
Search Results
     ↓
Agent (generates answer)
     ↓
Helpful Response
```

**Features:**
- 🏗️ Microservices architecture
- 📡 stdio-based MCP communication
- 🔄 Decoupled components
- 🔍 Debug logging in MCP server
- ✨ Auto-discovered tools (no manual definitions!)

**Run:**
```bash
# 1. Start Elasticsearch
yarn elasticsearch:start

# 2. Start MCP server (Terminal 2)
yarn mcp:elasticsearch

# 3. Run agent (Terminal 3)
yarn rag:case3
```

**Benefits:**
- ✅ Agent intelligence + MCP protocol
- ✅ Microservices architecture
- ✅ Multiple tools (search, get indices, index documents)
- ✅ Scalable and modular
- ✅ Production-ready pattern
- ✅ Auto-discovered tools via `@langchain/mcp-adapters`

## 📊 Comparison

| Feature | Case 1 (Direct) | Case 2 (Agent) | Case 3 (MCP) |
|---------|----------------|---------------|-------------|
| **Simplicity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Dependencies** | ES + AI | ES + AI + Agent | ES + AI + MCP + Agent |
| **Setup** | Direct | Direct + Tool | MCP server |
| **Debug Logging** | ✅ Yes | ✅ Yes | ✅ Yes |
| **MCP Protocol** | ❌ No | ❌ No | ✅ Yes |
| **Tool calling** | ❌ No | ✅ Yes | ✅ Yes (auto) |
| **Agent reasoning** | ❌ No | ✅ Yes | ✅ Yes |
| **Microservices** | ❌ No | ❌ No | ✅ Yes |
| **Best for** | Learning RAG | Simple assistant | Production |
| **Code lines** | ~120 | ~175 | ~120 |
| **Terminals needed** | 2 | 2 | 3 |

## 🎯 Which to Use?

### Use **Case 1** when:
✅ **Learning RAG concepts**
✅ Simple product search/recommendations
✅ Minimal dependencies
✅ Fast prototyping
✅ Embedding RAG in existing apps
✅ You control the search logic
✅ Want to see exactly how RAG works

### Use **Case 2** when:
✅ **Building a smart assistant**
✅ Agent should decide when to search
✅ Natural conversation flow
✅ Product recommendations
✅ Customer support chatbot
✅ Want tool calling but no MCP overhead
✅ Multi-turn conversations

### Use **Case 3** when: ⭐ **Recommended for Production**
✅ **Building production applications**
✅ Want agent intelligence + MCP benefits
✅ Microservices architecture
✅ Need to scale search independently
✅ Multiple clients accessing same data
✅ Best practices for enterprise apps
✅ Future-proof with MCP standard
✅ Auto-discovered tools

## 📖 RAG Pattern Explained

**RAG = Retrieval-Augmented Generation**

```typescript
// 1. RETRIEVAL: Get relevant documents
const searchResults = await elasticsearch.search(userQuery);

// 2. AUGMENTATION: Add context to prompt
const prompt = `
Question: ${userQuery}
Context: ${searchResults}
Please answer using this context...
`;

// 3. GENERATION: AI creates answer
const answer = await aiModel.invoke(prompt);
```

**Why RAG?**
- ✅ AI uses **your data** (not just training data)
- ✅ **Accurate** answers based on real documents
- ✅ **Up-to-date** information from your database
- ✅ **Transparent** - see which documents were used
- ✅ **Reduces hallucinations** - grounds AI in facts

## 🚀 Quick Start

```bash
# 1. Setup environment (one-time)
echo "GOOGLE_API_KEY=your-key-here" > .env

# 2. Start Elasticsearch
yarn elasticsearch:start

# 3. Run the simplest example
yarn rag:case1
```

## 🔍 Debug Output

All examples now show detailed debug information:

**Case 1 & Case 2:**
- 📤 Elasticsearch query sent
- 📥 Total hits and max score
- 📋 Each matching document with score

**Case 3:**
- Same debug output from the MCP server
- Visible in the MCP server terminal (stderr)

Example:
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
   3. [Score: 1.23] HP Spectre x360 ($1399.99)
```

## 📦 Sample Data

The examples use a product catalog with:
- **Laptops**: MacBook Pro, Dell XPS, HP Spectre
- **Accessories**: Apple Magic Mouse, Logitech MX Master

Data is automatically loaded when you start Elasticsearch!

## ⚙️ Customization

### Add your own data:

```typescript
import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';

const client = new Client({ 
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' 
});

await client.index({
    index: 'products',
    document: {
        name: 'Your Product',
        category: 'Category',
        price: 999,
        description: 'Description',
        stock: 10
    }
});
```

### Customize the AI prompt:

Edit any example to change how the AI responds:

```typescript
const prompt = `You are a [YOUR ROLE]. 
The customer asked: "${userQuery}"

Products: ${context}

Respond in a [YOUR STYLE] manner...`;
```

## 💡 Tips

1. **Better Search**: Use more specific fields in `multi_match`
2. **Better AI**: Be specific in your prompts
3. **Better Results**: Add more product metadata
4. **Performance**: Index more documents for better relevance
5. **Debug**: All examples show ES queries - use this to tune relevance
6. **Kibana**: Use http://localhost:5601 to explore your data

## 📚 Learn More

- [What is RAG?](https://www.promptingguide.ai/techniques/rag)
- [Elasticsearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
- [Prompt Engineering](https://www.promptingguide.ai/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [LangChain MCP Adapters](https://js.langchain.com/docs/integrations/tools/mcp)

## 🔒 Security

- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Use environment variables for API keys
- ✅ `dotenv` auto-loads `.env` on script start
- ✅ See [SETUP.md](../../SETUP.md) for best practices

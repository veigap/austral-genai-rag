# RAG (Retrieval-Augmented Generation) Examples

This directory contains examples of using Elasticsearch with AI for intelligent search and recommendations.

## Files

### `direct-rag-example.ts` ⭐ **Simplest RAG**

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

**Run:**
```bash
# 1. Start Elasticsearch
yarn elasticsearch:start

# 2. Setup sample data
yarn elasticsearch:setup

# 3. Run the example
yarn rag:direct
```

**Example output:**
```
🔍 User question: "I need a powerful laptop for work"

📦 Searching product catalog...
✅ Found 3 products

🤖 Generating AI response...

💬 AI Assistant:
─────────────────────────────────────────────────
Based on your need for a powerful work laptop, I'd recommend:

1. **Lenovo ThinkPad X1** ($1,599) - Best choice!
   This is the most powerful option with 32GB RAM and 1TB SSD,
   perfect for demanding work tasks. It's a business-grade laptop
   known for reliability. We have 12 units in stock.

2. **MacBook Pro 16"** ($2,499)
   If you're in the Apple ecosystem, this is excellent with the
   M3 Pro chip and 16GB RAM. Premium build quality. 15 in stock.

3. **Dell XPS 13** ($1,299)
   A more compact option but still powerful with i7 and 16GB RAM.
   Great if you need portability. 8 units available.

All three are in stock and ready to ship!
```

### `agent-rag-example.ts` - **Agent with Tools** ⭐

Uses LangChain agent with a tool to search Elasticsearch. The agent decides when to use the search tool.

**What it does:**
1. Agent receives customer question
2. Agent decides to use the search_products tool
3. Tool searches Elasticsearch
4. Agent generates helpful recommendation

**Architecture:**
```
User Question
     ↓
Agent (decides to use tool)
     ↓
search_products Tool → Elasticsearch
     ↓
Search Results
     ↓
Agent (generates answer)
     ↓
Helpful Response
```

**Run:**
```bash
# 1. Start Elasticsearch
yarn elasticsearch:start

# 2. Setup sample data
yarn elasticsearch:setup

# 3. Run the agent example
yarn rag:agent
```

**Benefits over direct:**
- ✅ Agent decides when to search
- ✅ Can ask clarifying questions
- ✅ Multi-turn conversations
- ✅ Tool calling framework

### `agent-mcp-example.ts` - **Agent with MCP Tools** ⭐⭐

Agent that uses the MCP Elasticsearch server through tools. Best of both worlds!

**What it does:**
1. Agent receives customer question
2. Agent decides to use MCP tool
3. Tool calls MCP HTTP server
4. MCP server searches Elasticsearch
5. Agent generates recommendation

**Architecture:**
```
User Question
     ↓
Agent (decides to use tool)
     ↓
MCP Tool (HTTP request)
     ↓
MCP Server → Elasticsearch
     ↓
Search Results
     ↓
Agent (generates answer)
     ↓
Helpful Response
```

**Run:**
```bash
# 1. Start Elasticsearch
yarn elasticsearch:start

# 2. Setup sample data
yarn elasticsearch:setup

# 3. Start MCP server
yarn rag:server

# 4. Run agent (in another terminal)
yarn rag:agent-mcp
```

**Benefits:**
- ✅ Agent intelligence + MCP protocol
- ✅ Microservices architecture
- ✅ Multiple tools (search, get indices)
- ✅ Scalable and modular
- ✅ Production-ready pattern

### `simple-example.ts` - **MCP HTTP Client**

Uses the MCP HTTP server to search Elasticsearch.

**Run:**
```bash
# 1. Start Elasticsearch
yarn elasticsearch:start

# 2. Start MCP server
yarn rag:server

# 3. Run example (in another terminal)
yarn rag:simple
```

### `langchain-example.ts` - **LangChain Agent (Full)**

Full LangChain agent with MCP tools and conversation memory.

**Run:**
```bash
yarn rag:langchain
```

## Comparison

| Feature | direct-rag | agent-rag | agent-mcp | simple-example | langchain-example |
|---------|-----------|-----------|-----------|----------------|-------------------|
| **Simplicity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Dependencies** | ES + AI | ES + AI + Agent | MCP + Agent | ES + AI + MCP | ES + AI + MCP + Agent |
| **Setup** | Direct | Direct + Tool | MCP server | MCP server | MCP server + Memory |
| **MCP Protocol** | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Tool calling** | ❌ No | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Agent reasoning** | ❌ No | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Microservices** | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Best for** | Learning RAG | Simple assistant | Production | API clients | Complex workflows |
| **Code lines** | ~100 | ~150 | ~180 | ~120 | ~200 |

## Which to Use?

### Use `direct-rag-example.ts` when:
✅ **Learning RAG concepts**
✅ Simple product search/recommendations
✅ Minimal dependencies
✅ Fast prototyping
✅ Embedding RAG in existing apps
✅ You control the search logic

### Use `agent-rag-example.ts` when:
✅ **Building a smart assistant**
✅ Agent should decide when to search
✅ Natural conversation flow
✅ Product recommendations
✅ Customer support chatbot
✅ Want tool calling but no MCP overhead

### Use `agent-mcp-example.ts` when: ⭐ **Recommended for Production**
✅ **Building production applications**
✅ Want agent intelligence + MCP benefits
✅ Microservices architecture
✅ Need to scale search independently
✅ Multiple clients accessing same data
✅ Best practices for enterprise apps
✅ Future-proof with MCP standard

### Use `simple-example.ts` when:
✅ Microservices architecture
✅ Multiple clients need Elasticsearch access
✅ Want to scale search separately
✅ Building APIs
✅ Need MCP protocol

### Use `langchain-example.ts` when:
✅ Complex multi-step workflows
✅ Need conversation memory
✅ Multiple tools and chains
✅ Advanced AI orchestration
✅ Full MCP integration

## RAG Pattern Explained

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

## Quick Start

```bash
# Setup (one time)
yarn elasticsearch:start
yarn elasticsearch:setup

# Run the simplest example
yarn rag:direct
```

## Sample Data

The examples use a product catalog with:
- **Laptops**: MacBook Pro, Dell XPS, Lenovo ThinkPad
- **Accessories**: Apple Magic Mouse, Logitech MX Master

You can add more data by modifying `src/rag/setup-data.ts`.

## Customization

### Add your own data:

```typescript
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://localhost:9200' });

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

Edit `direct-rag-example.ts` to change how the AI responds:

```typescript
const prompt = `You are a [YOUR ROLE]. 
The customer asked: "${userQuery}"

Products: ${context}

Respond in a [YOUR STYLE] manner...`;
```

## Tips

1. **Better Search**: Use more specific fields in `multi_match`
2. **Better AI**: Be specific in your prompts
3. **Better Results**: Add more product metadata
4. **Performance**: Index more documents for better relevance

## Learn More

- [What is RAG?](https://www.promptingguide.ai/techniques/rag)
- [Elasticsearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
- [Prompt Engineering](https://www.promptingguide.ai/)


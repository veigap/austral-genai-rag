# MCP Server Testing Resources

This directory contains resources for testing MCP (Model Context Protocol) servers.

## 📝 Note on MCP Servers

**Current Architecture:** All MCP servers in this project now use **stdio** (standard input/output) for communication, which is the recommended approach for MCP.

**This Postman collection** is kept for reference and shows how HTTP-based MCP servers can be tested. The actual production servers use stdio for better process isolation and security.

## Postman Collection

### File: `MCP-Weather-Server.postman_collection.json`

A Postman collection demonstrating HTTP-based MCP server testing (reference implementation).

### Current MCP Servers (stdio-based)

To test the actual MCP servers:

```bash
# Math operations
yarn mcp:math

# Weather service (stdio, not HTTP)
yarn mcp:weather

# Elasticsearch
yarn mcp:elasticsearch
```

These servers communicate via **stdio** and require clients that spawn them as child processes.

### Testing stdio MCP Servers

Use the TypeScript test clients:

```bash
# Test stdio math server
yarn test-mcp-io

# For Elasticsearch MCP, use the RAG examples:
yarn rag:case3  # Agent with MCP
```

## HTTP MCP (Legacy/Reference)

If you want to run an HTTP version for testing with Postman, you would need to modify the server to use HTTP transport (see git history for reference implementation).

### How to Import into Postman

#### Option 1: Import from File
1. Open Postman
2. Click **Import** button (top left)
3. Click **Upload Files**
4. Select `MCP-Weather-Server.postman_collection.json`
5. Click **Import**

#### Option 2: Drag and Drop
1. Open Postman
2. Drag and drop the `MCP-Weather-Server.postman_collection.json` file into the Postman window

### Available Requests

The collection includes 6 example requests demonstrating JSON-RPC 2.0 with MCP:

#### 1. **List Tools**
- Lists all available tools from the server
- Method: `tools/list`
- No parameters required

#### 2. **Get Weather - San Francisco**
- Calls the weather tool for San Francisco
- Method: `tools/call`
- Parameters: `location: "San Francisco"`

#### 3. **Get Weather - Tokyo**
- Calls the weather tool for Tokyo
- Method: `tools/call`
- Parameters: `location: "Tokyo"`

#### 4. **Get Weather - London**
- Calls the weather tool for London
- Method: `tools/call`
- Parameters: `location: "London"`

#### 5. **Error - Unknown Tool**
- Tests error handling with an unknown tool
- Should return a JSON-RPC error response

#### 6. **Error - Missing Required Parameter**
- Tests parameter validation
- Calls `get_weather` without the required `location` parameter

### Request Format

All requests follow the **JSON-RPC 2.0** standard:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "method_name",
  "params": {
    "name": "tool_name",
    "arguments": {
      "param1": "value1"
    }
  }
}
```

### Response Format

**Success Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Response text"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Error message"
  }
}
```

## Using cURL (for HTTP MCP servers)

If testing an HTTP-based MCP server:

### List Tools
```bash
curl -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Call Weather Tool
```bash
curl -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_weather",
      "arguments": {
        "location": "San Francisco"
      }
    }
  }'
```

## stdio MCP Communication (Recommended)

The standard way to communicate with MCP servers is via stdio:

```typescript
import { spawn } from 'child_process';

// Spawn the MCP server
const mcpProcess = spawn('yarn', ['mcp:math']);

// Send JSON-RPC request to stdin
mcpProcess.stdin.write(JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
}) + '\n');

// Read JSON-RPC response from stdout
mcpProcess.stdout.on('data', (data) => {
    const response = JSON.parse(data.toString());
    console.log(response);
});
```

Or use the LangChain MCP adapters:

```typescript
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const mcpClient = new MultiServerMCPClient({
    math: {
        type: "stdio",
        command: "yarn",
        args: ["mcp:math"]
    }
});

await mcpClient.initializeConnections();
const tools = await mcpClient.getTools(); // Auto-discovered!
```

## Testing Resources

### stdio Test Clients

```bash
# Test stdio MCP server (math operations)
yarn test-mcp-io

# Test Elasticsearch MCP with agents
yarn rag:case3
```

### Related Files

- **stdio servers**: 
  - `../src/mcp/math-io.ts`
  - `../src/mcp/weather-http.ts` (now uses stdio despite the name)
  - `../src/rag/elasticsearch-mcp-server.ts`
- **Test clients**:
  - `../test/mcp/test-mcp-stdio-client.ts`
  - `../test/rag/case3-agent-mcp-example.ts`

## MCP Protocol Documentation

- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **JSON-RPC 2.0**: https://www.jsonrpc.org/specification
- **LangChain MCP Adapters**: https://js.langchain.com/docs/integrations/tools/mcp

## Why stdio over HTTP?

**stdio benefits:**
- ✅ Better security (no exposed ports)
- ✅ Process isolation
- ✅ Standard MCP approach
- ✅ Simpler deployment
- ✅ Works with `@langchain/mcp-adapters`

**HTTP use cases:**
- Multiple remote clients
- Cross-network communication
- API gateway patterns
- Load balancing needs

For most applications, **stdio is recommended** and is the pattern used throughout this tutorial.

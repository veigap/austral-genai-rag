# MCP Server Testing Resources

This directory contains resources for testing the MCP (Model Context Protocol) servers.

## Postman Collection

### File: `MCP-Weather-Server.postman_collection.json`

A Postman collection for testing the MCP HTTP Weather Server.

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

### Setup

Before running the requests, start the MCP HTTP server:

```bash
yarn mcp-http
```

The server will start on `http://localhost:8000`

### Available Requests

The collection includes 6 example requests:

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

## Using cURL

If you don't have Postman, you can use `curl` from the command line:

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

## Using the TypeScript Test Client

Run the automated test client:

```bash
# Make sure the server is running first
yarn mcp-http

# In another terminal, run the test client
yarn test-mcp-http
```

## Variables

The collection includes a variable:
- `baseUrl`: `http://localhost:8000` (can be modified in Postman's environment settings)

## Tips

1. **Run in sequence**: Run the "List Tools" request first to see what tools are available
2. **Watch the ID**: Each request has a unique `id` that matches in the response
3. **Check server logs**: The server console will show incoming requests
4. **Modify parameters**: Try different locations or create your own requests
5. **Export responses**: Use Postman's "Save Response" to keep examples

## MCP Protocol Documentation

- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **JSON-RPC 2.0**: https://www.jsonrpc.org/specification

## Related Files

- Server implementation: `../src/mcp-http.ts`
- Test client: `../test/test-mcp-http-client.ts`
- I/O version: `../src/mcp-io.ts`




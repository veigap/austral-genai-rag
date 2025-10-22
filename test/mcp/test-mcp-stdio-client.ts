import { spawn, ChildProcess } from 'child_process';
import { createInterface, Interface } from 'readline';
import type { JSONRPCID } from 'json-rpc-2.0';

// MCP-specific request types (built on top of JSON-RPC)
interface ListToolsRequest {
  jsonrpc: "2.0";
  id: JSONRPCID;
  method: "tools/list";
}

interface CallToolRequest {
  jsonrpc: "2.0";
  id: JSONRPCID;
  method: "tools/call";
  params: {
    name: string;
    arguments: Record<string, any>;
  };
}

// Start the MCP server
const server: ChildProcess = spawn('yarn', ['mcp:math'], { 
  stdio: ['pipe', 'pipe', 'inherit'] 
});

// Ensure stdin and stdout are available
if (!server.stdin || !server.stdout) {
  console.error('Failed to create server process pipes');
  process.exit(1);
}

// Read server responses
const rl: Interface = createInterface({ input: server.stdout });
rl.on('line', (line: string) => {
  console.log('Server response:', line);
});

// Example 1: List available tools
const listToolsRequest: ListToolsRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list"
};

console.log('Sending list tools request...');
server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

// Example 2: Call the 'add' tool after 1 second
setTimeout(() => {
  const callToolRequest: CallToolRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "add",
      arguments: { a: 5, b: 3 }
    }
  };
  
  console.log('Sending add tool call...');
  server.stdin!.write(JSON.stringify(callToolRequest) + '\n');
}, 1000);

// Example 3: Call the 'multiply' tool after 2 seconds
setTimeout(() => {
  const callToolRequest: CallToolRequest = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "multiply",
      arguments: { a: 4, b: 7 }
    }
  };
  
  console.log('Sending multiply tool call...');
  server.stdin!.write(JSON.stringify(callToolRequest) + '\n');
  
  // Exit gracefully after getting the response
  setTimeout(() => {
    rl.close();
    server.stdin!.end();
    setTimeout(() => process.exit(0), 500);
  }, 1000);
}, 2000);


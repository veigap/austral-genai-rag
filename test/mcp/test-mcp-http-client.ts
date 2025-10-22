// Use the built-in fetch API from Node.js >= 18
// No need to import fetch

import type { 
  JSONRPCRequest, 
  JSONRPCResponse, 
  JSONRPCID 
} from 'json-rpc-2.0';

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

const SERVER_URL = 'http://localhost:8000/mcp';

async function sendRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
  console.log(`\n→ Sending request:`, JSON.stringify(request, null, 2));
  
  const response = await fetch(SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as JSONRPCResponse;
  console.log(`← Response:`, JSON.stringify(data, null, 2));
  
  return data;
}

async function testMcpHttpServer() {
  try {
    console.log('🧪 Testing MCP HTTP Server...\n');
    console.log(`Server URL: ${SERVER_URL}`);
    
    // Test 1: List available tools
    console.log('\n📋 Test 1: List Tools');
    const listToolsRequest: ListToolsRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    };
    
    const toolsResponse = await sendRequest(listToolsRequest);
    
    if (toolsResponse.result?.tools) {
      console.log(`✅ Found ${toolsResponse.result.tools.length} tool(s):`);
      toolsResponse.result.tools.forEach((tool: any) => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
    }

    // Test 2: Call get_weather tool
    console.log('\n🌤️  Test 2: Call get_weather tool');
    const callWeatherRequest: CallToolRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "get_weather",
        arguments: { location: "San Francisco" }
      }
    };
    
    const weatherResponse = await sendRequest(callWeatherRequest);
    
    if (weatherResponse.result?.content) {
      console.log(`✅ Weather result:`);
      weatherResponse.result.content.forEach((content: any) => {
        if (content.type === 'text') {
          console.log(`   ${content.text}`);
        }
      });
    }

    // Test 3: Call with different location
    console.log('\n🌍 Test 3: Call get_weather with different location');
    const callWeatherRequest2: CallToolRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_weather",
        arguments: { location: "Tokyo" }
      }
    };
    
    const weatherResponse2 = await sendRequest(callWeatherRequest2);
    
    if (weatherResponse2.result?.content) {
      console.log(`✅ Weather result:`);
      weatherResponse2.result.content.forEach((content: any) => {
        if (content.type === 'text') {
          console.log(`   ${content.text}`);
        }
      });
    }

    // Test 4: Test error handling (unknown tool)
    console.log('\n❌ Test 4: Test error handling (unknown tool)');
    const callUnknownRequest: CallToolRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "unknown_tool",
        arguments: {}
      }
    };
    
    try {
      await sendRequest(callUnknownRequest);
      console.log('❌ Should have thrown an error');
    } catch (error) {
      console.log(`✅ Error handled correctly: ${error}`);
    }

    console.log('\n✨ All tests completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testMcpHttpServer();


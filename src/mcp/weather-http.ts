import 'dotenv/config';
import http from 'http';

// Weather MCP HTTP Server Port
const PORT = process.env.PORT || 8003;

// Logging utility
function log(level: 'INFO' | 'DEBUG' | 'ERROR', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data) {
        console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
    } else {
        console.log(`${prefix} ${message}`);
    }
}

log('INFO', 'Initializing Weather MCP HTTP Server');

// MCP Tools Definition
const TOOLS = [
    {
        name: "get_weather",
        description: "Get weather for location",
        inputSchema: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "Location to get weather for",
                },
            },
            required: ["location"],
        },
    },
];

// Handle tools/list
async function handleToolsList(id: any) {
    log('INFO', '📋 Handler: tools/list');
    return {
        jsonrpc: "2.0",
        id,
        result: { tools: TOOLS }
    };
}

// Handle tools/call
async function handleToolsCall(id: any, params: any) {
    log('INFO', `🔧 Handler: tools/call - ${params.name}`);
    
    try {
        switch (params.name) {
            case "get_weather": {
                const { location } = params.arguments;
                
                log('DEBUG', '🌤️  Getting weather', { location });
                
                const weatherResponse = `It's always sunny in ${location}`;
                
                log('DEBUG', '📥 Weather Result', { location, response: weatherResponse });

                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        content: [{
                            type: "text",
                            text: weatherResponse,
                        }],
                    }
                };
            }

            default:
                throw new Error(`Unknown tool: ${params.name}`);
        }
    } catch (error) {
        log('ERROR', 'Tool call failed:', error);
        return {
            jsonrpc: "2.0",
            id,
            error: {
                code: -32603,
                message: error instanceof Error ? error.message : 'Internal error'
            }
        };
    }
}

// Create HTTP server
const httpServer = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Health check
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: "ok",
            mcp_server: "running",
            service: "weather"
        }));
        return;
    }
    
    // MCP JSON-RPC endpoint
    if (req.method === 'POST' && req.url === '/mcp') {
        log('INFO', '🔌 New MCP request');
        
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const request = JSON.parse(body);
                log('DEBUG', 'Received request:', request);
                
                let response;
                
                // Handle different MCP methods
                if (request.method === 'tools/list') {
                    response = await handleToolsList(request.id);
                } else if (request.method === 'tools/call') {
                    response = await handleToolsCall(request.id, request.params);
                } else if (request.method === 'initialize') {
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        result: {
                            protocolVersion: "2024-11-05",
                            capabilities: {
                                tools: {}
                            },
                            serverInfo: {
                                name: "weather-mcp-server",
                                version: "1.0.0"
                            }
                        }
                    };
                } else if (request.method === 'notifications/initialized') {
                    // No response needed for notifications
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ jsonrpc: "2.0" }));
                    return;
                } else {
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        error: {
                            code: -32601,
                            message: `Method not found: ${request.method}`
                        }
                    };
                }
                
                log('DEBUG', 'Sending response:', response);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
                
            } catch (error) {
                log('ERROR', 'Request failed:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    jsonrpc: "2.0",
                    error: { 
                        code: -32603, 
                        message: error instanceof Error ? error.message : 'Internal error' 
                    },
                    id: null
                }));
            }
        });
        return;
    }
    
    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Not found" }));
});

async function main() {
    httpServer.listen(PORT, () => {
        log('INFO', '🚀 Weather MCP HTTP Server Started');
        log('INFO', `Server: http://localhost:${PORT}`);
        log('INFO', `Endpoint: POST http://localhost:${PORT}/mcp (JSON-RPC)`);
        log('INFO', `Health: GET http://localhost:${PORT}/health`);
        log('INFO', '');
        log('INFO', 'Available tools:');
        log('INFO', '  - get_weather: Get weather for a location');
        log('INFO', '');
        log('INFO', '💡 Test with:');
        log('INFO', `   curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`);
        log('INFO', `   curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_weather","arguments":{"location":"San Francisco"}}}'`);
        log('INFO', '');
        log('INFO', 'Ready to accept connections...');
    });
}

main();

import 'dotenv/config';
import { ChromaClient } from 'chromadb';
import http from 'http';

// ChromaDB client configuration
const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
const url = new URL(chromaUrl);
const chromaClient = new ChromaClient({ host: url.hostname, port: parseInt(url.port) || 8000 });

// MCP HTTP Server Port
const PORT = process.env.PORT || 8002;

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

log('INFO', 'Initializing ChromaDB MCP HTTP Server');

// MCP Tools Definition
const TOOLS = [
    {
        name: "chroma_query_collection",
        description: "Search documents in a ChromaDB collection using semantic similarity",
        inputSchema: {
            type: "object",
            properties: {
                collection: { type: "string", description: "Collection name (default: 'products')" },
                query: { type: "string", description: "Search query text" },
                n_results: { type: "number", description: "Number of results (default: 5)" },
            },
            required: ["query"],
        },
    },
    {
        name: "chroma_list_collections",
        description: "List all collections in ChromaDB",
        inputSchema: { type: "object", properties: {} },
    },
    {
        name: "chroma_get_collection_info",
        description: "Get information about a collection",
        inputSchema: {
            type: "object",
            properties: {
                collection: { type: "string", description: "Collection name" },
            },
            required: ["collection"],
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
            case "chroma_query_collection": {
                const { collection = 'products', query, n_results = 5 } = params.arguments;
                
                log('DEBUG', '🔍 Querying ChromaDB', { collection, query, n_results });
                
                const coll = await chromaClient.getCollection({ name: collection });
                const results = await coll.query({
                    queryTexts: [query],
                    nResults: n_results
                });
                
                const formattedResults = results.ids[0].map((id, i) => ({
                    id,
                    distance: results.distances?.[0][i],
                    metadata: results.metadatas[0][i],
                    document: results.documents[0][i]
                }));
                
                log('DEBUG', '📥 Query Results', {
                    total: formattedResults.length,
                    results: formattedResults.map(r => ({
                        id: r.id,
                        distance: r.distance,
                        name: (r.metadata as any)?.name
                    }))
                });

                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        content: [{
                            type: "text",
                            text: JSON.stringify(formattedResults, null, 2),
                        }],
                    }
                };
            }

            case "chroma_list_collections": {
                log('DEBUG', '📚 Listing collections');
                
                const collections = await chromaClient.listCollections();
                const collectionList = collections.map(c => c.name);
                
                log('DEBUG', '📥 Collections', { count: collectionList.length, collections: collectionList });

                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        content: [{
                            type: "text",
                            text: JSON.stringify(collectionList, null, 2),
                        }],
                    }
                };
            }

            case "chroma_get_collection_info": {
                const { collection } = params.arguments;
                
                log('DEBUG', '📊 Getting collection info', { collection });
                
                const coll = await chromaClient.getCollection({ name: collection });
                const count = await coll.count();
                
                const info = {
                    name: collection,
                    count,
                };
                
                log('DEBUG', '📥 Collection info', info);

                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        content: [{
                            type: "text",
                            text: JSON.stringify(info, null, 2),
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
        try {
            const version = await chromaClient.version();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: "ok",
                mcp_server: "running",
                chromadb: {
                    version,
                    url: chromaUrl
                }
            }));
        } catch (error) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: "error", chromadb: "disconnected" }));
        }
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
                                name: "chromadb-mcp-server",
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
    try {
        const version = await chromaClient.version();
        log('INFO', `✅ Connected to ChromaDB ${version}`);
        log('INFO', `📍 ChromaDB URL: ${chromaUrl}`);
    } catch (error) {
        log('ERROR', '⚠️  Could not connect to ChromaDB');
    }

    httpServer.listen(PORT, () => {
        log('INFO', '🚀 ChromaDB MCP HTTP Server Started');
        log('INFO', `Server: http://localhost:${PORT}`);
        log('INFO', `Endpoint: POST http://localhost:${PORT}/mcp (JSON-RPC)`);
        log('INFO', `Health: GET http://localhost:${PORT}/health`);
        log('INFO', '');
        log('INFO', 'Available tools:');
        log('INFO', '  - chroma_query_collection: Semantic search');
        log('INFO', '  - chroma_list_collections: List all collections');
        log('INFO', '  - chroma_get_collection_info: Get collection info');
        log('INFO', '');
        log('INFO', '💡 Test with:');
        log('INFO', `   curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`);
        log('INFO', '');
        log('INFO', 'Ready to accept connections...');
    });
}

main();


import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import http from 'http';

// Elasticsearch client configuration
const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Client should connect to: http://localhost:8001/mcp
const PORT = process.env.PORT || 8001;

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

log('INFO', 'Initializing Elasticsearch MCP HTTP Server');

// MCP Tools Definition
const TOOLS = [
    {
        name: "elasticsearch_search",
        description: "Search documents in Elasticsearch index",
        inputSchema: {
            type: "object",
            properties: {
                index: { type: "string", description: "Index to search" },
                query: { type: "string", description: "Search query" },
                size: { type: "number", description: "Max results (default: 10)" },
            },
            required: ["index", "query"],
        },
    },
    {
        name: "elasticsearch_index_document",
        description: "Index a document in Elasticsearch",
        inputSchema: {
            type: "object",
            properties: {
                index: { type: "string", description: "Index name" },
                document: { type: "object", description: "Document to index" },
                id: { type: "string", description: "Optional document ID" },
            },
            required: ["index", "document"],
        },
    },
    {
        name: "elasticsearch_get_indices",
        description: "Get list of all Elasticsearch indices",
        inputSchema: { type: "object", properties: {} },
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
            case "elasticsearch_search": {
                const { index, query, size = 10 } = params.arguments;
                
                const esQuery = {
                    index,
                    query: { multi_match: { query, fields: ['*'] } },
                    size,
                };
                
                log('DEBUG', '📤 ES Query:', esQuery);
                const esResult = await esClient.search(esQuery);
                log('DEBUG', '📥 ES Results:', { hits: esResult.hits.hits.length });

                const hits = esResult.hits.hits.map((hit: any) => ({
                    id: hit._id,
                    score: hit._score,
                    source: hit._source,
                }));

                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        content: [{
                            type: "text",
                            text: JSON.stringify({ total: esResult.hits.total, hits }, null, 2),
                        }],
                    }
                };
            }

            case "elasticsearch_index_document": {
                const { index, document, id: docId } = params.arguments;
                const esResult = await esClient.index({ index, id: docId, document });
                
                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        content: [{
                            type: "text",
                            text: JSON.stringify({
                                result: esResult.result,
                                id: esResult._id,
                                index: esResult._index,
                            }, null, 2),
                        }],
                    }
                };
            }

            case "elasticsearch_get_indices": {
                const esResult = await esClient.cat.indices({ format: 'json' });
                const indices = esResult.map((index: any) => ({
                    name: index.index,
                    health: index.health,
                    status: index.status,
                    docsCount: index['docs.count'],
                    storeSize: index['store.size'],
                }));

                return {
                    jsonrpc: "2.0",
                    id,
                    result: {
                        content: [{
                            type: "text",
                            text: JSON.stringify(indices, null, 2),
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
            const esHealth = await esClient.cluster.health();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: "ok",
                mcp_server: "running",
                elasticsearch: {
                    status: esHealth.status,
                    cluster_name: esHealth.cluster_name,
                }
            }));
        } catch (error) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: "error", elasticsearch: "disconnected" }));
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
                                name: "elasticsearch-mcp-server",
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
        const info = await esClient.info();
        log('INFO', `✅ Connected to Elasticsearch ${info.version?.number}`);
    } catch (error) {
        log('ERROR', '⚠️  Could not connect to Elasticsearch');
    }

    httpServer.listen(PORT, () => {
        log('INFO', '🚀 Elasticsearch MCP HTTP Server Started');
        log('INFO', `Server: http://localhost:${PORT}`);
        log('INFO', `Endpoint: POST http://localhost:${PORT}/mcp (JSON-RPC)`);
        log('INFO', `Health: GET http://localhost:${PORT}/health`);
        log('INFO', '');
        log('INFO', 'Available tools:');
        log('INFO', '  - elasticsearch_search');
        log('INFO', '  - elasticsearch_index_document');
        log('INFO', '  - elasticsearch_get_indices');
        log('INFO', '');
        log('INFO', '💡 Test with:');
        log('INFO', `   curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`);
        log('INFO', '');
        log('INFO', 'Ready to accept connections...');
    });
}

main();

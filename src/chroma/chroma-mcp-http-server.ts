import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ChromaClient, DefaultEmbeddingFunction } from 'chromadb';
import express from 'express';
import { z } from 'zod';

// ChromaDB client configuration
const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
const url = new URL(chromaUrl);
const chromaClient = new ChromaClient({ 
    path: chromaUrl
});

// MCP HTTP Server Port
const PORT = process.env.PORT || 8001;

// Create Express app
const app = express();
app.use(express.json());

// Create MCP Server
const mcp = new McpServer({
    name: 'ChromaDBToolServer',
    version: '1.0.0',
    description: 'Provides ChromaDB vector search capabilities',
});


// Register ChromaDB tools using the correct MCP pattern
mcp.registerTool(
    'chroma_query_collection',
    {
        title: 'ChromaDB Query Collection',
        description: 'Search documents in a ChromaDB collection using semantic similarity',
        inputSchema: { 
            collection: z.string().optional(), 
            query: z.string(), 
            n_results: z.number().optional() 
        }
    },
    async ({ collection = 'products', query, n_results = 5 }) => {
        console.error('🔍 Querying ChromaDB:', { collection, query, n_results });
        
        const coll = await chromaClient.getCollection({ 
            name: collection,
            embeddingFunction: new DefaultEmbeddingFunction()
        });
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
        
        console.error('📥 Query Results:', {
            total: formattedResults.length,
            results: formattedResults.map(r => ({
                id: r.id,
                distance: r.distance,
                name: (r.metadata as any)?.name
            }))
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(formattedResults, null, 2),
            }],
        };
    }
);

mcp.registerTool(
    'chroma_list_collections',
    {
        title: 'ChromaDB List Collections',
        description: 'List all collections in ChromaDB',
        inputSchema: {}
    },
    async () => {
        console.error('📚 Listing collections');
        
        const collections = await chromaClient.listCollections();
        const collectionList = collections.map(c => c.name);
        
        console.error('📥 Collections:', { count: collectionList.length, collections: collectionList });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(collectionList, null, 2),
            }],
        };
    }
);

mcp.registerTool(
    'chroma_get_collection_info',
    {
        title: 'ChromaDB Get Collection Info',
        description: 'Get information about a collection',
        inputSchema: { 
            collection: z.string()
        }
    },
    async ({ collection }) => {
        console.error('📊 Getting collection info:', { collection });
        
        const coll = await chromaClient.getCollection({ 
            name: collection,
            embeddingFunction: new DefaultEmbeddingFunction()
        });
        const count = await coll.count();
        
        const info = {
            name: collection,
            count,
        };
        
        console.error('📥 Collection info:', info);

        return {
            content: [{
                type: "text",
                text: JSON.stringify(info, null, 2),
            }],
        };
    }
);

// Add health check endpoint
app.get('/health', async (req, res) => {
    try {
        const version = await chromaClient.version();
        res.json({
            status: "ok",
            mcp_server: "running",
            chromadb: {
                version,
                url: chromaUrl
            }
        });
    } catch (error) {
        res.status(503).json({ status: "error", chromadb: "disconnected" });
    }
});

// Add MCP endpoint following the correct pattern
app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    // Connect server with transport
    await mcp.connect(transport);

    res.on('close', () => {
        transport.close();
    });

    await transport.handleRequest(req, res, req.body);
});

// Start server
app.listen(PORT, () => {
    console.error('🚀 ChromaDB MCP HTTP Server Started');
    console.error(`Server: http://localhost:${PORT}`);
    console.error(`Endpoint: POST http://localhost:${PORT}/mcp (JSON-RPC)`);
    console.error(`Health: GET http://localhost:${PORT}/health`);
    console.error('');
    console.error('Available tools:');
    console.error('  - chroma_query_collection: Semantic search');
    console.error('  - chroma_list_collections: List all collections');
    console.error('  - chroma_get_collection_info: Get collection info');
    console.error('');
    console.error('💡 Test with:');
    console.error(`   curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`);
    console.error('');
    console.error('Ready to accept connections...');
});


import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Client } from '@elastic/elasticsearch';
import express from 'express';
import { z } from 'zod';

// Elasticsearch client configuration
const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Client should connect to: http://localhost:8001/mcp
const PORT = process.env.PORT || 8001;

// Create Express app
const app = express();
app.use(express.json());

// Create MCP Server
const mcp = new McpServer({
    name: 'ElasticsearchToolServer',
    version: '1.0.0',
    description: 'Provides Elasticsearch search and indexing capabilities',
});

// Define schemas for tools
const searchSchema = {
    index: z.string().describe('Index to search'),
    query: z.string().describe('Search query'),
    size: z.number().optional().describe('Max results (default: 10)'),
};

const indexDocumentSchema = {
    index: z.string().describe('Index name'),
    document: z.any().describe('Document to index'),
    id: z.string().optional().describe('Optional document ID'),
};

const getIndicesSchema = {};

// Register tools using the correct MCP pattern
mcp.registerTool(
    'elasticsearch_search',
    {
        title: 'Elasticsearch Search',
        description: 'Search documents in Elasticsearch index',
        inputSchema: searchSchema
    },
    async (args) => {
    const { index, query, size = 10 } = args;
    
    const esQuery = {
        index,
        query: { multi_match: { query, fields: ['*'] } },
        size,
    };
    
    console.error('📤 Elasticsearch Query:');
    console.error(JSON.stringify(esQuery, null, 2));
    
    const esResult = await esClient.search(esQuery);
    
    console.error('📥 Elasticsearch Results:');
    console.error(`   Total hits: ${typeof esResult.hits.total === 'object' ? esResult.hits.total.value : esResult.hits.total}`);
    console.error(`   Max score: ${esResult.hits.max_score}`);
    esResult.hits.hits.forEach((hit: any, i: number) => {
        console.error(`   ${i + 1}. [Score: ${hit._score?.toFixed(2)}] ${hit._source.name || hit._source.email || hit._id}`);
    });
    console.error();

    const hits = esResult.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        source: hit._source,
    }));

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    total: esResult.hits.total,
                    hits,
                }, null, 2),
            }],
        };
    }
);

mcp.registerTool(
    'elasticsearch_index_document',
    {
        title: 'Elasticsearch Index Document',
        description: 'Index a document in Elasticsearch',
        inputSchema: indexDocumentSchema
    },
    async (args) => {
    const { index, document, id } = args;
    
    const esResult = await esClient.index({
        index,
        id,
        document,
    });

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    result: esResult.result,
                    id: esResult._id,
                    index: esResult._index,
                }, null, 2),
            }],
        };
    }
);

mcp.registerTool(
    'elasticsearch_get_indices',
    {
        title: 'Elasticsearch Get Indices',
        description: 'Get list of all Elasticsearch indices',
        inputSchema: getIndicesSchema
    },
    async () => {
    const esResult = await esClient.cat.indices({ format: 'json' });

    const indices = esResult.map((index: any) => ({
        name: index.index,
        health: index.health,
        status: index.status,
        docsCount: index['docs.count'],
        storeSize: index['store.size'],
    }));

        return {
            content: [{
                type: "text",
                text: JSON.stringify(indices, null, 2),
            }],
        };
    }
);

// Transport will be created per-request in the /mcp endpoint

// Add health check endpoint
app.get('/health', async (req, res) => {
    try {
        const esHealth = await esClient.cluster.health();
        res.json({
            status: "ok",
            mcp_server: "running",
            elasticsearch: {
                status: esHealth.status,
                cluster_name: esHealth.cluster_name,
            }
        });
    } catch (error) {
        res.status(503).json({ status: "error", elasticsearch: "disconnected" });
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
async function main() {
    try {
        const info = await esClient.info();
        console.error(`✅ Connected to Elasticsearch ${info.version?.number}`);
        console.error(`📍 Elasticsearch URL: ${process.env.ELASTICSEARCH_URL || 'http://localhost:9200'}`);
    } catch (error) {
        console.error('⚠️  Could not connect to Elasticsearch');
        console.error(`   Make sure Elasticsearch is running on: ${process.env.ELASTICSEARCH_URL || 'http://localhost:9200'}`);
    }

    app.listen(PORT, () => {
        console.error('🚀 Elasticsearch MCP HTTP Server Started');
        console.error(`Server: http://localhost:${PORT}`);
        console.error(`Endpoint: POST http://localhost:${PORT}/mcp (JSON-RPC)`);
        console.error(`Health: GET http://localhost:${PORT}/health`);
        console.error('');
        console.error('Available tools:');
        console.error('  - elasticsearch_search');
        console.error('  - elasticsearch_index_document');
        console.error('  - elasticsearch_get_indices');
        console.error('');
        console.error('💡 Test with:');
        console.error(`   curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`);
        console.error('');
        console.error('Ready to accept connections...');
    });
}

main();

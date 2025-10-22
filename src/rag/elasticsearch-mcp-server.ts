import 'dotenv/config';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Client } from '@elastic/elasticsearch';

// Elasticsearch client configuration
const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

const server = new Server(
    {
        name: "elasticsearch-mcp-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "elasticsearch_search",
                description: "Search documents in Elasticsearch index",
                inputSchema: {
                    type: "object",
                    properties: {
                        index: { 
                            type: "string", 
                            description: "Index to search" 
                        },
                        query: { 
                            type: "string", 
                            description: "Search query" 
                        },
                        size: { 
                            type: "number", 
                            description: "Max results (default: 10)" 
                        },
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
                        index: { 
                            type: "string", 
                            description: "Index name" 
                        },
                        document: { 
                            type: "object", 
                            description: "Document to index" 
                        },
                        id: { 
                            type: "string", 
                            description: "Optional document ID" 
                        },
                    },
                    required: ["index", "document"],
                },
            },
            {
                name: "elasticsearch_get_indices",
                description: "Get list of all Elasticsearch indices",
                inputSchema: { 
                    type: "object", 
                    properties: {} 
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "elasticsearch_search": {
            const { index, query, size = 10 } = request.params.arguments as { 
                index: string; 
                query: string; 
                size?: number 
            };
            
            const esQuery = {
                index,
                query: {
                    multi_match: { query, fields: ['*'] },
                },
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

        case "elasticsearch_index_document": {
            const { index, document, id } = request.params.arguments as { 
                index: string; 
                document: any; 
                id?: string 
            };
            
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
                content: [{
                    type: "text",
                    text: JSON.stringify(indices, null, 2),
                }],
            };
        }

        default:
            throw new Error(`Unknown tool: ${request.params.name}`);
    }
});

async function main() {
    try {
        const info = await esClient.info();
        console.error(`✅ Connected to Elasticsearch ${info.version?.number}`);
        console.error(`📍 Elasticsearch URL: ${process.env.ELASTICSEARCH_URL || 'http://localhost:9200'}`);
    } catch (error) {
        console.error('⚠️  Could not connect to Elasticsearch');
        console.error(`   Make sure Elasticsearch is running on: ${process.env.ELASTICSEARCH_URL || 'http://localhost:9200'}`);
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Elasticsearch MCP server running on stdio");
}

main();

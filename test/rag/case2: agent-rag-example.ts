import 'dotenv/config';
import { createAgent, tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Client } from '@elastic/elasticsearch';
import * as z from "zod";

// Prerequisites:
// 1. Start Elasticsearch: yarn elasticsearch:start
// 2. Setup sample data: yarn elasticsearch:setup

// Elasticsearch client
const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// AI model
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
});

// Tool: Search products in catalog
const searchProductsTool = tool(
    async (input: { query: string; maxResults?: number }) => {
        const { query, maxResults = 5 } = input;
        
        console.log(`  🔍 Searching for: "${query}"`);
        
        const esQuery = {
            index: 'products',
            query: {
                multi_match: {
                    query,
                    fields: ['name', 'description', 'category']
                }
            },
            size: maxResults
        };
        
        console.log('  📤 Elasticsearch Query:');
        console.log(JSON.stringify(esQuery, null, 2));
        console.log();
        
        try {
            const searchResult = await esClient.search(esQuery);
            
            // Debug: Show raw ES response
            console.log('  📥 Elasticsearch Results:');
            console.log(`     Total hits: ${typeof searchResult.hits.total === 'object' ? searchResult.hits.total.value : searchResult.hits.total}`);
            console.log(`     Max score: ${searchResult.hits.max_score}`);
            searchResult.hits.hits.forEach((hit: any, i: number) => {
                console.log(`     ${i + 1}. [Score: ${hit._score?.toFixed(2)}] ${hit._source.name} ($${hit._source.price})`);
            });
            console.log();
            
            const products = searchResult.hits.hits.map((hit: any) => hit._source);
            
            if (products.length === 0) {
                return "No products found matching that query.";
            }
            
            // Return structured product information
            const result = products.map((p: any) => ({
                name: p.name,
                category: p.category,
                price: p.price,
                description: p.description,
                stock: p.stock
            }));
            
            console.log(`  ✅ Found ${result.length} products\n`);
            
            return JSON.stringify(result, null, 2);
            
        } catch (error) {
            return `Error searching products: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
    {
        name: "search_products",
        description: "Search for products in our catalog. Use this when customers ask about products, prices, or availability. You can search by product name, category, or description.",
        schema: z.object({
            query: z.string().describe("The search query - can be product name, category, or keywords from description"),
            maxResults: z.number().optional().describe("Maximum number of results to return (default: 5)"),
        }),
    }
);

// System prompt for shopping assistant
const systemPrompt = `You are a helpful and friendly shopping assistant for an electronics store.

Your goal is to help customers find the right products for their needs.

When a customer asks about products:
1. Use the search_products tool to find relevant items in our catalog
2. Recommend products that best match their needs
3. Explain why each product is a good fit
4. Always mention the price and availability (stock)
5. Be honest if we don't have exactly what they're looking for

Be conversational and helpful. Ask clarifying questions if needed.`;

async function main() {
    try {
        // Test Elasticsearch connection
        const info = await esClient.info();
        console.log(`✅ Connected to Elasticsearch ${info.version?.number}\n`);
        
        console.log('═══════════════════════════════════════════════════');
        console.log('   Agent-Based RAG - Product Catalog Assistant');
        console.log('═══════════════════════════════════════════════════\n');
        
        // Create the agent with the search tool
        const agent = createAgent({
            model,
            systemPrompt,
            tools: [searchProductsTool],
        });
        
        // Example 1: Looking for a laptop
        console.log('💬 Customer: "I need a powerful laptop for work"\n');
        
        const response1 = await agent.invoke({
            messages: [
                { role: "user", content: "I need a powerful laptop for work" }
            ],
        });
        
        console.log('🤖 Assistant:');
        console.log('─'.repeat(50));
        console.log(response1.messages[response1.messages.length - 1].content);
        console.log('═'.repeat(50));
        console.log();
        
        
    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
    
    console.log('\n✅ Demo complete!');
}

main();


import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Client } from '@elastic/elasticsearch';

// Prerequisites:
// 1. Start Elasticsearch: yarn elasticsearch:start
// 2. Setup sample data: yarn elasticsearch:setup

// Direct Elasticsearch client
const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// AI model
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
});

// Simple RAG: Search + AI Generation
async function findProductsForUser(userQuery: string) {
    console.log(`\n🔍 User question: "${userQuery}"\n`);

    // Step 1: Search Elasticsearch for relevant products
    console.log('📦 Searching product catalog...');
    
    const esQuery = {
        index: 'products',
        query: {
            multi_match: {
                query: userQuery,
                fields: ['name', 'description', 'category']
            }
        },
        size: 5
    };
    
    console.log('📤 Elasticsearch Query:');
    console.log(JSON.stringify(esQuery, null, 2));
    console.log();
    
    const searchResult = await esClient.search(esQuery);

    // Debug: Show raw ES response
    console.log('🔍 Elasticsearch Query Results:');
    console.log(`   Total hits: ${typeof searchResult.hits.total === 'object' ? searchResult.hits.total.value : searchResult.hits.total}`);
    console.log(`   Max score: ${searchResult.hits.max_score}`);
    console.log('\n📋 Matching documents:');
    searchResult.hits.hits.forEach((hit: any, i: number) => {
        console.log(`   ${i + 1}. [Score: ${hit._score?.toFixed(2)}] ${hit._source.name}`);
        console.log(`      ID: ${hit._id}`);
        console.log(`      Category: ${hit._source.category}`);
        console.log(`      Price: $${hit._source.price}`);
    });
    console.log();

    const products = searchResult.hits.hits.map((hit: any) => hit._source);
    console.log(`✅ Found ${products.length} products\n`);

    if (products.length === 0) {
        return "I couldn't find any products matching your query. Please try different keywords.";
    }

    // Step 2: Create context from search results
    const context = products.map((p: any, i: number) =>
        `${i + 1}. ${p.name} ($${p.price})
   Category: ${p.category}
   Description: ${p.description}
   In Stock: ${p.stock} units`
    ).join('\n\n');

    // Step 3: Ask AI to generate helpful response
    console.log('🤖 Generating AI response...\n');
    const prompt = `You are a helpful shopping assistant. A customer asked: "${userQuery}"

Here are the available products from our catalog:

${context}

Please provide a helpful, friendly response that:
1. Answers the customer's question
2. Recommends the most suitable products
3. Explains why each recommendation fits their needs
4. Mentions price and availability

Response:`;

    const response = await model.invoke(prompt);

    return response.content;
}

async function main() {
    try {
        // Test Elasticsearch connection
        const info = await esClient.info();
        console.log(`✅ Connected to Elasticsearch ${info.version?.number}\n`);

        console.log('═══════════════════════════════════════════════════');
        console.log('   Simple RAG Example - Product Catalog Assistant');
        console.log('═══════════════════════════════════════════════════');

        // Example 1: Looking for a laptop
        let answer = await findProductsForUser("I need a powerful laptop for work");
        console.log('💬 AI Assistant:');
        console.log('─'.repeat(50));
        console.log(answer);
        console.log('═'.repeat(50));


    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }

    console.log('\n✅ Demo complete!');
}

main();


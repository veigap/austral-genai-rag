import 'dotenv/config';
import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// Prerequisites:
// 1. Start Elasticsearch: yarn elasticsearch:start
// 2. Start MCP HTTP server: yarn mcp:elasticsearch

const MCP_SERVER_URL = 'http://localhost:8001/mcp';

// AI model
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
});

// System prompt - just defines agent behavior, tools are auto-discovered
const systemPrompt = `You are a helpful and friendly shopping assistant for an electronics store.

When helping customers:
1. Search for products that match their needs
2. Recommend the best options and explain why
3. Always mention price and availability
4. Be conversational and helpful

Use the search tools to find products in our catalog.`;

async function main() {
    let mcpClient: MultiServerMCPClient | null = null;
    
    try {
        console.log('═══════════════════════════════════════════════════');
        console.log('   Agent with MCP (HTTP) - Product Assistant');
        console.log('═══════════════════════════════════════════════════\n');
        
        // Create MCP client that connects to HTTP server
        console.log(`🔌 Connecting to MCP HTTP server at ${MCP_SERVER_URL}...`);
        mcpClient = new MultiServerMCPClient({
            elasticsearch: {
                type: "http",
                url: MCP_SERVER_URL
            }
        });
        
        // Initialize and get tools - automatically converted to LangChain format
        await mcpClient.initializeConnections();
        const tools = await mcpClient.getTools();
        
        console.log(`✅ Loaded ${tools.length} tools from MCP:\n`);
        tools.forEach(tool => console.log(`   - ${tool.name}: ${tool.description}`));
        console.log();
        
        // Create agent with MCP tools
        const agent = createAgent({
            model,
            systemPrompt,
            tools,
        });
        
        // Example 1: Product search
        console.log('💬 Customer: "I need a laptop for programming"\n');
        
        const response1 = await agent.invoke({
            messages: [
                { role: "user", content: "I need a laptop for programming" }
            ],
        });
        
        console.log('🤖 Assistant:');
        console.log('─'.repeat(50));
        console.log(response1.messages[response1.messages.length - 1].content);
        console.log('═'.repeat(50));
        console.log();
        
        console.log('\n✅ Demo complete!');
        console.log('\n📝 MCP stdio Benefits:');
        console.log('   ✅ Auto-discovers tools from MCP server');
        console.log('   ✅ Auto-starts MCP server as child process');
        console.log('   ✅ Converts tools to LangChain format');
        console.log('   ✅ No manual tool definitions needed');
        console.log('   ✅ Process isolation via stdio');
        console.log('   ✅ Handles all MCP protocol communication');

    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        console.error('\n💡 Make sure to:');
        console.error('   1. Start Elasticsearch: yarn elasticsearch:start');
        console.error('   2. MCP server auto-starts via stdio (no manual step needed!)');
        console.error('   3. Check that .env has GOOGLE_API_KEY set');
        process.exit(1);
    } finally {
        // Clean up: close MCP connections
        if (mcpClient) {
            console.log('\n🔌 Closing MCP connections...');
            try {
                await mcpClient.close();
            } catch (err) {
                // Ignore close errors
            }
        }
        // Force exit to ensure child processes are killed
        process.exit(0);
    }
}

main();


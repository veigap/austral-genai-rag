import 'dotenv/config';
import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// Prerequisites:
// 1. Start ChromaDB + MCP server: yarn chroma:start
// 2. Everything runs in Docker - no local installs needed! ✅

// AI model
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
});

// System prompt - just defines agent behavior, tools are auto-discovered
const systemPrompt = `You are a helpful and friendly shopping assistant for an electronics store.

When helping customers:
1. Search for products that match their needs using semantic search
2. Recommend the best options and explain why
3. Always mention price and availability
4. Be conversational and helpful

Use the Chroma search tools to find products in our catalog.`;

const MCP_SERVER_URL = 'http://localhost:8002/mcp';

async function main() {
    let mcpClient: MultiServerMCPClient | null = null;
    
    try {
        console.log('═══════════════════════════════════════════════════');
        console.log('   Agent with MCP (Chroma) - Product Assistant');
        console.log('═══════════════════════════════════════════════════\n');
        
        // Create MCP client that connects to HTTP server
        console.log(`🔌 Connecting to ChromaDB MCP HTTP server at ${MCP_SERVER_URL}...`);
        console.log('📐 Semantic search using MiniLM-L6-v2 embeddings (default)\n');
        
        mcpClient = new MultiServerMCPClient({
            chroma: {
                type: "http",
                url: MCP_SERVER_URL
            }
        });
        
        // Initialize and get tools - automatically converted to LangChain format
        await mcpClient.initializeConnections();
        const tools = await mcpClient.getTools();
        
        console.log(`✅ Connected to ChromaDB MCP server`);
        console.log(`📦 Available tools: ${tools.length}`);
        tools.forEach((tool, i) => {
            console.log(`   ${i + 1}. ${tool.name}`);
        });
        console.log();
        
        // Create agent with auto-discovered tools
        console.log('🤖 Creating AI agent...');
        const agent = createAgent({
            model,
            systemPrompt,
            tools,
        });
        console.log('✅ Agent created\n');
        
        // Test query
        const userQuery = "I need a good laptop for programming and development work. What do you recommend?";
        
        console.log('═══════════════════════════════════════════════════');
        console.log('👤 User Query:');
        console.log(`   "${userQuery}"`);
        console.log('═══════════════════════════════════════════════════\n');
        
        console.log('🤔 Agent thinking...\n');
        
        // Stream the response
        const stream = await agent.stream({ messages: [{ role: "user", content: userQuery }] });
        
        let fullResponse = '';
        for await (const chunk of stream) {
            if (chunk.messages && chunk.messages.length > 0) {
                const lastMessage = chunk.messages[chunk.messages.length - 1];
                if (lastMessage.role === 'assistant' && typeof lastMessage.content === 'string') {
                    const newContent = lastMessage.content.slice(fullResponse.length);
                    if (newContent) {
                        process.stdout.write(newContent);
                        fullResponse = lastMessage.content;
                    }
                }
            }
        }
        
        console.log('\n');
        console.log('═══════════════════════════════════════════════════');
        console.log('✅ Query complete!');
        console.log('═══════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error);
        
        if (error instanceof Error && error.message.includes('Failed to connect')) {
            console.error('\n💡 Tip: Make sure ChromaDB + MCP server are running:');
            console.error('   $ yarn chroma:start\n');
        }
        
        process.exit(1);
    } finally {
        // Clean up MCP client and exit
        if (mcpClient) {
            console.log('🔌 Closing MCP connection...');
            await mcpClient.close();
        }
        process.exit(0);
    }
}

main();


import 'dotenv/config';
import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// Prerequisites:
// 1. Start ChromaDB: yarn chroma:start
// 2. Install chroma-mcp: pip install chroma-mcp (or use uvx)
// 3. MCP server auto-starts via stdio (no manual step needed)

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

async function main() {
    let mcpClient: MultiServerMCPClient | null = null;
    
    try {
        console.log('═══════════════════════════════════════════════════');
        console.log('   Agent with MCP (Chroma) - Product Assistant');
        console.log('═══════════════════════════════════════════════════\n');
        
        // Create MCP client that auto-spawns the chroma-mcp Python server via stdio
        console.log('🔌 Starting Chroma MCP server via stdio...');
        
        // For educational purposes: Show embedding configuration
        const embeddingFunction = process.env.CHROMA_EMBEDDING_FUNCTION || 'default';
        console.log(`📐 Embedding function: ${embeddingFunction}`);
        console.log('   - default: MiniLM-L6-v2 (no API key needed)');
        console.log('   - openai: text-embedding-ada-002 (requires OPENAI_API_KEY)');
        console.log('   - cohere, jina, voyageai, roboflow (require respective API keys)');
        console.log();
        
        mcpClient = new MultiServerMCPClient({
            chroma: {
                type: "stdio",
                command: "uvx",
                args: ["chroma-mcp"],
                env: {
                    ...process.env,
                    CHROMA_URL: process.env.CHROMA_URL || 'http://localhost:8000',
                    CHROMA_CLIENT_TYPE: 'http',  // Use HTTP client to connect to our Docker Chroma
                    CHROMA_EMBEDDING_FUNCTION: embeddingFunction,
                    // If using OpenAI embeddings, the API key would be passed here:
                    // OPENAI_API_KEY: process.env.OPENAI_API_KEY
                }
            }
        });
        
        // Initialize and get tools - automatically converted to LangChain format
        await mcpClient.initializeConnections();
        const tools = await mcpClient.getTools();
        
        console.log(`✅ Connected to Chroma MCP server`);
        console.log(`📦 Available tools: ${tools.length}`);
        tools.forEach((tool, i) => {
            console.log(`   ${i + 1}. ${tool.name}: ${tool.description}`);
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
        console.error('❌ Error:', error);
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


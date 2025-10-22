import 'dotenv/config';
import { ChromaClient } from 'chromadb';
import * as readline from 'readline';

const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
const url = new URL(chromaUrl);
const client = new ChromaClient({ host: url.hostname, port: parseInt(url.port) || 8000 });

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function listCollections() {
    console.log('\n📚 Available Collections:');
    console.log('─'.repeat(50));
    const collections = await client.listCollections();
    if (collections.length === 0) {
        console.log('   No collections found');
    } else {
        for (const collection of collections) {
            try {
                const coll = await client.getCollection({ name: collection.name });
                const countInfo = await coll.count();
                console.log(`   📦 ${collection.name} (${countInfo} documents)`);
                if (collection.metadata) {
                    console.log(`      Metadata: ${JSON.stringify(collection.metadata)}`);
                }
            } catch (error) {
                console.log(`   📦 ${collection.name} (error getting count)`);
            }
        }
    }
    console.log('─'.repeat(50));
}

async function queryCollection(collectionName: string, query: string, nResults: number = 5) {
    try {
        const collection = await client.getCollection({ name: collectionName });
        
        console.log(`\n🔍 Searching "${collectionName}" for: "${query}"`);
        console.log('─'.repeat(50));
        
        const results = await collection.query({
            queryTexts: [query],
            nResults
        });
        
        if (results.ids[0].length === 0) {
            console.log('   No results found');
            return;
        }
        
        console.log(`   Found ${results.ids[0].length} results:\n`);
        
        for (let i = 0; i < results.ids[0].length; i++) {
            const id = results.ids[0][i];
            const document = results.documents[0][i];
            const metadata = results.metadatas[0][i];
            const distance = results.distances?.[0][i];
            
            console.log(`   ${i + 1}. ID: ${id}`);
            if (distance !== undefined && distance !== null) {
                console.log(`      Distance: ${distance.toFixed(4)} (lower is better)`);
            }
            if (metadata) {
                console.log(`      Metadata:`, JSON.stringify(metadata, null, 2).split('\n').join('\n      '));
            }
            console.log(`      Document: ${document}`);
            console.log();
        }
        
        console.log('─'.repeat(50));
        
    } catch (error) {
        console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function peekCollection(collectionName: string, limit: number = 5) {
    try {
        const collection = await client.getCollection({ name: collectionName });
        
        console.log(`\n👀 Peeking at "${collectionName}" (limit: ${limit})`);
        console.log('─'.repeat(50));
        
        const results = await collection.peek({ limit });
        
        if (results.ids.length === 0) {
            console.log('   Collection is empty');
            return;
        }
        
        console.log(`   Showing ${results.ids.length} documents:\n`);
        
        for (let i = 0; i < results.ids.length; i++) {
            const id = results.ids[i];
            const document = results.documents[i];
            const metadata = results.metadatas[i];
            
            console.log(`   ${i + 1}. ID: ${id}`);
            if (metadata) {
                console.log(`      Metadata:`, JSON.stringify(metadata, null, 2).split('\n').join('\n      '));
            }
            console.log(`      Document: ${document}`);
            console.log();
        }
        
        console.log('─'.repeat(50));
        
    } catch (error) {
        console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function showHelp() {
    console.log('\n📖 Available Commands:');
    console.log('─'.repeat(50));
    console.log('   list                    - List all collections');
    console.log('   peek <collection>       - Show first 5 documents');
    console.log('   peek <collection> <n>   - Show first N documents');
    console.log('   query <collection> <text> - Search collection');
    console.log('   query <collection> <text> <n> - Search with N results');
    console.log('   help                    - Show this help');
    console.log('   exit                    - Exit console');
    console.log('─'.repeat(50));
    console.log('\nExamples:');
    console.log('   > list');
    console.log('   > peek products');
    console.log('   > peek products 10');
    console.log('   > query products laptop');
    console.log('   > query products wireless mouse 3');
    console.log();
}

async function processCommand(input: string) {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    
    switch (command) {
        case 'list':
            await listCollections();
            break;
            
        case 'peek':
            if (parts.length < 2) {
                console.log('❌ Usage: peek <collection> [limit]');
            } else {
                const collection = parts[1];
                const limit = parts.length > 2 ? parseInt(parts[2]) : 5;
                await peekCollection(collection, limit);
            }
            break;
            
        case 'query':
            if (parts.length < 3) {
                console.log('❌ Usage: query <collection> <search text> [n_results]');
            } else {
                const collection = parts[1];
                const lastPart = parts[parts.length - 1];
                const isNumber = !isNaN(parseInt(lastPart));
                
                let nResults = 5;
                let queryParts = parts.slice(2);
                
                if (isNumber && parts.length > 3) {
                    nResults = parseInt(lastPart);
                    queryParts = parts.slice(2, -1);
                }
                
                const query = queryParts.join(' ');
                await queryCollection(collection, query, nResults);
            }
            break;
            
        case 'help':
            await showHelp();
            break;
            
        case 'exit':
        case 'quit':
            console.log('\n👋 Goodbye!\n');
            rl.close();
            process.exit(0);
            break;
            
        case '':
            break;
            
        default:
            console.log(`❌ Unknown command: ${command}`);
            console.log('   Type "help" for available commands');
    }
}

async function main() {
    try {
        console.log('╔════════════════════════════════════════════════════╗');
        console.log('║       ChromaDB Interactive Query Console          ║');
        console.log('╚════════════════════════════════════════════════════╝');
        console.log(`\n📍 Connected to: ${chromaUrl}\n`);
        
        const version = await client.version();
        console.log(`✅ ChromaDB version: ${version}`);
        
        await showHelp();
        
        const prompt = () => {
            rl.question('chroma> ', async (input) => {
                await processCommand(input);
                prompt();
            });
        };
        
        prompt();
        
    } catch (error) {
        console.error('❌ Failed to connect to ChromaDB:', error);
        console.error(`   Make sure ChromaDB is running on ${chromaUrl}`);
        console.error('   Start it with: yarn chroma:start');
        process.exit(1);
    }
}

main();


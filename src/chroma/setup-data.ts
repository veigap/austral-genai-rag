import 'dotenv/config';
import { ChromaClient } from 'chromadb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load shared product data
const productsPath = join(__dirname, '../../data/products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

async function setupChromaData() {
    try {
        console.log('🔌 Connecting to ChromaDB...');
        
        const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
        console.log(`   Trying to connect to: ${chromaUrl}`);
        
        // Parse URL to get host and port
        const url = new URL(chromaUrl);
        console.log(`   Host: ${url.hostname}, Port: ${url.port || 8000}`);
        
        const client = new ChromaClient({ 
            host: url.hostname, 
            port: parseInt(url.port) || 8000 
        });
        
        // Test connection
        console.log('   Testing connection...');
        const version = await client.version();
        console.log(`✅ Connected to ChromaDB version ${version}`);
        console.log(`📍 ChromaDB URL: ${chromaUrl}`);
        
        // Delete collection if it exists (for clean setup)
        try {
            await client.deleteCollection({ name: 'products' });
            console.log('🗑️  Deleted existing "products" collection');
        } catch (error) {
            // Collection doesn't exist, that's fine
        }
        
        // Create collection with explicit embedding configuration
        // For educational purposes: we explicitly set the embedding function
        // even though 'default' is what ChromaDB uses by default
        console.log('📦 Creating "products" collection...');
        console.log(`📄 Loading products from: data/products.json`);
        console.log('🔧 Embedding: MiniLM-L6-v2 (default, runs locally via OnnxRuntime)');
        
        // Note: You can change this to 'openai', 'cohere', 'jina', etc.
        // and set the corresponding API key in environment variables
        const embeddingFunction = process.env.CHROMA_EMBEDDING_FUNCTION || 'default';
        console.log(`📐 Using embedding function: ${embeddingFunction}`);
        
        const collection = await client.createCollection({
            name: 'products',
            metadata: { 
                description: 'Product catalog for e-commerce',
                embedding_function: embeddingFunction
            }
        });
        
        // Prepare data for ChromaDB
        const ids = products.map((p: any) => p.id);
        const documents = products.map((p: any) => 
            `${p.name}. ${p.description}. Category: ${p.category}. Price: $${p.price}${p.stock ? `. Stock: ${p.stock}` : ''}`
        );
        const metadatas = products.map((p: any) => ({
            name: p.name,
            category: p.category,
            price: p.price,
            description: p.description,
            ...(p.stock && { stock: p.stock })
        }));
        
        // Add documents to collection
        console.log(`📝 Adding ${products.length} products to collection...`);
        await collection.add({
            ids,
            documents,
            metadatas
        });
        
        console.log('✅ Data initialization complete!');
        console.log('\n📊 Summary:');
        console.log(`   Collection: products`);
        console.log(`   Documents: ${products.length}`);
        console.log('\n🔍 Sample products:');
        products.slice(0, 3).forEach((p: any) => {
            console.log(`   - ${p.name} ($${p.price}) - ${p.category}`);
        });
        
        // Verify by querying
        console.log('\n🧪 Testing query: "laptop"...');
        const results = await collection.query({
            queryTexts: ['laptop'],
            nResults: 2
        });
        console.log(`   Found ${results.ids[0].length} results`);
        
        console.log('\n✨ ChromaDB is ready for queries!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error setting up ChromaDB:', error);
        process.exit(1);
    }
}

setupChromaData();

